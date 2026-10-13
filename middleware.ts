import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/admin", "/admin/:path*", "/upload", "/upload/:path*"],
};

function extractTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.substring(7).trim();
  }

  const directCookie =
    req.cookies.get("trustlens_token")?.value ||
    req.cookies.get("sb_access_token")?.value ||
    req.cookies.get("sb-access-token")?.value;
  if (directCookie) return directCookie;

  for (const cookie of req.cookies.getAll()) {
    if (cookie.name.includes("-auth-token")) {
      try {
        const decoded = decodeURIComponent(cookie.value);
        const parsed = JSON.parse(decoded);
        if (parsed.access_token) return parsed.access_token;
        if (Array.isArray(parsed) && parsed[0]?.access_token) return parsed[0].access_token;
      } catch {
        if (cookie.value.startsWith("ey") && cookie.value.split(".").length === 3) {
          return cookie.value;
        }
      }
    }
  }

  return null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = extractTokenFromRequest(req);

  // 1. If no token, redirect visitors to login with redirect param
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://axmfufburvppiujwazjo.supabase.co";
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";

  try {
    // 2. Validate token with Supabase Auth endpoint
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: anonKey || serviceRoleKey,
      },
    });

    if (!userRes.ok) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userData = await userRes.json();
    const userId = userData?.id;

    if (!userId) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 3. Query role from public.profiles using service role privileges
    const profileRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=role`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      }
    );

    if (!profileRes.ok) {
      const homeUrl = new URL("/", req.url);
      homeUrl.searchParams.set("error", "admins_only");
      homeUrl.searchParams.set("msg", "Admins only");
      return NextResponse.redirect(homeUrl);
    }

    const profiles = await profileRes.json();
    const role = profiles?.[0]?.role;

    if (role !== "admin") {
      const homeUrl = new URL("/", req.url);
      homeUrl.searchParams.set("error", "admins_only");
      homeUrl.searchParams.set("msg", "Admins only");
      return NextResponse.redirect(homeUrl);
    }

    // Authenticated administrator -> allow request
    return NextResponse.next();
  } catch (err) {
    console.error("[Middleware Auth Error]:", err);
    const homeUrl = new URL("/", req.url);
    homeUrl.searchParams.set("error", "admins_only");
    homeUrl.searchParams.set("msg", "Admins only");
    return NextResponse.redirect(homeUrl);
  }
}
