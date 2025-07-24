import { NextResponse } from "next/server";
import { type NextRequest } from 'next/server';

function parseSupabaseCookie(cookieValue: string) {
  if (cookieValue.startsWith('base64-')) {
    const base64 = cookieValue.replace('base64-', '');
    const json = Buffer.from(base64, 'base64').toString();
    return JSON.parse(json);
  }
  return null;
}

function parseJwt(token: string) {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // (debug logging removed)
  
  const cookieValue = req.cookies.get('sb-mxcxvkdbrqgsmbebrsjx-auth-token')?.value;
  // (debug logging removed)

  let isAuthenticated = false;
  let payload = null;
  if (cookieValue) {
    let accessToken = cookieValue;
    // Если это supabase-кука нового формата, декодируем её
    if (cookieValue.startsWith('base64-')) {
      const session = parseSupabaseCookie(cookieValue);
      accessToken = session?.access_token;
    }
    if (accessToken) {
      payload = parseJwt(accessToken);
      // (debug logging removed)
      isAuthenticated = payload?.role === 'authenticated';
    } else {
      // (debug logging removed)
    }
  }
  
  // (debug logging removed)

  if ((pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) && !isAuthenticated) {
    // (debug logging removed)
    const signInUrl = new URL('/auth/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Временно отключаем middleware для /admin
    // '/admin/:path*',
    '/api/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};