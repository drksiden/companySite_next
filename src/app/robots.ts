import { MetadataRoute } from 'next';

const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asia-ntb.kz';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/account/',
          '/private/',
          '/_next/',
          '/static/',
        ],
      },
    ],
    sitemap: `${siteBaseUrl}/sitemap.xml`,
  };
}

