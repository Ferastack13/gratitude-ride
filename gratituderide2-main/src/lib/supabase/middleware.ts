import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/client", "/rider", "/admin"];
const AUTH_PAGES = ["/login", "/register", "/forgot-password"];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

function isAuthPage(pathname: string) {
  return AUTH_PAGES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

function getRoleHome(role: string) {
  switch (role) {
    case "admin":
      return "/admin";
    case "rider":
      return "/rider";
    default:
      return "/client";
  }
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip auth work on public marketing pages — keeps clicks fast
  if (!isProtected(pathname) && !isAuthPage(pathname)) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const envMissing =
    !url ||
    !key ||
    url.includes("your_supabase") ||
    key.includes("your_supabase");

  if (envMissing) {
    if (isProtected(pathname)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set(
        "error",
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
      );
      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: Record<string, unknown>;
        }[]
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtected(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthPage(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (user && isProtected(pathname)) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role ?? "client";

    // Only /admin is role-locked. Client and rider dashboards are
    // switchable for any signed-in non-admin user.
    if (pathname.startsWith("/admin") && role !== "admin") {
      const modeCookie = request.cookies.get("gr_dashboard_mode")?.value;
      const home =
        modeCookie === "rider" || modeCookie === "client"
          ? `/${modeCookie}`
          : getRoleHome(role);
      return NextResponse.redirect(new URL(home, request.url));
    }
  }

  return supabaseResponse;
}
