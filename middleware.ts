import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

// Кэширование статических ресурсов
const STATIC_CACHE_DURATION = 31536000; // 1 год
const IMAGE_CACHE_DURATION = 86400; // 1 день
const API_CACHE_DURATION = 300; // 5 минут

// Пути которые нужно кэшировать
const STATIC_PATHS = ["/_next/static", "/images", "/icons", "/favicon"];

// API пути которые можно кэшировать
const CACHEABLE_API_PATHS = [
  "/api/products",
  "/api/categories",
  "/api/brands",
  "/api/collections",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // В dev режиме полностью отключаем middleware для статических файлов
  // Это критично для работы dev-сервера Next.js
  if (process.env.NODE_ENV === "development") {
    // Пропускаем все статические файлы Next.js без обработки
    if (
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/_next") ||
      pathname === "/favicon.ico" ||
      pathname.match(/\.(js|css|map|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/i)
    ) {
      // Немедленно пропускаем без какой-либо обработки
      return NextResponse.next();
    }
  } else {
    // В production тоже пропускаем статические файлы
    if (
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/_next") ||
      pathname === "/favicon.ico" ||
      pathname.match(/\.(js|css|map|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/i)
    ) {
      return NextResponse.next();
    }
  }
  
  const response = NextResponse.next();

  // В production применяем полные оптимизации
  setSecurityHeaders(response, request);

  // Кэширование статических ресурсов
  if (STATIC_PATHS.some((path) => pathname.startsWith(path))) {
    response.headers.set(
      "Cache-Control",
      `public, max-age=${STATIC_CACHE_DURATION}, immutable`,
    );
    return response;
  }

  // Кэширование изображений
  if (pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|avif)$/)) {
    response.headers.set(
      "Cache-Control",
      `public, max-age=${IMAGE_CACHE_DURATION}`,
    );
    return response;
  }

  // Проверка авторизации для админских путей
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    // В dev режиме можно полностью отключить middleware для админки
    if (
      process.env.NODE_ENV === "development" &&
      process.env.DISABLE_ADMIN_AUTH === "true"
    ) {
      return response;
    }

    const cookieValue = request.cookies.get(
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

    if (!isAuthenticated) {
      // Очищаем кэш при неудачной авторизации
      authCache.delete(cacheKey);
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(signInUrl);
    }

    // Добавляем заголовок X-Robots-Tag для предотвращения индексации админ-страниц
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  }

  // Добавляем заголовок X-Robots-Tag для страниц авторизации
  if (pathname.startsWith("/auth")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  }

  // Оптимизация API запросов
  if (pathname.startsWith("/api/")) {
    return handleApiRequest(request, response);
  }

  return response;
}

function setSecurityHeaders(response: NextResponse, request: NextRequest) {
  // Предотвращение кликджекинга
  // Разрешаем показ в iframe для Яндекс Метрики
  const referer = request.headers.get("referer") || "";
  const origin = request.headers.get("origin") || "";
  const host = request.headers.get("host") || "";
  const siteDomain = process.env.NEXT_PUBLIC_SITE_URL 
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname.replace(/^www\./, '')
    : host.replace(/^www\./, '');
  
  // Проверяем, является ли referer или origin доменом Яндекс Метрики или нашего сайта
  // Используем регулярное выражение как в документации Яндекс
  const yandexMetrikaPattern = /^https?:\/\/([^\/]+\.)?(metri[ck]a\.yandex\.(com|ru|by|com\.tr)|webvisor\.com)\//;
  const sitePattern = new RegExp(`^https?://([^/]+\\.)?${siteDomain.replace(/\./g, '\\.')}/`);
  
  const isAllowedReferer = referer && (
    yandexMetrikaPattern.test(referer) ||
    sitePattern.test(referer)
  );
  
  const isAllowedOrigin = origin && (
    yandexMetrikaPattern.test(origin) ||
    sitePattern.test(origin)
  );
  
  // Устанавливаем SAMEORIGIN для Яндекс Метрики, иначе DENY
  // SAMEORIGIN все равно защищает от кликджекинга, но позволяет iframe с того же origin
  const frameOptions = (isAllowedReferer || isAllowedOrigin) ? "SAMEORIGIN" : "DENY";
  response.headers.set("X-Frame-Options", frameOptions);

  // Предотвращение MIME sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // XSS защита
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer Policy
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");

  // Content Security Policy (смягченная для dev режима)
  if (process.env.NODE_ENV === "development") {
    response.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self' 'unsafe-eval' 'unsafe-inline'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https:",
        "style-src 'self' 'unsafe-inline' https:",
        "img-src 'self' data: https: blob:",
        "font-src 'self' https:",
        "connect-src 'self' https: wss: ws:",
        "frame-src 'self' https:",
      ].join("; "),
    );
  } else {
    // Разрешаем frame-ancestors для Яндекс Метрики
    // Всегда разрешаем домены Яндекс Метрики в CSP, так как это безопасно
    response.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: https: blob:",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://pub-1506276de6ac4a07aa6fe582457507c1.r2.dev",
        "frame-src 'self' https://www.google.com",
        "frame-ancestors 'self' https://metrika.yandex.ru https://metrika.yandex.by https://metrica.yandex.com https://metrica.yandex.com.tr https://*.webvisor.com",
      ].join("; "),
    );
  }

  // Permissions Policy
  response.headers.set(
    "Permissions-Policy",
    [
      "camera=()",
      "microphone=()",
      "geolocation=(self)",
      "interest-cohort=()",
    ].join(", "),
  );
}

function handleApiRequest(request: NextRequest, response: NextResponse) {
  const { pathname, search } = request.nextUrl;

  // Проверяем, можно ли кэшировать этот API путь
  const isCacheable = CACHEABLE_API_PATHS.some((path) =>
    pathname.startsWith(path),
  );

  if (isCacheable && request.method === "GET") {
    // Кэшируем GET запросы к публичным API
    response.headers.set(
      "Cache-Control",
      `public, max-age=${API_CACHE_DURATION}, stale-while-revalidate=${API_CACHE_DURATION * 2}`,
    );

    // Добавляем ETag для лучшего кэширования
    const etag = generateETag(pathname + search);
    response.headers.set("ETag", etag);

    // Проверяем If-None-Match header
    const ifNoneMatch = request.headers.get("If-None-Match");
    if (ifNoneMatch === etag) {
      return new Response(null, { status: 304 });
    }
  }

  // CORS headers для API
  if (pathname.startsWith("/api/")) {
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, apikey, x-client-info",
    );
  }

  // Обработка OPTIONS запросов (preflight)
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: response.headers });
  }

  // Rate limiting для админских API
  if (pathname.startsWith("/api/admin/")) {
    const rateLimitResult = checkRateLimit(request);
    if (!rateLimitResult.allowed) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "60",
        },
      });
    }

    // Добавляем rate limit headers
    response.headers.set("X-RateLimit-Limit", "100");
    response.headers.set(
      "X-RateLimit-Remaining",
      rateLimitResult.remaining.toString(),
    );
  }

  return response;
}

// Простой генератор ETag
function generateETag(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Конвертируем в 32-битное число
  }
  return `"${Math.abs(hash).toString(36)}"`;
}

// Простой rate limiter (в продакшене лучше использовать Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(request: NextRequest): {
  allowed: boolean;
  remaining: number;
} {
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const key = `rate_limit:${ip}`;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 минута
  const maxRequests = 100;

  const current = rateLimitMap.get(key);

  if (!current || now > current.resetTime) {
    // Новое окно или истекшее
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  current.count++;
  return { allowed: true, remaining: maxRequests - current.count };
}

// Очистка rate limit карты каждые 5 минут
setInterval(
  () => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  },
  5 * 60 * 1000,
);

export const config = {
  matcher: [
    /*
     * Обрабатываем только конкретные пути, которые нужны для middleware
     * Это более надежно, чем исключение статических файлов
     * 
     * Обрабатываем:
     * - /admin и подпути (для авторизации)
     * - /api/admin и подпути (для авторизации)
     * - /api/ (публичные API для кэширования)
     * - /auth и подпути (для security headers)
     * 
     * НЕ обрабатываем:
     * - /_next/* (автоматически исключается, так как не указано явно)
     * - статические файлы с расширениями
     * - остальные страницы (security headers будут применяться через другие механизмы или в layout)
     */
    "/admin/:path*",
    "/api/:path*",
    "/auth/:path*",
  ],
};
