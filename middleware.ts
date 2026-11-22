import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as any;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/vendor") && token?.role !== "VENDOR" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
    if ((path.startsWith("/cart") || path.startsWith("/checkout") || path.startsWith("/orders")) && !token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (path.startsWith("/api")) return true;
        if (path === "/" || path.startsWith("/shop") || path.startsWith("/auth")) return true;
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: ["/vendor/:path*", "/admin/:path*", "/cart/:path*", "/checkout/:path*", "/orders/:path*", "/api/cart/:path*", "/api/orders/:path*", "/api/checkout/:path*", "/api/vendor/:path*", "/api/admin/:path*", "/api/products/:path*"],
};