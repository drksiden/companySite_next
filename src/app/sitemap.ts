import { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabaseServer';
import { COMPANY_NAME_SHORT } from '@/data/constants';
import { getProduct } from '@/lib/services/catalog';

const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asia-ntb.kz';

// Функция для проверки цепочки категорий (аналогично resolveCategoryChain из page.tsx)
async function validateCategoryChain(path: string, supabase: any): Promise<boolean> {
  if (!path) return false;
  
  const slugs = path.split('/').filter(Boolean);
  if (slugs.length === 0) return false;

  let parentId: string | null = null;

  for (let idx = 0; idx < slugs.length; idx++) {
    const slug = slugs[idx];
    let query = supabase
      .from('categories')
      .select('id, parent_id, level')
      .eq('slug', slug)
      .eq('is_active', true);

    if (idx === 0) {
      // Для первого slug — ищем level = 0 (корневые)
      query = query.eq('level', 0).is('parent_id', null);
    } else {
      // Для всех остальных — ищем, чтобы parent совпадал с прошлым id
      query = query.eq('parent_id', parentId);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return false;
    }

    parentId = data.id;
  }

  return true;
}

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
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('slug, path, updated_at, created_at')
    .eq('is_active', true)
    .order('updated_at', { ascending: false });

  // Валидируем категории - проверяем, что цепочка parent_id корректна
  const validCategoryPages: MetadataRoute.Sitemap = [];
  if (categories && categories.length > 0) {
    for (const category of categories) {
      const categoryPath = category.path || category.slug;
      
      // Проверяем, что категория действительно доступна по цепочке
      const isValid = await validateCategoryChain(categoryPath, supabase);
      
      if (isValid && categoryPath) {
        validCategoryPages.push({
          url: `${baseUrl}/catalog/${categoryPath}`,
          lastModified: category.updated_at ? new Date(category.updated_at) : new Date(category.created_at),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        });
      }
    }
  }

  if (categoriesError) {
    console.error('Error fetching categories for sitemap:', categoriesError);
  }

  // Получаем все активные товары
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('slug, updated_at, created_at')
    .eq('status', 'active')
    .not('slug', 'is', null)
    .order('updated_at', { ascending: false });

  // Валидируем продукты - проверяем, что продукт действительно доступен
  const validProductPages: MetadataRoute.Sitemap = [];
  if (products && products.length > 0) {
    for (const product of products) {
      if (!product.slug) continue;
      
      // Проверяем, что продукт действительно доступен через getProduct
      const productData = await getProduct(product.slug);
      
      if (productData && productData.status === 'active') {
        validProductPages.push({
          url: `${baseUrl}/catalog/product/${product.slug}`,
          lastModified: product.updated_at ? new Date(product.updated_at) : new Date(product.created_at),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        });
      }
    }
  }

  if (productsError) {
    console.error('Error fetching products for sitemap:', productsError);
  }

  // Получаем все активные новости
  const { data: news, error: newsError } = await supabase
    .from('news')
    .select('id, updated_at, created_at')
    .eq('is_active', true)
    .not('id', 'is', null)
    .order('updated_at', { ascending: false });

  // Валидируем новости - если новость в списке активных, она доступна
  const validNewsPages: MetadataRoute.Sitemap = (news || [])
    .filter((article) => article.id) // Фильтруем только те, у которых есть id
    .map((article) => ({
      url: `${baseUrl}/news/${article.id}`,
      lastModified: article.updated_at ? new Date(article.updated_at) : new Date(article.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

  if (newsError) {
    console.error('Error fetching news for sitemap:', newsError);
  }

  return [...staticPages, ...validCategoryPages, ...validProductPages, ...validNewsPages];
}

