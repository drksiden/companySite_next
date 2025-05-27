// src/app/product/[productHandle]/page.tsx

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Product, Category } from '@/types/supabase'; // Import Supabase types
import { COMPANY_NAME_SHORT } from '@/data/constants';
import ProductClientComponent from '@/components/product/ProductClientComponent';

export const revalidate = 3600; // Revalidate every hour

// --- Генерация метаданных ---
export async function generateMetadata(
  props: { params: { productHandle: string } }
): Promise<Metadata> {
  const productHandle = props.params.productHandle;
  console.log(`[Metadata] Product page for handle: ${productHandle}`);
  try {
    const { data: productData, error } = await supabase
      .from('products')
      .select('name, handle, description, image_urls, brand:brands (name)')
      .eq('handle', productHandle)
      .maybeSingle();

    if (error) {
      console.error(`[Metadata Error] Supabase query failed for '${productHandle}':`, error.message);
      return { title: `Ошибка загрузки товара | ${COMPANY_NAME_SHORT}` };
    }
    
    if (!productData || !productData.name || !productData.handle) {
      console.warn(`[Metadata] Product not found or essential fields missing for handle: ${productHandle}`);
      return { title: `Товар не найден | ${COMPANY_NAME_SHORT}` };
    }

    const pageTitle = `${productData.name}${productData.brand?.name ? ` by ${productData.brand.name}` : ''} | ${COMPANY_NAME_SHORT}`;
    const pageDescription = productData.description?.substring(0, 160) || `Купить ${productData.name} в ${COMPANY_NAME_SHORT}.`;
    const canonicalUrl = `/product/${productData.handle}`;
    const ogImage = productData.image_urls?.[0];

    return {
      title: pageTitle,
      description: pageDescription,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: canonicalUrl,
        type: 'website', 
        images: ogImage ? [{ url: ogImage }] : [],
      },
    };
  } catch (error) { 
    console.error(`[Metadata Error] Unexpected error for product '${productHandle}':`, error);
    return { title: `Ошибка загрузки товара | ${COMPANY_NAME_SHORT}` };
  }
}

interface ProductPageData {
  product: Product | null;
  breadcrumbAncestors: Category[];
}

async function getProductData(
  productHandle: string
): Promise<ProductPageData | null> {
  console.log(`[getProductData] For product handle: ${productHandle}`);
  try {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
            *,
            brand:brands (id, name, handle, logo_url, description)
      `)
      .eq('handle', productHandle)
      .maybeSingle();

    if (productError || !product) {
      console.error(`[getProductData] Error fetching product or product not found for handle "${productHandle}":`, productError?.message);
      return null;
    }
    
    console.log(`[getProductData] Product fetched: ${product.name}, ID: ${product.id}`);

    const breadcrumbAncestors: Category[] = [];
    if (product.category_id) {
      let currentCategoryId: string | null = product.category_id;
      const MAX_DEPTH = 10; 
      let depth = 0;
      const retrievedAncestorIds = new Set<string>(); 

      console.log(`[getProductData] Starting breadcrumb fetch for category_id: ${currentCategoryId}`);
      while (currentCategoryId && depth < MAX_DEPTH) {
        if (retrievedAncestorIds.has(currentCategoryId)) {
          console.warn(`[getProductData] Detected cycle in category ancestors for category ID ${currentCategoryId}. Breaking.`);
          break;
        }
        retrievedAncestorIds.add(currentCategoryId);

        const { data: category, error: catError } = await supabase
          .from('categories')
          .select('id, name, handle, parent_id') 
          .eq('id', currentCategoryId)
          .single(); 
        
        if (catError || !category) {
          console.error(`[getProductData] Error fetching category ID "${currentCategoryId}" for breadcrumbs:`, catError?.message);
          break; 
        }
        breadcrumbAncestors.unshift(category as Category); 
        console.log(`[getProductData] Fetched ancestor: ${category.name}, preparing to fetch parent: ${category.parent_id}`);
        currentCategoryId = category.parent_id;
        depth++;
      }
    } else {
      console.log(`[getProductData] Product "${product.name}" has no category_id. Skipping breadcrumb ancestor fetch.`);
    }
    
    console.log(`[getProductData] Breadcrumb ancestors for "${product.name}":`, breadcrumbAncestors.map(a => a.name));

    return { product: product as Product, breadcrumbAncestors };

  } catch (error: any) {
    console.error(`[getProductData] Unexpected error for product page '${productHandle}':`, error);
    return null;
  }
}

function generateProductBreadcrumbs(
    product: Product, 
    ancestors: Category[] 
): Array<{ label: string; href: string }> {
  const items: Array<{ label: string; href: string }> = [
    { label: 'Каталог', href: '/catalog' },
  ];
  let accumulatedPath = '/catalog';

  ancestors.forEach(category => {
    if (category && category.handle && category.name) {
        accumulatedPath += `/${category.handle}`;
        if (items.length === 0 || items[items.length -1]?.href !== accumulatedPath) {
            items.push({ label: category.name, href: accumulatedPath });
        }
    }
  });
  
  const productPagePath = `/product/${product.handle!}`; 
  if (product.name && (items.length === 0 || items[items.length -1]?.href !== productPagePath)) {
    items.push({ label: product.name, href: productPagePath });
  }
  return items;
}

export default async function ProductPage(
  props: { params: { productHandle: string } }
) {
  const productHandle = props.params.productHandle;
  console.log(`[ProductPage] Rendering ProductPage for handle: ${productHandle}`);
  const pageData = await getProductData(productHandle);

  if (!pageData || !pageData.product) {
    console.warn(`[ProductPage] No product data found for handle "${productHandle}". Triggering 404.`);
    notFound();
  }

  const { product, breadcrumbAncestors } = pageData;
  const breadcrumbItems = generateProductBreadcrumbs(product, breadcrumbAncestors);

  return (
    <ProductClientComponent
      product={product} 
      breadcrumbItems={breadcrumbItems}
    />
  );
}
