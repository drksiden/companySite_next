import { MetadataRoute } from 'next';

const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asia-ntb.kz';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/favicon.ico',
          '/icon0.svg',
          '/icon1.png',
          '/apple-icon.png',
          '/web-app-manifest-192x192.png',
          '/web-app-manifest-512x512.png',
        ],
        disallow: [
          '/admin',
          '/admin/',
          '/api/',
          '/auth',
          '/auth/',
          '/account/',
          '/private/',
          '/_next/',
          '/static/',
          '/error',
          '/error/',
        ],
      },
    ],
    sitemap: `${siteBaseUrl}/sitemap.xml`,
  };
}

