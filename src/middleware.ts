// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Проверяем доступ к админке
    if (pathname.startsWith('/admin')) {
      const userRole = token?.role;
      
      if (!userRole || !['manager', 'admin', 'super_admin'].includes(userRole)) {
        // Перенаправляем на страницу входа с указанием откуда пришел запрос
        const signInUrl = new URL('/auth/signin', req.url);
        signInUrl.searchParams.set('callbackUrl', req.url);
        return NextResponse.redirect(signInUrl);
      }

      // Проверяем специфичные права для определенных разделов
      if (pathname.startsWith('/admin/users') && userRole !== 'super_admin' && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/admin', req.url));
      }

      if (pathname.startsWith('/admin/settings') && userRole !== 'super_admin') {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }

    // Проверяем API маршруты админки
    if (pathname.startsWith('/api/admin')) {
      const userRole = token?.role;
      
      if (!userRole || !['manager', 'admin', 'super_admin'].includes(userRole)) {
        return NextResponse.json(
          { error: 'Недостаточно прав доступа' },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Для админских маршрутов требуется токен
        if (req.nextUrl.pathname.startsWith('/admin') || 
            req.nextUrl.pathname.startsWith('/api/admin')) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ],
};

