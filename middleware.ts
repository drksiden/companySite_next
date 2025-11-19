import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
  
  // В dev режиме полностью пропускаем статические файлы Next.js
  // Это критично для работы dev-сервера
  if (process.env.NODE_ENV === "development") {
    // Пропускаем все статические файлы Next.js без обработки
    // Включая файлы с query параметрами (например, ?v=...)
    if (
      pathname.startsWith("/_next/") ||
      pathname === "/favicon.ico" ||
      pathname.match(/\.(js|css|map|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/i)
    ) {
      return NextResponse.next();
    }
  }
  
  const response = NextResponse.next();

  // В production применяем полные оптимизации
  setSecurityHeaders(response);

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

  // Оптимизация API запросов
  if (pathname.startsWith("/api/")) {
    return handleApiRequest(request, response);
  }

  return response;
}

function setSecurityHeaders(response: NextResponse) {
  // Предотвращение кликджекинга
  response.headers.set("X-Frame-Options", "DENY");

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
     * Исключаем все статические файлы Next.js и статические ресурсы
     * В dev режиме middleware полностью пропускает их в начале функции
     */
    "/((?!_next|favicon.ico|.*\\.(js|css|map|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$).*)",
  ],
};
