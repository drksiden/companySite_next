import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

// Кэш для авторизации (5 минут)
const authCache = new Map<
  string,
  { isAuthenticated: boolean; timestamp: number }
>();
const AUTH_CACHE_DURATION = 5 * 60 * 1000; // 5 минут

function parseSupabaseCookie(cookieValue: string) {
  if (cookieValue.startsWith("base64-")) {
    const base64 = cookieValue.replace("base64-", "");
    const json = Buffer.from(base64, "base64").toString();
    return JSON.parse(json);
  }
  return null;
}

function parseJwt(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());

    // Проверяем срок действия токена
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null; // Токен истек
    }

    return payload;
  } catch {
    return null;
  }
}

// Очистка кэша каждые 10 минут
setInterval(
  () => {
    const now = Date.now();
    for (const [key, value] of authCache.entries()) {
      if (now - value.timestamp > AUTH_CACHE_DURATION) {
        authCache.delete(key);
      }
    }
  },
  10 * 60 * 1000,
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // В dev режиме можно полностью отключить middleware для админки
  if (
    process.env.NODE_ENV === "development" &&
    process.env.DISABLE_ADMIN_AUTH === "true"
  ) {
    return NextResponse.next();
  }

  // Пропускаем статические файлы и API, которые не требуют авторизации
  if (
    pathname.includes("/_next/") ||
    pathname.includes("/favicon.ico") ||
    pathname.includes("/api/catalog") ||
    pathname.includes("/api/products") ||
    pathname.includes("/api/categories") ||
    pathname.includes("/api/brands") ||
    pathname.includes("/api/collections") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".map") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".gif") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".woff") ||
    pathname.endsWith(".woff2")
  ) {
    return NextResponse.next();
  }

  const cookieValue = req.cookies.get(
    "sb-mxcxvkdbrqgsmbebrsjx-auth-token",
  )?.value;

  // Создаем ключ для кэша на основе cookie
  const cacheKey = cookieValue || "no-auth";
  const now = Date.now();

  // Проверяем кэш
  const cached = authCache.get(cacheKey);
  let isAuthenticated = false;

  if (cached && now - cached.timestamp < AUTH_CACHE_DURATION) {
    // Используем кэшированный результат
    isAuthenticated = cached.isAuthenticated;
  } else {
    // Проверяем авторизацию и кэшируем результат
    let payload = null;
    if (cookieValue) {
      let accessToken = cookieValue;
      // Если это supabase-кука нового формата, декодируем её
      if (cookieValue.startsWith("base64-")) {
        try {
          const session = parseSupabaseCookie(cookieValue);
          accessToken = session?.access_token || "";
        } catch (error) {
          // Если не удалось декодировать, считаем токен недействительным
          accessToken = "";
        }
      }
      if (accessToken) {
        payload = parseJwt(accessToken);
        // Проверяем не только роль, но и валидность токена
        isAuthenticated =
          payload?.role === "authenticated" &&
          payload?.exp &&
          Date.now() < payload.exp * 1000;
      }
    }

    // Кэшируем результат только если токен валиден или явно недействителен
    authCache.set(cacheKey, { isAuthenticated, timestamp: now });
  }

  // Проверяем аутентификацию только для админских путей
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!isAuthenticated) {
      // Очищаем кэш при неудачной авторизации
      authCache.delete(cacheKey);
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Включаем только админские роуты для проверки авторизации
    "/admin/((?!_next).*)",
    "/api/admin/:path*",
  ],
};
