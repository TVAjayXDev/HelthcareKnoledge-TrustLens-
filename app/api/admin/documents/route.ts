import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/db/supabase-server";
import { requireAdmin, logAdminActivity } from "@/lib/auth/requireAdmin";
import { computeFreshness } from "@/lib/ai/ingest";
import { TierNumber } from "@/lib/contract";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;

    const supabase = getAdminSupabase();

    // 1. Fetch all documents
    const { data: rawDocs, error: docError } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (docError) {
      return NextResponse.json({ error: docError.message }, { status: 500 });
    }

    // 2. Fetch chunk counts per document
    const { data: chunks, error: chunkError } = await supabase
      .from("chunks")
      .select("document_id");

    const chunkCounts: Record<string, number> = {};
    if (!chunkError && chunks) {
      for (const c of chunks) {
        chunkCounts[c.document_id] = (chunkCounts[c.document_id] || 0) + 1;
      }
    }

    // 3. Format documents with dynamic freshness (preserving superseded state)
    const documents = (rawDocs || []).map((doc) => {
      const isSuperseded = doc.freshness === "superseded" || !!doc.newer_version_id;
      const computed = computeFreshness(doc.next_review);
      const freshness = isSuperseded ? "superseded" : computed.freshness;
      const daysOverdue = isSuperseded ? 0 : computed.daysOverdue;
      return {
        id: doc.id,
        title: doc.title,
        version: doc.version || "1.0",
        tier: doc.tier as TierNumber,
        docType: doc.doc_type,
        owner: doc.owner || "Clinical Operations",
        approver: doc.approver || "Governance Board",
        department: doc.department,
        payer: doc.payer || null,
        effectiveDate: doc.effective_date,
        lastReviewed: doc.last_reviewed,
        nextReview: doc.next_review,
        freshness,
        daysOverdue,
        newerVersionId: doc.newer_version_id || null,
        fileUrl: doc.file_url,
        checksum: doc.checksum,
        chunkCount: chunkCounts[doc.id] || 0,
        createdAt: doc.created_at,
      };
    });

    await logAdminActivity(auth.user.id, "documents_list_view", "catalog", {
      totalDocuments: documents.length,
    });

    return NextResponse.json({ documents }, { status: 200 });
  } catch (err: unknown) {
    console.error("[Admin Documents GET Error]:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
