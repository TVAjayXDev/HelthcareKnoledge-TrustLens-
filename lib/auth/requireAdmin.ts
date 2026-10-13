import { NextRequest, NextResponse } from "next/server";
import { User } from "@supabase/supabase-js";
import { getAdminSupabase } from "@/lib/db/supabase-server";

export interface ProfileRecord {
  id: string;
  email: string;
  full_name?: string;
  department?: string;
  credential_role?: string;
  role: "user" | "admin";
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type RequireAdminResult =
  | { ok: true; user: User; profile: ProfileRecord }
  | { ok: false; response: NextResponse };

/**
 * Extracts the JWT access token from request Authorization header or cookies.
 */
export function extractAuthToken(req: NextRequest): string | null {
  // 1. Authorization: Bearer <token>
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.substring(7).trim();
  }

  // 2. Direct cookie variants
  const directCookie =
    req.cookies.get("trustlens_token")?.value ||
    req.cookies.get("sb_access_token")?.value ||
    req.cookies.get("sb-access-token")?.value;
  if (directCookie) return directCookie;

  // 3. Supabase SSR auth token chunk or composite cookie
  for (const cookie of req.cookies.getAll()) {
    if (cookie.name.includes("-auth-token")) {
      try {
        const decoded = decodeURIComponent(cookie.value);
        const parsed = JSON.parse(decoded);
        if (parsed.access_token) return parsed.access_token;
        if (Array.isArray(parsed) && parsed[0]?.access_token) return parsed[0].access_token;
      } catch {
        // Attempt raw JWT if stored directly
        if (cookie.value.startsWith("ey") && cookie.value.split(".").length === 3) {
          return cookie.value;
        }
      }
    }
  }

  return null;
}

/**
 * Server-side authorization guard.
 * Reads the session token, verifies user with Supabase Auth,
 * loads the verified role from public.profiles using the service role client,
 * and returns:
 *   - 401 if unauthenticated (no session or invalid token)
 *   - 403 if authenticated but not an admin (role !== 'admin')
 *   - { ok: true, user, profile } if verified admin
 */
export async function requireAdmin(req: NextRequest): Promise<RequireAdminResult> {
  const token = extractAuthToken(req);

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Unauthorized. An active administrator session is required." },
        { status: 401 }
      ),
    };
  }

  const adminClient = getAdminSupabase();

  // 1. Verify user with Supabase Auth
  const { data: authData, error: authError } = await adminClient.auth.getUser(token);
  if (authError || !authData.user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Unauthorized. Invalid or expired session token." },
        { status: 401 }
      ),
    };
  }

  const user = authData.user;

  // 2. Query public.profiles using the service-role client (cannot be forged by client)
  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Forbidden. Clinical profile not found for authenticated user." },
        { status: 403 }
      ),
    };
  }

  // 3. Enforce admin role strictly server-side
  if (profile.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Forbidden. Administrative privileges required." },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true,
    user,
    profile: profile as ProfileRecord,
  };
}

/**
 * Write a record to public.admin_audit_log using the service-role client.
 */
export async function logAdminActivity(
  actorId: string | null,
  action: string,
  target?: string,
  details: Record<string, unknown> = {}
): Promise<void> {
  try {
    const adminClient = getAdminSupabase();
    await adminClient.from("admin_audit_log").insert({
      actor_id: actorId,
      action,
      target: target || null,
      details,
    });
  } catch (err) {
    console.error("[logAdminActivity Error]:", err);
  }
}
