import { COMPANY_NAME, COMPANY_NAME_SHORT, COMPANY_ADDRESS, COMPANY_CITY_PHONE1, COMPANY_CITY_PHONE2 } from '@/data/constants';

const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asia-ntb.kz';

interface JsonLdProps {
  data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Organization Schema
export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: COMPANY_NAME,
    alternateName: COMPANY_NAME_SHORT,
    url: siteBaseUrl,
    logo: `${siteBaseUrl}/images/logos/asia-ntb/Asia-NTB-logo-rus-dark.svg`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY_ADDRESS,
      addressLocality: 'Алматы',
      addressCountry: 'KZ',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: COMPANY_CITY_PHONE1,
        contactType: 'customer service',
        areaServed: 'KZ',
        availableLanguage: ['Russian', 'Kazakh'],
      },
      {
        '@type': 'ContactPoint',
        telephone: COMPANY_CITY_PHONE2,
        contactType: 'sales',
        areaServed: 'KZ',
        availableLanguage: ['Russian', 'Kazakh'],
      },
    ],
    sameAs: [
      // Можно добавить ссылки на соцсети, если они есть
    ],
  };

  return <JsonLd data={data} />;
}

// Product Schema
interface ProductJsonLdProps {
  product: {
    name: string;
    description?: string;
    image?: string;
    sku?: string;
    price?: number;
    currency?: string;
    brand?: string;
    category?: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
    url: string;
  };
}

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.name,
    image: product.image ? [product.image] : [],
    sku: product.sku,
    brand: product.brand
      ? {
          '@type': 'Brand',
          name: product.brand,
        }
      : undefined,
    category: product.category,
    offers: product.price
      ? {
          '@type': 'Offer',
          url: product.url,
          priceCurrency: product.currency || 'KZT',
          price: product.price,
          availability: `https://schema.org/${product.availability || 'InStock'}`,
          seller: {
            '@type': 'Organization',
            name: COMPANY_NAME,
          },
        }
      : undefined,
    url: product.url,
  };

  // Удаляем undefined поля
  Object.keys(data).forEach((key) => {
    if (data[key as keyof typeof data] === undefined) {
      delete data[key as keyof typeof data];
    }
  });

  return <JsonLd data={data} />;
}

// BreadcrumbList Schema
interface BreadcrumbJsonLdProps {
  items: Array<{
    name: string;
    url?: string;
    href?: string;
  }>;
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const url = item.url || item.href || '/';
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: url.startsWith('http') ? url : `${siteBaseUrl}${url}`,
      };
    }),
  };

  return <JsonLd data={data} />;
}

// Article Schema
interface ArticleJsonLdProps {
  article: {
    headline: string;
    description?: string;
    image?: string;
    datePublished: string;
    dateModified?: string;
    author?: string;
    url: string;
  };
}

export function ArticleJsonLd({ article }: ArticleJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: article.description || article.headline,
    image: article.image ? [article.image] : [],
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: article.author
      ? {
          '@type': 'Person',
          name: article.author,
        }
      : {
          '@type': 'Organization',
          name: COMPANY_NAME,
        },
    publisher: {
      '@type': 'Organization',
      name: COMPANY_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${siteBaseUrl}/images/logos/asia-ntb/Asia-NTB-logo-rus-dark.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url.startsWith('http') ? article.url : `${siteBaseUrl}${article.url}`,
    },
  };

  return <JsonLd data={data} />;
}

