import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const serverTime = new Date().toISOString();

  // ─── Debug Log ───
  console.log(`[DEBUG][Middleware] ⏱️ Server time: ${serverTime}`);
  console.log(`[DEBUG][Middleware] 🔍 Processing: ${pathname}`);

  // ─── Public routes (no authentication required) ───
  const publicRoutes = ["/Login", "/", "/Daftar"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isPublicRoute) {
    console.log(`[DEBUG][Middleware] ✅ ${pathname} is public, allowing access`);
    return NextResponse.next();
  }

  // Protected routes that require authentication
  const protectedRoutes = [
    "/Dashboard_pengawas",
    "/Generate_qr",
    "/Generate_absensi",
    "/Verifikasi",
    "/Laporan_absensi",
    "/Generate_kartu",
    "/Crud_profile",
    "/Beranda_user",
    "/scan",
    "/Profile_eskul",
    "/Kategori",
  ];

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Get user_role from cookie (session indicator)
    const userRole = request.cookies.get("user_role")?.value;
    const userId = request.cookies.get("user_id")?.value;
    console.log(
      `[DEBUG][Middleware] 🔒 Protected route ${pathname}, user_id: ${userId || "NOT_FOUND"}, user_role: ${userRole || "NOT_FOUND"}`
    );

    // If no user_role, redirect to login
    if (!userRole) {
      console.log(
        `[DEBUG][Middleware] ❌ No user_role found, redirecting to /Login`
      );
      return NextResponse.redirect(new URL("/Login", request.url));
    }

    // Role-based access control
    const roleAccess: Record<string, string[]> = {
      admin: [
        "/Dashboard_pengawas",
        "/Generate_qr",
        "/Generate_absensi",
        "/Generate_kartu",
        "/Verifikasi",
        "/Laporan_absensi",
        "/Crud_profile",
        "/Profile_eskul",
        "/Kategori",
      ],
      pembina: [
        "/Dashboard_pembina",
        "/Generate_qr",
        "/Generate_absensi",
        "/Generate_kartu",
        "/Laporan_absensi",
        "/Verifikasi",
        "/Profile_eskul",
        "/Kategori",
      ],
      siswa: ["/Beranda_user", "/scan", "/Profile_eskul", "/Kategori"],
    };

    // Check if user's role has access to this route
    const allowedRoutes = roleAccess[userRole] || [];
    const hasAccess = allowedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    console.log(
      `[DEBUG][Middleware] 📋 Role: ${userRole}, Allowed routes: [${allowedRoutes.join(
        ", "
      )}], Has access: ${hasAccess}`
    );

    if (!hasAccess) {
      console.log(
        `[DEBUG][Middleware] ❌ Access denied for ${userRole} (ID: ${userId}) to ${pathname}, redirecting to /Login`
      );
      return NextResponse.redirect(new URL("/Login", request.url));
    }

    console.log(`[DEBUG][Middleware] ✅ Access granted for ${userRole} (ID: ${userId}) to ${pathname}`);
  }

  return NextResponse.next();
}

// Configure which routes to apply middleware to
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
