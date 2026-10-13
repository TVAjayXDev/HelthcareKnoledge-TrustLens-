import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/db/supabase-server";
import { requireAdmin, logAdminActivity } from "@/lib/auth/requireAdmin";
import { getStagedDocument, removeStagedDocument } from "@/lib/ai/previewStore";
import { chunkDocumentPages, computeFreshness, parseDateToISO } from "@/lib/ai/ingest";
import { embed } from "@/lib/ai/llm";
import { DocumentRecord, TierNumber } from "@/lib/contract";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const { token, metadata } = body || {};

    if (!token) {
      return NextResponse.json({ error: "Missing required staging token." }, { status: 400 });
    }

    const staged = getStagedDocument(token);
    if (!staged) {
      return NextResponse.json(
        { error: "Staged document preview expired or not found. Please re-upload the document." },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();
    const docId = (metadata?.id || staged.extracted.fields.id || staged.filename.replace(/\.pdf$/i, "")).trim();

    // 1. Check exact duplicate by checksum
    const { data: existingByChecksum } = await supabase
      .from("documents")
      .select("*")
      .eq("checksum", staged.checksum)
      .maybeSingle();

    if (existingByChecksum && existingByChecksum.id === docId) {
      removeStagedDocument(token);
      await logAdminActivity(auth.user.id, "document_commit_skipped", docId, {
        reason: "Identical checksum exists",
        checksum: staged.checksum,
      });
      return NextResponse.json(
        {
          message: "Exact duplicate skipped: document already exists with identical checksum.",
          document: existingByChecksum,
          skipped: true,
        },
        { status: 200 }
      );
    }

    // 2. Check if a document with the same ID already exists
    const { data: existingDoc } = await supabase
      .from("documents")
      .select("*")
      .eq("id", docId)
      .maybeSingle();

    if (existingDoc) {
      // Archive old version so it remains searchable as history (superseded)
      const oldVersionStr = (existingDoc.version || "prev").replace(/[^a-zA-Z0-9_-]/g, "");
      const archivedId = `${existingDoc.id}-v${oldVersionStr}-${Date.now().toString().slice(-4)}`;

      // Insert archive copy
      await supabase.from("documents").insert({
        id: archivedId,
        title: `${existingDoc.title} (Archived v${existingDoc.version || "1.0"})`,
        version: existingDoc.version,
        tier: existingDoc.tier,
        doc_type: existingDoc.doc_type,
        owner: existingDoc.owner,
        approver: existingDoc.approver,
        department: existingDoc.department,
        payer: existingDoc.payer,
        effective_date: existingDoc.effective_date,
        last_reviewed: existingDoc.last_reviewed,
        next_review: existingDoc.next_review,
        freshness: "superseded",
        days_overdue: existingDoc.days_overdue,
        newer_version_id: docId,
        file_url: existingDoc.file_url,
        checksum: existingDoc.checksum,
      });

      // Repoint existing chunks to archived document ID so historical queries still find it
      await supabase
        .from("chunks")
        .update({ document_id: archivedId })
        .eq("document_id", docId);
    }

    // 3. Upload file to Supabase Storage
    const storagePath = `${docId}.pdf`;
    try {
      await supabase.storage.from("documents").upload(storagePath, staged.buffer, {
        contentType: "application/pdf",
        upsert: true,
      });
    } catch (storageErr) {
      console.warn("[Admin Commit] Storage upload warning:", storageErr);
    }

    // 4. Compute dynamic freshness for the new document
    const nextReviewISO = parseDateToISO(metadata?.nextReview || staged.extracted.fields.nextReview || null);
    const { freshness, daysOverdue } = computeFreshness(nextReviewISO);

    const documentRecord: DocumentRecord = {
      id: docId,
      title: metadata?.title || staged.extracted.fields.title || "Clinical Policy Document",
      version: metadata?.version || staged.extracted.fields.version || "1.0",
      tier: (metadata?.tier || staged.extracted.fields.tier || 4) as TierNumber,
      docType: metadata?.docType || staged.extracted.fields.docType || "Institutional SOP",
      owner: metadata?.owner || staged.extracted.fields.owner || "Clinical Governance",
      approver: metadata?.approver || staged.extracted.fields.approver || "Medical Executive Committee",
      department: metadata?.department || staged.extracted.fields.department || "General Hospital Operations",
      payer: metadata?.payer || staged.extracted.fields.payer || undefined,
      effectiveDate: parseDateToISO(metadata?.effectiveDate || staged.extracted.fields.effectiveDate || null),
      lastReviewed: parseDateToISO(metadata?.lastReviewed || staged.extracted.fields.lastReviewed || null),
      nextReview: nextReviewISO,
      freshness,
      daysOverdue,
      newerVersionId: metadata?.newerVersionId || undefined,
      fileUrl: `documents/${storagePath}`,
      checksum: staged.checksum,
    };

    // 5. Upsert active document
    const { error: upsertErr } = await supabase.from("documents").upsert({
      id: documentRecord.id,
      title: documentRecord.title,
      version: documentRecord.version,
      tier: documentRecord.tier,
      doc_type: documentRecord.docType,
      owner: documentRecord.owner,
      approver: documentRecord.approver,
      department: documentRecord.department,
      payer: documentRecord.payer || null,
      effective_date: documentRecord.effectiveDate,
      last_reviewed: documentRecord.lastReviewed,
      next_review: documentRecord.nextReview,
      freshness: documentRecord.freshness,
      days_overdue: documentRecord.daysOverdue,
      newer_version_id: documentRecord.newerVersionId || null,
      file_url: documentRecord.fileUrl,
      checksum: documentRecord.checksum,
    });

    if (upsertErr) {
      throw new Error(`Failed to commit document: ${upsertErr.message}`);
    }

    // 6. Section chunking and vector embedding
    const rawPagesText = staged.pages.map((p) => p.text);
    const unmappedChunks = chunkDocumentPages(rawPagesText, docId);

    const chunkTexts = unmappedChunks.map(
      (c) => `${c.section}\n[From ${docId} - ${documentRecord.title}]: ${c.content}`
    );
    const embeddings = await embed(chunkTexts, "RETRIEVAL_DOCUMENT");

    // Clean any prior chunks for this docId (if not repointed) and insert new ones
    await supabase.from("chunks").delete().eq("document_id", docId);

    const chunkRows = unmappedChunks.map((c, idx) => ({
      document_id: docId,
      chunk_index: c.chunkIndex,
      section: c.section,
      page: c.page,
      content: c.content,
      embedding: embeddings[idx],
    }));

    if (chunkRows.length > 0) {
      const { error: chunkErr } = await supabase.from("chunks").insert(chunkRows);
      if (chunkErr) {
        throw new Error(`Failed to store chunks: ${chunkErr.message}`);
      }
    }

    // 7. Remove staged document token from memory
    removeStagedDocument(token);

    // 8. Log administrative action
    await logAdminActivity(auth.user.id, "document_commit", docId, {
      title: documentRecord.title,
      tier: documentRecord.tier,
      version: documentRecord.version,
      chunkCount: chunkRows.length,
      wasReplacement: !!existingDoc,
    });

    return NextResponse.json(
      {
        success: true,
        document: documentRecord,
        chunkCount: chunkRows.length,
        wasReplacement: !!existingDoc,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("[Admin Commit Error]:", err);
    const message = err instanceof Error ? err.message : "Failed to commit document";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
