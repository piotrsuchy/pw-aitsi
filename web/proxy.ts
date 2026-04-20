import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const publicPaths = [
  "/",
  "/login",
  "/blocked",
  "/browse",
  "/search",
  "/photos",
  "/uploads",      // static uploaded image files — publicly viewable
  "/api/auth",
  "/api/photos",
  "/api/categories",
];

function isPublic(pathname: string) {
  return publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  const session = await auth();

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session.user.blocked) {
    return NextResponse.redirect(new URL("/blocked", req.url));
  }

  // Admin-only routes
  if (pathname.startsWith("/admin") && session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Creator-only routes
  if (
    pathname.startsWith("/creator") &&
    session.user.role !== "CREATOR" &&
    session.user.role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Exclude Next.js internals, static assets, and uploaded image files
  // from proxy evaluation. Uploaded files must be excluded here because
  // Next.js image optimisation fetches them internally via a mock request
  // that carries no cookies — running auth() on it would always see no
  // session and redirect to /login, breaking <Image> components.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/|uploads/).*)" ],
};
