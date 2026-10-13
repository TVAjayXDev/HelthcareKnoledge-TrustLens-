import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/db/supabase-server";
import { extractAuthToken } from "@/lib/auth/requireAdmin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    if (!token) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        profile: null,
        isAdmin: false,
      });
    }

    const adminClient = getAdminSupabase();
    const { data: authData, error: authErr } = await adminClient.auth.getUser(token);

    if (authErr || !authData.user) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        profile: null,
        isAdmin: false,
      });
    }

    const user = authData.user;
    const { data: profile } = await adminClient
      .from("profiles")
      .select("id, email, full_name, department, credential_role, role")
      .eq("id", user.id)
      .maybeSingle();

    return NextResponse.json({
      authenticated: true,
      user: { id: user.id, email: user.email },
      profile: profile || null,
      isAdmin: profile?.role === "admin",
    });
  } catch {
    return NextResponse.json({
      authenticated: false,
      user: null,
      profile: null,
      isAdmin: false,
    });
  }
}
