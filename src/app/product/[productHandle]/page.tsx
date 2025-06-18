// src/app/product/[productHandle]/page.tsx

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Product, Category } from '@/types/supabase';
import { COMPANY_NAME_SHORT } from '@/data/constants';
import ProductClientComponent from '@/components/product/ProductClientComponent';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { productHandle: string };
}): Promise<Metadata> {
  const { productHandle } = params;
  
  try {
    const { data: productData, error } = await supabase
      .from('products')
      .select('name, handle, description, image_urls, brand_id')
      .eq('handle', productHandle)
      .single();

    if (error || !productData) {
      return { title: `Товар не найден | ${COMPANY_NAME_SHORT}` };
    }

    // Получаем бренд для метаданных
    let brandName = '';
    if (productData.brand_id) {
      const { data: brandData } = await supabase
        .from('brands')
        .select('name')
        .eq('id', productData.brand_id)
        .single();
      brandName = brandData?.name || '';
    }

    const pageTitle = `${productData.name}${brandName ? ` от ${brandName}` : ''} | ${COMPANY_NAME_SHORT}`;
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
    console.error('Metadata error:', error);
    return { title: `Ошибка загрузки товара | ${COMPANY_NAME_SHORT}` };
  }
}

async function getProductData(productHandle: string) {
  try {
    // Получаем товар
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('handle', productHandle)
      .single();

    if (productError || !product) {
      console.error('Product not found:', productError);
      return null;
    }

    // Получаем бренд отдельно если есть brand_id
    if (product.brand_id) {
      const { data: brandData } = await supabase
        .from('brands')
        .select('*')
        .eq('id', product.brand_id)
        .single();
      
      if (brandData) {
        // Добавляем бренд к продукту
        (product as any).brands = brandData;
      }
    }

    // Собираем хлебные крошки
    const breadcrumbAncestors: Category[] = [];
    
    if (product.category_id) {
      let currentCategoryId: string | null = product.category_id;
      const MAX_DEPTH = 10;
      let depth = 0;
      const retrievedIds = new Set<string>();

      while (currentCategoryId && depth < MAX_DEPTH && !retrievedIds.has(currentCategoryId)) {
        retrievedIds.add(currentCategoryId);
        
        const { data: category } = await supabase
          .from('categories')
          .select('id, name, handle, parent_id')
          .eq('id', currentCategoryId)
          .single();
        
        if (!category) break;
        
        breadcrumbAncestors.unshift(category);
        currentCategoryId = category.parent_id;
        depth++;
      }
    }

    return { 
      product: product as Product, 
      breadcrumbAncestors 
    };

  } catch (error) {
    console.error('Error fetching product data:', error);
    return null;
  }
}

function generateProductBreadcrumbs(
  product: Product, 
  ancestors: Category[] 
): Array<{ label: string; href: string }> {
  const items: Array<{ label: string; href: string }> = [
    { label: 'Главная', href: '/' },
    { label: 'Каталог', href: '/catalog' },
  ];
  
  let accumulatedPath = '/catalog';

  ancestors.forEach(category => {
    if (category?.handle && category?.name) {
      accumulatedPath += `/${category.handle}`;
      items.push({ label: category.name, href: accumulatedPath });
    }
  });
  
  if (product.name && product.handle) {
    items.push({ 
      label: product.name, 
      href: `/product/${product.handle}` 
    });
  }
  
  return items;
}

export default async function ProductPage({
  params,
}: {
  params: { productHandle: string };
}) {
  const { productHandle } = params;
  const pageData = await getProductData(productHandle);

  if (!pageData?.product) {
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