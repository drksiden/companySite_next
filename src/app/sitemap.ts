import { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabaseServer';
import { COMPANY_NAME_SHORT } from '@/data/constants';

const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asia-ntb.kz';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient();
  const baseUrl = siteBaseUrl;

  // Статические страницы
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contacts`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Получаем все активные категории
  // Используем path для правильного формирования URL вложенных категорий
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('slug, path, updated_at, created_at')
    .eq('is_active', true)
    .order('updated_at', { ascending: false });

  const categoryPages: MetadataRoute.Sitemap = (categories || []).map((category) => {
    // Используем path если он есть, иначе fallback на slug
    const categoryPath = category.path || category.slug;
    return {
      url: `${baseUrl}/catalog/${categoryPath}`,
    lastModified: category.updated_at ? new Date(category.updated_at) : new Date(category.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
    };
  });

  // Получаем все активные товары
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('slug, updated_at, created_at')
    .eq('status', 'active')
    .order('updated_at', { ascending: false });

  const productPages: MetadataRoute.Sitemap = (products || []).map((product) => ({
    url: `${baseUrl}/catalog/product/${product.slug}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(product.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Получаем все активные новости
  const { data: news, error: newsError } = await supabase
    .from('news')
    .select('id, updated_at, created_at')
    .eq('is_active', true)
    .order('updated_at', { ascending: false });

  const newsPages: MetadataRoute.Sitemap = (news || []).map((article) => ({
    url: `${baseUrl}/news/${article.id}`,
    lastModified: article.updated_at ? new Date(article.updated_at) : new Date(article.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  if (categoriesError) {
    console.error('Error fetching categories for sitemap:', categoriesError);
  }
  if (productsError) {
    console.error('Error fetching products for sitemap:', productsError);
  }
  if (newsError) {
    console.error('Error fetching news for sitemap:', newsError);
  }

  return [...staticPages, ...categoryPages, ...productPages, ...newsPages];
}

