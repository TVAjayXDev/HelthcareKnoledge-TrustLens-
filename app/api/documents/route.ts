import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/db/supabase-server";
import { computeFreshness } from "@/lib/ai/ingest";
import { TierNumber, DocumentRecord } from "@/lib/contract";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = getAdminSupabase();
    const { data: rawDocs, error } = await supabase
      .from("documents")
      .select("*")
      .order("tier", { ascending: true })
      .order("id", { ascending: true });

    if (error || !rawDocs) {
      return NextResponse.json([], { status: 200 });
    }

    const documents: DocumentRecord[] = rawDocs.map((doc) => {
      const isSuperseded = doc.freshness === "superseded" || !!doc.newer_version_id;
      const computed = computeFreshness(doc.next_review, doc.freshness);
      const freshness = isSuperseded ? "superseded" : computed.freshness;
      const daysOverdue = isSuperseded ? 0 : computed.daysOverdue;
      return {
        id: doc.id,
        title: doc.title,
        version: doc.version || "1.0",
        tier: (doc.tier || 4) as TierNumber,
        docType: doc.doc_type || "Policy",
        owner: doc.owner || "Clinical Operations",
        approver: doc.approver || "Governance Board",
        department: doc.department || "General Operations",
        payer: doc.payer || undefined,
        effectiveDate: doc.effective_date,
        lastReviewed: doc.last_reviewed,
        nextReview: doc.next_review,
        freshness,
        daysOverdue,
        newerVersionId: doc.newer_version_id || undefined,
        fileUrl: doc.file_url,
        checksum: doc.checksum,
      };
    });

    return NextResponse.json(documents, { status: 200 });
  } catch (err) {
    console.error("[Public Documents API Error]:", err);
    return NextResponse.json([], { status: 200 });
  }
}
