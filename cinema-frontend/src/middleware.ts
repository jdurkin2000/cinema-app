// middleware.ts (Next.js root)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  try {
    if (req.nextUrl.pathname.startsWith("/system-admin")) {
      const token = req.cookies.get("authToken")?.value;
      if (!token) throw new Error("User not authorized");

      const apiBase =
        process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
      const resp = await fetch(`${apiBase}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error("Auth check failed");
      const user = (await resp.json()) as { role?: string };
      if (user.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/system-admin/:path*"],
};
