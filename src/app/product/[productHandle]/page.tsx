// src/app/product/[productHandle]/page.tsx

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sdk } from '@/lib/sdk';
import { COMPANY_NAME_SHORT } from '@/data/constants';
import { HttpTypes } from '@medusajs/types'; // Используем напрямую типы из SDK
import ProductClientComponent from '@/components/product/ProductClientComponent';

export const revalidate = 3600;

const KAZAKHSTAN_REGION_ID = "reg_01JV0KCGE6A68YG64EJZY98SGB";

// Типы, которые мы передаем в ProductClientComponent.
// ProductClientComponent сам определяет свои ожидания на основе HttpTypes.
// Поэтому здесь мы будем стремиться вернуть продукт, максимально близкий к HttpTypes.StoreProduct.
// Локальные типы ProductType и ProductVariantType в page.tsx теперь могут быть не нужны,
// если ProductPageData.product будет просто HttpTypes.StoreProduct (с нужными расширениями).

// --- Генерация метаданных ---
export async function generateMetadata(
  props: { params: { productHandle: string } }
): Promise<Metadata> {
  const productHandle = props.params.productHandle;
  console.log(`[Metadata] Product page for handle: ${productHandle}`);
  try {
    // Запрос минимальных данных для метатегов
    const { products } = await sdk.store.product.list({
      handle: productHandle,
      region_id: KAZAKHSTAN_REGION_ID,
      limit: 1,
      fields: "id,title,handle,description,thumbnail",
    });
    
    const productData = products?.[0];

    if (!productData || !productData.title || !productData.handle) {
      return { title: `Товар не найден | ${COMPANY_NAME_SHORT}` };
    }

    const pageTitle = `${productData.title} | ${COMPANY_NAME_SHORT}`;
    const pageDescription = productData.description?.substring(0, 160) || `Купить ${productData.title} в ${COMPANY_NAME_SHORT}.`;
    const canonicalUrl = `/product/${productData.handle}`;
    const ogImage = productData.thumbnail;

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
    console.error(`[Metadata Error] Product '${productHandle}':`, error);
    return { title: `Ошибка загрузки товара | ${COMPANY_NAME_SHORT}` };
  }
}

// Тип для данных, возвращаемых getProductData
// ProductClientComponent ожидает product: ProductType (локальный для него, который HttpTypes.StoreProduct & {...})
// Мы должны вернуть нечто совместимое. HttpTypes.StoreProduct должен подойти, если ProductClientComponent
// не требует дополнительных полей, которых нет в HttpTypes.StoreProduct.
interface ProductPageData {
  product: HttpTypes.StoreProduct; // Используем тип из SDK
  breadcrumbAncestors: (HttpTypes.StoreProductCategory & { parent_category_id?: string | null })[];
}

async function getProductData(
  productHandle: string
): Promise<ProductPageData | null> {
  console.log(`[getProductData] For product handle: ${productHandle}`);
  try {
    const { products: productsByHandle } = await sdk.store.product.list({
      handle: productHandle,
      limit: 1,
      fields: "id",
    });

    if (!productsByHandle || productsByHandle.length === 0 || !productsByHandle[0].id) {
      console.log(`[getProductData] Product ID not found for handle: ${productHandle}`);
      return null;
    }
    const productId = productsByHandle[0].id;
    console.log(`[getProductData] Product ID found: ${productId} for handle: ${productHandle}`);

    // Поля, необходимые для страницы товара, включая выбор вариантов и цены
    // ВАЖНО: `variants.calculated_price` - это объект CalculatedPriceSet от Medusa
    const productFields = [
      "id", "title", "subtitle", "description", "handle", "status", "metadata", "thumbnail",
      "images.id", "images.url", "images.metadata", // images теперь будут HttpTypes.StoreImage[]
      "options.id", "options.title", "options.values.id", "options.values.value",
      "variants.id", "variants.title", "variants.sku",
      "variants.inventory_quantity", "variants.allow_backorder", "variants.manage_inventory",
      "variants.metadata", "variants.options.id", "variants.options.value",
      "variants.calculated_price", // Запрашиваем объект calculated_price
      "categories.id", "categories.name", "categories.handle", "categories.parent_category_id",
      "collection.id", "collection.title", "collection.handle",
      "type.id", "type.value",
    ].join(',');

    console.log(`[getProductData] Requesting product ID ${productId} with fields for region ${KAZAKHSTAN_REGION_ID}.`);

    const { product: sdkProduct } = await sdk.store.product.retrieve(
        productId,
        {
            fields: productFields,
            region_id: KAZAKHSTAN_REGION_ID, // Для региональных цен
        }
    );

    if (!sdkProduct) {
      console.log(`[getProductData] Product not found by ID (retrieve): ${productId}`);
      return null;
    }

    // sdkProduct уже должен иметь правильную структуру, включая variants с calculated_price (типа CalculatedPriceSet)
    // Никакой дополнительной обработки структуры цены здесь не требуется, если ProductClientComponent
    // ожидает HttpTypes.StoreProduct и HttpTypes.StoreProductVariant с HttpTypes.CalculatedPriceSet.

    // Логирование для проверки
    if (Array.isArray(sdkProduct.variants) && sdkProduct.variants.length > 0) {
      const firstSdkVariant = sdkProduct.variants[0] as HttpTypes.StoreProductVariant & { calculated_price?: HttpTypes.StoreCalculatedPrice | null };
      console.log(`  [getProductData] SDK Variant[0] ID: ${firstSdkVariant.id}, Title: ${firstSdkVariant.title}`);
      console.log(`  [getProductData] SDK Variant[0] calculated_price object:`, JSON.stringify(firstSdkVariant.calculated_price, null, 2));
      if (firstSdkVariant.calculated_price?.calculated_amount === null) {
        console.warn(`[getProductData] Variant ${firstSdkVariant.id}: calculated_amount is NULL for region ${KAZAKHSTAN_REGION_ID}.`);
      }
    } else {
      console.warn("[getProductData] Product has NO VARIANTS or variants array is empty/corrupt!");
    }
    
    console.log(`[getProductData] Product fetched: ${sdkProduct.title}`);

    // Логика хлебных крошек
    const breadcrumbAncestors: (HttpTypes.StoreProductCategory & { parent_category_id?: string | null })[] = [];
    const primaryCategory = sdkProduct.categories?.[0] as (HttpTypes.StoreProductCategory & { parent_category_id?: string | null }) | undefined;
    
    if (primaryCategory?.id) {
        let currentAncestor: (HttpTypes.StoreProductCategory & { parent_category_id?: string | null }) | null = primaryCategory;
        let safety = 0;
        const retrievedAncestorIds = new Set<string>();
        while(currentAncestor && safety < 10){ // currentAncestor здесь не должен быть null на первой итерации
            if (retrievedAncestorIds.has(currentAncestor.id)) { // id точно есть
                console.warn(`[getProductData] Detected cycle in category ancestors for ${currentAncestor.id}. Breaking.`);
                break;
            }
            retrievedAncestorIds.add(currentAncestor.id);
            breadcrumbAncestors.unshift(currentAncestor);
            
            if (!currentAncestor.parent_category_id) break;
            safety++;

            try {
                // currentAncestor.parent_category_id здесь точно существует
                const { product_category: parent } = await sdk.store.category.retrieve(currentAncestor.parent_category_id, {
                    fields: "id,name,handle,parent_category_id"
                }) as { product_category: (HttpTypes.StoreProductCategory & { parent_category_id?: string | null }) | null };
                currentAncestor = parent;
            } catch (e) {
                console.error(`[getProductData] Error fetching parent category ${currentAncestor?.parent_category_id || 'unknown_id'}:`, e);
                currentAncestor = null; 
            }
        }
    }
    console.log(`[getProductData] Breadcrumb ancestors:`, breadcrumbAncestors.map(a => a.name));

    return { product: sdkProduct as HttpTypes.StoreProduct, breadcrumbAncestors };

  } catch (error: any) {
    if (error?.name === 'MedusaError' && error?.message) {
        console.error(`[Page Data Error] MedusaError for '${productHandle}': ${error.message} (Type: ${error.type})`);
    } else {
        console.error(`[Page Data Error] Product Page for handle '${productHandle}':`, error);
    }
    return null;
  }
}

// Тип для ProductType в generateProductBreadcrumbs должен совпадать с тем, что возвращает getProductData
function generateProductBreadcrumbs(
    product: HttpTypes.StoreProduct, // Используем HttpTypes.StoreProduct
    ancestorsIncludingSelfCategory: (HttpTypes.StoreProductCategory & { parent_category_id?: string | null })[]
): Array<{ label: string; href: string }> {
  const items: Array<{ label: string; href: string }> = [
    { label: 'Каталог', href: '/catalog' },
  ];
  let accumulatedPath = '/catalog';
  ancestorsIncludingSelfCategory.forEach(category => {
    if (category && category.handle && category.name) {
        accumulatedPath += `/${category.handle}`;
        if (items[items.length -1]?.href !== accumulatedPath) {
            items.push({ label: category.name, href: accumulatedPath });
        }
    }
  });
  // product.handle и product.title должны быть доступны, так как мы их запрашиваем
  const productPagePath = `/product/${product.handle!}`; 
  if (product.title && (items.length === 0 || items[items.length -1]?.href !== productPagePath)) {
    items.push({ label: product.title, href: productPagePath });
  }
  return items;
}

export default async function ProductPage(
  props: { params: { productHandle: string } }
) {
  const productHandle = props.params.productHandle;
  console.log(`Rendering ProductPage for handle: ${productHandle}`);
  const pageData = await getProductData(productHandle);

  if (!pageData || !pageData.product) {
    notFound();
  }

  const { product, breadcrumbAncestors } = pageData;
  const breadcrumbItems = generateProductBreadcrumbs(product, breadcrumbAncestors);

  // ProductClientComponent теперь будет получать product типа HttpTypes.StoreProduct
  // Убедитесь, что ProductClientComponentProps.product также ожидает HttpTypes.StoreProduct
  // или тип, который структурно совместим (как ваши локальные типы в ProductClientComponent).
  return (
    <ProductClientComponent
      product={product}
      breadcrumbItems={breadcrumbItems}
    />
  );
}