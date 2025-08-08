import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Custom logic can be added here if needed
    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized: ({ token }) => {
        // For now, allow any authenticated user
        // In production, check for admin role here
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};