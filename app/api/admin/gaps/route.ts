import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/db/supabase-server";
import { requireAdmin, logAdminActivity } from "@/lib/auth/requireAdmin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;

    const supabase = getAdminSupabase();

    // 1. Fetch unanswered questions (status = 'no_answer')
    const { data: noAnswers, error: noAnsErr } = await supabase
      .from("questions_log")
      .select("id, question, status, gap_status, closest_documents, created_at, resolved_at, resolved_by")
      .eq("status", "no_answer")
      .order("created_at", { ascending: false });

    if (noAnsErr) {
      return NextResponse.json({ error: noAnsErr.message }, { status: 500 });
    }

    // Group by question text
    const gapMap = new Map<
      string,
      {
        id: string;
        question: string;
        askCount: number;
        lastAsked: string;
        gapStatus: "open" | "resolved";
        resolvedAt: string | null;
        closestDocuments: unknown[];
      }
    >();

    for (const row of noAnswers || []) {
      const q = row.question.trim();
      const existing = gapMap.get(q);
      const gapStatus = (row.gap_status || "open") as "open" | "resolved";

      if (!existing) {
        gapMap.set(q, {
          id: row.id,
          question: q,
          askCount: 1,
          lastAsked: row.created_at,
          gapStatus,
          resolvedAt: row.resolved_at || null,
          closestDocuments: row.closest_documents || [],
        });
      } else {
        existing.askCount += 1;
        if (new Date(row.created_at) > new Date(existing.lastAsked)) {
          existing.lastAsked = row.created_at;
          existing.gapStatus = gapStatus;
          existing.resolvedAt = row.resolved_at || null;
        }
      }
    }

    const gaps = Array.from(gapMap.values()).sort(
      (a, b) => b.askCount - a.askCount || new Date(b.lastAsked).getTime() - new Date(a.lastAsked).getTime()
    );

    // 2. Fetch recent conflict questions (status = 'conflict')
    const { data: conflicts, error: conflictErr } = await supabase
      .from("questions_log")
      .select("id, question, conflict, warnings, created_at")
      .eq("status", "conflict")
      .order("created_at", { ascending: false })
      .limit(10);

    if (conflictErr) {
      console.warn("[Admin Gaps] Conflict query warning:", conflictErr);
    }

    return NextResponse.json({ gaps, conflicts: conflicts || [] }, { status: 200 });
  } catch (err: unknown) {
    console.error("[Admin Gaps GET Error]:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const { question, id, gapStatus } = body || {};

    if (!gapStatus || !["open", "resolved"].includes(gapStatus)) {
      return NextResponse.json(
        { error: "Invalid gapStatus. Must be 'open' or 'resolved'." },
        { status: 400 }
      );
    }

    if (!question && !id) {
      return NextResponse.json(
        { error: "Must specify either question text or log id to update." },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();
    const resolvedAt = gapStatus === "resolved" ? new Date().toISOString() : null;
    const resolvedBy = gapStatus === "resolved" ? auth.user.id : null;

    let query = supabase.from("questions_log").update({
      gap_status: gapStatus,
      resolved_at: resolvedAt,
      resolved_by: resolvedBy,
    });

    if (question) {
      query = query.eq("question", question);
    } else if (id) {
      query = query.eq("id", id);
    }

    const { error: updateErr } = await query;
    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    await logAdminActivity(auth.user.id, "gap_status_change", question || id, {
      gapStatus,
      resolvedAt,
    });

    return NextResponse.json({ success: true, gapStatus }, { status: 200 });
  } catch (err: unknown) {
    console.error("[Admin Gaps PATCH Error]:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
