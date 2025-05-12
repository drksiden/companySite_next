// app/product/[productHandle]/page.tsx

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sdk } from '@/lib/sdk';
import { COMPANY_NAME_SHORT } from '@/data/constants';
import { HttpTypes } from '@medusajs/types';
import ProductClientComponent from '@/components/product/ProductClientComponent';

export const revalidate = 3600;

// ----- ВАЖНО: ЗАМЕНИТЕ НА ВАШ РЕАЛЬНЫЙ ID РЕГИОНА "КАЗАХСТАН" -----
const KAZAKHSTAN_REGION_ID = "reg_01JV0KCGE6A68YG64EJZY98SGB"; // Найдите этот ID в Medusa Admin -> Settings -> Regions

// Типы
type ProductImageType = { 
  id: string; 
  url: string; 
  created_at?: string; 
  updated_at?: string; 
  deleted_at?: string | null; 
  metadata?: Record<string, unknown> | null; 
};

type ProductCategoryType = HttpTypes.StoreProductCategory & {
  parent_category_id?: string | null;
  parent_category?: ProductCategoryType | null;
  category_children?: ProductCategoryType[];
};

// MoneyAmountDTO может быть более подходящим, если MoneyAmount не экспортируется или слишком сложен
type MoneyAmountLenient = {
    id?: string | null;
    currency_code?: string | null;
    amount?: number | null;
    min_quantity?: number | null;
    max_quantity?: number | null;
};

type CalculatedPriceSetLenient = {
    id?: string | null;
    is_calculated_price_tax_inclusive?: boolean | null;
    calculated_amount?: number | null;
    original_amount?: number | null;
    currency_code?: string | null;
    // Добавьте другие поля из CalculatedPriceSet, если они нужны
};

// ProductVariantType - делаем соответствующим ожидаемому в ProductClientComponent
type ProductVariantType = Omit<HttpTypes.StoreProductVariant, 'prices' | 'calculated_price' | 'original_price'> & {
  calculated_price: CalculatedPriceSetLenient;
  original_price?: CalculatedPriceSetLenient | null;
  prices: MoneyAmountLenient[];
};

// ProductType - делаем соответствующим ожидаемому в ProductClientComponent
type ProductType = Omit<HttpTypes.StoreProduct, 'variants' | 'images' | 'categories' | 'collection'> & {
  variants: ProductVariantType[];
  images: ProductImageType[];
  collection?: HttpTypes.StoreCollection | null;
  categories?: ProductCategoryType[] | null;
};

// --- Генерация метаданных ---
export async function generateMetadata({
  params: { productHandle },
}: {
  params: { productHandle: string };
}): Promise<Metadata> {
  console.log(`[Metadata] Product page for handle: ${productHandle}`);
  try {
    const { products } = await sdk.store.product.list({
      handle: productHandle,
      region_id: KAZAKHSTAN_REGION_ID,
      limit: 1,
      fields: "id,title,handle,description,thumbnail",
    });
    const product = products?.[0] as ProductType | undefined;

    if (!product) {
      return { title: `Товар не найден | ${COMPANY_NAME_SHORT}` };
    }

    const pageTitle = `${product.title} | ${COMPANY_NAME_SHORT}`;
    const pageDescription = product.description?.substring(0, 160) || `Купить ${product.title} в ${COMPANY_NAME_SHORT}.`;
    const canonicalUrl = `/product/${product.handle}`;
    const ogImage = product.thumbnail;

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

interface ProductPageData {
  product: ProductType;
  breadcrumbAncestors: ProductCategoryType[];
}

async function getProductData(
  productHandle: string
): Promise<ProductPageData | null> {
  console.log(`[getProductData] For product handle: ${productHandle}`);
  try {
    const { products: productsByHandle } = await sdk.store.product.list({
      handle: productHandle,
      region_id: KAZAKHSTAN_REGION_ID,
      limit: 1,
      fields: "id",
    });

    if (!productsByHandle || productsByHandle.length === 0) {
      console.log(`[getProductData] Product ID not found for handle: ${productHandle}`);
      return null;
    }
    const productId = productsByHandle[0].id;
    console.log(`[getProductData] Product ID found: ${productId} for handle: ${productHandle}`);

    const productFields = [
      "id", "title", "subtitle", "description", "handle", "is_giftcard", "status",
      "thumbnail", "weight", "length", "height", "width", "hs_code", "origin_country",
      "mid_code", "material", "collection_id", "type_id", "discountable", "external_id",
      "created_at", "updated_at", "deleted_at", "profile_id", "metadata",
      "collection.id", "collection.title", "collection.handle",
      "type.id", "type.value",
      "images.id", "images.url", "images.metadata",
      "tags.id", "tags.value",
      "options.id", "options.title", "options.values.id", "options.values.value",
      "variants.id", "variants.title", "variants.sku", "variants.barcode", "variants.ean", "variants.upc",
      "variants.inventory_quantity", "variants.allow_backorder", "variants.manage_inventory",
      "variants.metadata", "variants.created_at", "variants.updated_at", "variants.deleted_at",
      "variants.options.id", "variants.options.value",
      "variants.calculated_price",
      "variants.prices",
      "categories.id", "categories.name", "categories.handle", "categories.parent_category_id"
    ].join(',');

    console.log(`[getProductData] Requesting product ID ${productId} with fields.`);

    const { product } = await sdk.store.product.retrieve(
        productId,
        {
            fields: productFields,
            region_id: KAZAKHSTAN_REGION_ID,
        }
    );

    if (!product) {
      console.log(`[getProductData] Product not found by ID (retrieve): ${productId}`);
      return null;
    }
    
    // Преобразуем данные из API в формат, соответствующий нашим типам
    const processedProduct = {
      ...product,
      variants: Array.isArray(product.variants) ? product.variants.map(variant => ({
        ...variant,
        // Убедимся, что эти поля всегда существуют, даже если они пришли null или undefined
        calculated_price: variant.calculated_price || {
          calculated_amount: 0,
          currency_code: "KZT",
        },
        prices: Array.isArray(variant.calculated_price) ? variant.calculated_price : []
      })) : [],
      images: Array.isArray(product.images) ? product.images : []
    } as ProductType;

    console.log(`[getProductData] Product fetched: ${processedProduct.title}`);
    
    if (processedProduct.variants.length > 0) {
      const firstVariant = processedProduct.variants[0];
      console.log(`  [getProductData] Variant[0] ID: ${firstVariant.id}, Title: ${firstVariant.title}`);
      console.log(`  [getProductData] Variant[0] calculated_price:`, JSON.stringify(firstVariant.calculated_price, null, 2));
      console.log(`  [getProductData] Variant[0] prices array:`, JSON.stringify(firstVariant.prices, null, 2));
    } else {
      console.warn("[getProductData] Product has NO VARIANTS or variants were not fetched correctly!");
    }

    // Логика хлебных крошек
    const breadcrumbAncestors: ProductCategoryType[] = [];
    const primaryCategory = processedProduct.categories?.[0];
    if (primaryCategory?.id) {
        let currentAncestor: ProductCategoryType | null = primaryCategory as ProductCategoryType;
        let safety = 0;
        const retrievedAncestorIds = new Set<string>();

        while(currentAncestor && safety < 10){
            if (retrievedAncestorIds.has(currentAncestor.id)) {
                console.warn(`[getProductData] Detected cycle in category ancestors for ${currentAncestor.id}. Breaking.`);
                break;
            }
            retrievedAncestorIds.add(currentAncestor.id);
            breadcrumbAncestors.unshift(currentAncestor);
            
            if (!currentAncestor.parent_category_id) break;
            safety++;

            try {
                const { product_category: parent } = await sdk.store.category.retrieve(currentAncestor.parent_category_id, {
                    fields: "id,name,handle,parent_category_id"
                }) as { product_category: ProductCategoryType | null };
                currentAncestor = parent;
            } catch (e) {
                currentAncestor = null;
            }
        }
    }
    console.log(`[getProductData] Breadcrumb ancestors:`, breadcrumbAncestors.map(a => a.name));

    return { product: processedProduct, breadcrumbAncestors };

  } catch (error: any) {
    if (error.name === 'MedusaError' && error.message) {
        console.error(`[Page Data Error] MedusaError for '${productHandle}': ${error.message} (Type: ${error.type})`);
    } else {
        console.error(`[Page Data Error] Product Page for handle '${productHandle}':`, error);
    }
    return null;
  }
}

function generateProductBreadcrumbs(
    product: ProductType,
    ancestorsIncludingSelfCategory: ProductCategoryType[]
): Array<{ label: string; href: string }> {
  const items: Array<{ label: string; href: string }> = [
    { label: 'Каталог', href: '/catalog' },
  ];
  let accumulatedPath = '/catalog';
  ancestorsIncludingSelfCategory.forEach(category => {
    if (category && category.handle) {
        accumulatedPath += `/${category.handle}`;
        if (items[items.length -1]?.href !== accumulatedPath) {
            items.push({ label: category.name, href: accumulatedPath });
        }
    }
  });
  const productPagePath = `/product/${product.handle}`;
  if (items[items.length -1]?.href !== productPagePath) {
    items.push({ label: product.title, href: productPagePath });
  }
  return items;
}

export default async function ProductPage({
  params: { productHandle },
}: {
  params: { productHandle: string };
}) {
  console.log(`Rendering ProductPage for handle: ${productHandle}`);
  const pageData = await getProductData(productHandle);

  if (!pageData || !pageData.product) {
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