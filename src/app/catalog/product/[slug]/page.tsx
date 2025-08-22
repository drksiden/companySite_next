import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getProduct } from "@/lib/services/catalog";
import ProductDetailShell from "@/features/catalog/components/ProductDetailShell";
import { Skeleton } from "@/components/ui/skeleton";

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
      };
    }

    return {
      title: `${product.name} | Каталог`,
      description: product.short_description || product.name,
      keywords: [
        product.name,
        product.brands?.name,
        product.categories?.name,
        "купить",
        "интернет-магазин",
      ].filter(Boolean),
      openGraph: {
        title: product.name,
        description: product.short_description || product.name,
        images: product.thumbnail ? [product.thumbnail] : [],
      },
    };
  } catch (error) {
    return {
      title: "Ошибка загрузки товара",
    };
  }
}

function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image skeleton */}
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-md" />
            ))}
          </div>
        </div>

        {/* Details skeleton */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  try {
    const product = await getProduct(slug);

    if (!product) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-background">
        <Suspense fallback={<ProductDetailSkeleton />}>
          <ProductDetailShell product={product} />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Product page error:", error);
    notFound();
  }
}
