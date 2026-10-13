import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/db/supabase-server";
import { requireAdmin, logAdminActivity } from "@/lib/auth/requireAdmin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;

    const supabase = getAdminSupabase();

    // 1. Fetch all profiles from public.profiles
    const { data: profiles, error: profErr } = await supabase
      .from("profiles")
      .select("id, email, full_name, department, credential_role, role, created_at, updated_at")
      .order("created_at", { ascending: true });

    if (profErr) {
      return NextResponse.json({ error: profErr.message }, { status: 500 });
    }

    // 2. Fetch auth.users to ensure all signed up accounts are visible
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    const users = (authUsers?.users || []).map((u) => {
      const p = profileMap.get(u.id);
      return {
        id: u.id,
        email: u.email || p?.email || "unknown@northfieldhealth.org",
        fullName: p?.full_name || u.user_metadata?.full_name || "Staff Clinician",
        department: p?.department || u.user_metadata?.department || "Emergency Medicine",
        credentialRole: p?.credential_role || u.user_metadata?.credential_role || "Clinical Staff",
        role: p?.role || "user",
        createdAt: u.created_at,
        lastSignIn: u.last_sign_in_at || null,
      };
    });

    await logAdminActivity(auth.user.id, "users_list_view", "profiles", {
      totalUsers: users.length,
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (err: unknown) {
    console.error("[Admin Users GET Error]:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
