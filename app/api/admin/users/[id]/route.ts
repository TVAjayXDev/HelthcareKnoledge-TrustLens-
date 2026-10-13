import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/db/supabase-server";
import { requireAdmin, logAdminActivity } from "@/lib/auth/requireAdmin";

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
    const { role } = body || {};

    if (!role || !["user", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role value. Must be 'user' or 'admin'." },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();

    // 1. Guard: An admin cannot demote themselves
    if (id === auth.user.id && role === "user") {
      return NextResponse.json(
        { error: "Action refused: Administrators cannot demote their own account." },
        { status: 400 }
      );
    }

    // 2. Guard: The last remaining admin can never be demoted
    if (role === "user") {
      const { count: adminCount, error: countErr } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");

      if (!countErr && (adminCount === null || adminCount <= 1)) {
        return NextResponse.json(
          { error: "Action refused: The last remaining administrator in the hospital system cannot be demoted." },
          { status: 400 }
        );
      }
    }

    // 3. Check if target user exists in auth or profiles
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    let targetEmail = targetProfile?.email || "";
    if (!targetEmail) {
      const { data: authTarget } = await supabase.auth.admin.getUserById(id);
      targetEmail = authTarget?.user?.email || "";
    }

    // 4. Update or upsert role in public.profiles
    const nowISO = new Date().toISOString();
    const { data: updatedProfile, error: updateErr } = await supabase
      .from("profiles")
      .upsert({
        id,
        email: targetEmail,
        role,
        updated_at: nowISO,
      })
      .select("*")
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    await logAdminActivity(auth.user.id, "user_role_change", targetEmail || id, {
      previousRole: targetProfile?.role || "user",
      newRole: role,
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: updatedProfile.id,
          email: updatedProfile.email,
          role: updatedProfile.role,
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("[Admin User PATCH Error]:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
