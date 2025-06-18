import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Проверяем доступ к админке
    if (req.nextUrl.pathname.startsWith('/admin')) {
      const userRole = typeof req.nextauth.token?.role === 'string' ? req.nextauth.token.role : undefined;
      
      if (!userRole || !['manager', 'admin', 'super_admin'].includes(userRole)) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ],
};
