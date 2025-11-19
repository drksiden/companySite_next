import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getProduct } from "@/lib/services/catalog";
import ProductDetailShell from "@/features/catalog/components/ProductDetailShell";
import { Skeleton } from "@/components/ui/skeleton";
import { createAdminClient } from "@/lib/supabaseServer";
import { formatPrice } from "@/lib/utils";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await getProduct(slug);

    if (!product) {
      return {
        title: "Товар не найден",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asia-ntb.kz';
    const productUrl = `${siteBaseUrl}/catalog/product/${slug}`;
    
    // Получаем изображение товара (абсолютный URL для OG)
    let productImage: string | null = product.thumbnail || (product.images && product.images.length > 0 ? product.images[0] : null);
    if (productImage && !productImage.startsWith('http')) {
      // Если относительный URL, делаем абсолютным
      productImage = productImage.startsWith('/') 
        ? `${siteBaseUrl}${productImage}`
        : `${siteBaseUrl}/${productImage}`;
    }
    
    const description = product.short_description || product.description || `${product.name}. ${product.brands?.name ? `Бренд ${product.brands.name}. ` : ''}Купить в Казахстане.`;

    return {
      title: `${product.name} | Каталог`,
      description,
      keywords: [
        product.name,
        product.brands?.name,
        product.categories?.name,
        "купить",
        "Казахстан",
        "системы безопасности",
        "автоматизация",
      ].filter(Boolean) as string[],
      alternates: {
        canonical: `/catalog/product/${slug}`,
      },
      openGraph: {
        title: product.name,
        description,
        url: productUrl,
        siteName: 'Азия NTB',
        type: 'website',
        locale: 'ru_RU',
        images: productImage ? [
          {
            url: productImage,
            width: 1200,
            height: 630,
            alt: product.name,
          }
        ] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description,
        images: productImage ? [productImage] : [],
      },
    };
  } catch (error) {
    return {
      title: "Ошибка загрузки товара",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-5 w-64" />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images Skeleton */}
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-md" />
              ))}
            </div>
          </div>

          {/* Product Details Skeleton */}
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-3">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>

            {/* Short Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            {/* Technical Description */}
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <div className="flex gap-3 items-center">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-40" />
              </div>
              <Skeleton className="h-12 w-full" />
            </div>

            {/* Additional Info Card */}
            <div className="border rounded-lg p-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="mt-8 border rounded-lg">
          <div className="p-6">
            <div className="flex gap-4 border-b pb-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-3 pt-6">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </div>

        {/* Related Products Skeleton */}
        <div className="mt-12 space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

async function ProductPageContent({ slug }: { slug: string }) {
  try {
    const product = await getProduct(slug);

    if (!product) {
      notFound();
    }

    // Загружаем похожие товары из той же категории, затем из того же бренда, затем популярные
    let relatedProducts: any[] = [];
    const supabase = await createAdminClient();
    
    const transformProduct = (p: any) => {
      const finalPrice = p.sale_price || p.base_price;
      const isOnSale = !!(p.sale_price && p.sale_price < p.base_price);
      const discountPercentage = isOnSale
        ? Math.round(((p.base_price - p.sale_price) / p.base_price) * 100)
        : 0;

      const currencySymbol = Array.isArray(p.currencies) 
        ? (p.currencies[0]?.symbol || "₸")
        : (p.currencies?.symbol || "₸");

      // Обработка images - убеждаемся что это массив
      const images = Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []);
      const thumbnail = p.thumbnail || (images.length > 0 ? images[0] : null);

      return {
        ...p,
        thumbnail,
        images,
        final_price: finalPrice,
        is_on_sale: isOnSale,
        discount_percentage: discountPercentage,
        formatted_price: formatPrice(finalPrice, currencySymbol),
        brands: Array.isArray(p.brands) ? p.brands[0] || null : p.brands,
        categories: Array.isArray(p.categories) ? p.categories[0] || null : p.categories,
        currencies: Array.isArray(p.currencies) ? p.currencies[0] || null : p.currencies,
      };
    };

    const selectQuery = `
      id,
      name,
      slug,
      sku,
      short_description,
      base_price,
      sale_price,
      thumbnail,
      images,
      inventory_quantity,
      track_inventory,
      is_featured,
      status,
      created_at,
      view_count,
      sales_count,
      brands(
        id,
        name,
        slug,
        logo_url
      ),
      categories(
        id,
        name,
        slug,
        path,
        level
      ),
      currencies(
        id,
        code,
        symbol,
        name
      )
    `;

    try {
      // Сначала загружаем товары из той же категории
      if (product.categories?.id) {
        const { data: relatedData } = await supabase
          .from("products")
          .select(selectQuery)
          .eq("category_id", product.categories.id)
          .eq("status", "active")
          .neq("id", product.id)
          .order("is_featured", { ascending: false })
          .order("view_count", { ascending: false })
          .limit(8);

        if (relatedData) {
          relatedProducts = relatedData.map(transformProduct);
        }
      }

      // Если товаров из категории меньше 4, догружаем товары того же бренда
      if (relatedProducts.length < 4 && product.brands?.id) {
        const existingIds = new Set(relatedProducts.map(p => p.id));
        existingIds.add(product.id);

        const { data: brandData } = await supabase
          .from("products")
          .select(selectQuery)
          .eq("brand_id", product.brands.id)
          .eq("status", "active")
          .order("is_featured", { ascending: false })
          .order("view_count", { ascending: false })
          .limit(12);

        if (brandData) {
          const filteredBrandData = brandData
            .filter(p => !existingIds.has(p.id))
            .slice(0, 4 - relatedProducts.length)
            .map(transformProduct);
          relatedProducts = [...relatedProducts, ...filteredBrandData];
        }
      }

      // Если всё ещё меньше 4 товаров, догружаем популярные товары
      if (relatedProducts.length < 4) {
        const existingIds = new Set(relatedProducts.map(p => p.id));
        existingIds.add(product.id);

        const { data: popularData } = await supabase
          .from("products")
          .select(selectQuery)
          .eq("status", "active")
          .order("is_featured", { ascending: false })
          .order("view_count", { ascending: false })
          .order("sales_count", { ascending: false })
          .limit(12);

        if (popularData) {
          const filteredPopularData = popularData
            .filter(p => !existingIds.has(p.id))
            .slice(0, 4 - relatedProducts.length)
            .map(transformProduct);
          relatedProducts = [...relatedProducts, ...filteredPopularData];
        }
      }
    } catch (error) {
      console.error("Error loading related products:", error);
    }

    const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asia-ntb.kz';
    const productUrl = `${siteBaseUrl}/catalog/product/${product.slug}`;
    const productImage = product.thumbnail || (product.images && product.images.length > 0 ? product.images[0] : null);
    const finalPrice = product.sale_price || product.base_price;
    
    // Breadcrumbs для JSON-LD
    const breadcrumbItems = [
      { name: 'Главная', url: '/' },
      { name: 'Каталог', url: '/catalog' },
    ];
    
    if (product.categories) {
      // Можно добавить категорию в breadcrumbs, если нужно
      breadcrumbItems.push({
        name: product.categories.name,
        url: product.categories.path ? `/catalog/${product.categories.path}` : `/catalog/${product.categories.slug}`,
      });
    }
    
    breadcrumbItems.push({
      name: product.name,
      url: `/catalog/product/${product.slug}`,
    });

    return (
      <>
        <ProductJsonLd
          product={{
            name: product.name,
            description: product.short_description || product.description || product.name,
            image: productImage || undefined,
            sku: product.sku,
            price: finalPrice,
            currency: product.currencies?.code || 'KZT',
            brand: product.brands?.name,
            category: product.categories?.name,
            availability: (product.inventory_quantity > 0 || !product.track_inventory) ? 'InStock' : 'OutOfStock',
            url: productUrl,
          }}
        />
        <BreadcrumbJsonLd items={breadcrumbItems} />
        <ProductDetailShell product={product} relatedProducts={relatedProducts} />
      </>
    );
  } catch (error) {
    console.error("Product page error:", error);
    notFound();
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductPageContent slug={slug} />
      </Suspense>
    </div>
  );
}
