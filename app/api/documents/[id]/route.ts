import { NextRequest, NextResponse } from "next/server";
import { getMockDocument, getMockDocumentPages } from "@/lib/mock/documents";
import { getAdminSupabase } from "@/lib/db/supabase-server";
import { computeFreshness } from "@/lib/ai/ingest";
import { DocumentRecord, TierNumber } from "@/lib/contract";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const useMock = process.env.USE_MOCK === "true";
  if (useMock) {
    const document = getMockDocument(id);
    if (!document) {
      return NextResponse.json({ error: `Document '${id}' not found` }, { status: 404 });
    }
    const pages = getMockDocumentPages(id);
    return NextResponse.json({ document, pages }, { status: 200 });
  }

  // Live Supabase Document Lookup & Signed URL
  const supabase = getAdminSupabase();
  const { data: rawDoc, error } = await supabase
    .from("documents")
    .select("*")
    .ilike("id", id)
    .maybeSingle();

  if (error || !rawDoc) {
    // Fall back to mock if not yet seeded
    const mock = getMockDocument(id);
    if (mock) {
      return NextResponse.json({ document: mock, pages: getMockDocumentPages(id) });
    }
    return NextResponse.json({ error: `Document '${id}' not found` }, { status: 404 });
  }

  // Recompute freshness dynamically
  const { freshness, daysOverdue } = computeFreshness(rawDoc.next_review);
  const document: DocumentRecord = {
    id: rawDoc.id,
    title: rawDoc.title,
    version: rawDoc.version,
    tier: rawDoc.tier as TierNumber,
    docType: rawDoc.doc_type,
    owner: rawDoc.owner,
    approver: rawDoc.approver,
    department: rawDoc.department,
    payer: rawDoc.payer || undefined,
    effectiveDate: rawDoc.effective_date,
    lastReviewed: rawDoc.last_reviewed,
    nextReview: rawDoc.next_review,
    freshness,
    daysOverdue,
    newerVersionId: rawDoc.newer_version_id || undefined,
    fileUrl: rawDoc.file_url,
    checksum: rawDoc.checksum,
  };

  // Generate short-lived signed URL (valid for 1 hour)
  let signedUrl: string | null = null;
  const storagePath = `${rawDoc.id}.pdf`;
  try {
    const { data: signedData } = await supabase.storage
      .from("documents")
      .createSignedUrl(storagePath, 3600);
    signedUrl = signedData?.signedUrl || null;
  } catch {
    // Storage signed URL optional fallback
  }

  // Fetch chunk pages for document reader
  const { data: rawChunks } = await supabase
    .from("chunks")
    .select("page, content, section")
    .eq("document_id", rawDoc.id)
    .order("chunk_index", { ascending: true });

  const pagesMap = new Map<number, string[]>();
  (rawChunks || []).forEach((c) => {
    const p = c.page || 1;
    if (!pagesMap.has(p)) pagesMap.set(p, []);
    pagesMap.get(p)!.push(`${c.section}:\n${c.content}`);
  });

  const pages = Array.from(pagesMap.entries()).map(([page, contents]) => ({
    page,
    text: contents.join("\n\n"),
  }));

  return NextResponse.json({ document, signedUrl, pages }, { status: 200 });
}
