import { NextResponse } from "next/server";
import { type NextRequest } from 'next/server'
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req });

  // Проверяем доступ к админке
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!token) {
      // Redirect to signin page if no token
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(signInUrl);
    }

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

    if (pathname.startsWith('/api/admin') && (!userRole || !['manager', 'admin', 'super_admin'].includes(userRole))) {
      return NextResponse.json(
        { error: 'Недостаточно прав доступа' },
        { status: 403 }
      );
    }
  }

  // Разрешаем доступ к остальным маршрутам
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};