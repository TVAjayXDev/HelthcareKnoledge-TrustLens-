import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/db/supabase-server";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;

    const supabase = getAdminSupabase();

    // 1. Fetch latest 100 audit log records
    const { data: logs, error: logErr } = await supabase
      .from("admin_audit_log")
      .select("id, actor_id, action, target, details, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (logErr) {
      return NextResponse.json({ error: logErr.message }, { status: 500 });
    }

    // 2. Fetch actor profile metadata for readable display
    const actorIds = Array.from(new Set((logs || []).map((l) => l.actor_id).filter(Boolean)));
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("id", actorIds);

    const actorMap = new Map((profiles || []).map((p) => [p.id, p]));

    const activities = (logs || []).map((log) => {
      const actor = log.actor_id ? actorMap.get(log.actor_id) : null;
      return {
        id: log.id,
        actorId: log.actor_id,
        actorEmail: actor?.email || "System / Automated",
        actorName: actor?.full_name || "Administrator",
        action: log.action,
        target: log.target || "-",
        details: log.details || {},
        createdAt: log.created_at,
      };
    });

    return NextResponse.json({ activities }, { status: 200 });
  } catch (err: unknown) {
    console.error("[Admin Activity GET Error]:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
