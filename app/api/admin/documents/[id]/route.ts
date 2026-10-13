import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/db/supabase-server";
import { requireAdmin, logAdminActivity } from "@/lib/auth/requireAdmin";
import { computeFreshness, parseDateToISO } from "@/lib/ai/ingest";
import { TierNumber } from "@/lib/contract";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;

    const { id } = await params;
    const body = await req.json();

    const supabase = getAdminSupabase();

    // 1. Fetch current document
    const { data: currentDoc, error: fetchErr } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr || !currentDoc) {
      return NextResponse.json({ error: `Document '${id}' not found.` }, { status: 404 });
    }

    // 2. Prepare updated fields and dynamic freshness
    const nextReview = body.nextReview !== undefined ? parseDateToISO(body.nextReview) : currentDoc.next_review;
    const status = body.status || "";
    const isSuperseded = (status === "superseded") || (currentDoc.freshness === "superseded" && body.status === undefined) || !!currentDoc.newer_version_id;
    const computed = computeFreshness(nextReview, status);
    const freshness = isSuperseded ? "superseded" : computed.freshness;
    const daysOverdue = isSuperseded ? 0 : computed.daysOverdue;

    const updates: Record<string, unknown> = {
      title: body.title !== undefined ? body.title : currentDoc.title,
      version: body.version !== undefined ? body.version : currentDoc.version,
      tier: body.tier !== undefined ? (Number(body.tier) as TierNumber) : currentDoc.tier,
      doc_type: body.docType !== undefined ? body.docType : currentDoc.doc_type,
      owner: body.owner !== undefined ? body.owner : currentDoc.owner,
      approver: body.approver !== undefined ? body.approver : currentDoc.approver,
      department: body.department !== undefined ? body.department : currentDoc.department,
      payer: body.payer !== undefined ? body.payer : currentDoc.payer,
      effective_date: body.effectiveDate !== undefined ? parseDateToISO(body.effectiveDate) : currentDoc.effective_date,
      last_reviewed: body.lastReviewed !== undefined ? parseDateToISO(body.lastReviewed) : currentDoc.last_reviewed,
      next_review: nextReview,
      freshness,
      days_overdue: daysOverdue,
    };

    const { data: updatedDoc, error: updateErr } = await supabase
      .from("documents")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    await logAdminActivity(auth.user.id, "document_update", id, {
      updatedFields: Object.keys(body),
      newFreshness: freshness,
    });

    return NextResponse.json({ success: true, document: updatedDoc }, { status: 200 });
  } catch (err: unknown) {
    console.error("[Admin Document PATCH Error]:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;

    const { id } = await params;
    const supabase = getAdminSupabase();

    // 1. Delete chunks
    await supabase.from("chunks").delete().eq("document_id", id);

    // 2. Remove PDF from storage bucket
    try {
      await supabase.storage.from("documents").remove([`${id}.pdf`]);
    } catch (storageErr) {
      console.warn("[Admin Delete] Storage file removal warning:", storageErr);
    }

    // 3. Delete document row
    const { error: deleteErr } = await supabase.from("documents").delete().eq("id", id);
    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 500 });
    }

    await logAdminActivity(auth.user.id, "document_delete", id, {
      deletedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id }, { status: 200 });
  } catch (err: unknown) {
    console.error("[Admin Document DELETE Error]:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
