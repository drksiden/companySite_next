import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailPage from "@/components/catalog/ProductDetailPage";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/products/${slug}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        title: "Товар не найден",
        description: "Запрашиваемый товар не найден",
      };
    }

    const data = await response.json();
    const product = data.data?.product;

    if (!product) {
      return {
        title: "Товар не найден",
        description: "Запрашиваемый товар не найден",
      };
    }

    const title = product.meta_title || `${product.name} - Купить в Казахстане`;
    const description =
      product.meta_description ||
      product.short_description ||
      `${product.name} по выгодной цене. ${product.brand_name ? `Бренд ${product.brand_name}. ` : ""}Доставка по Казахстану.`;

    return {
      title,
      description,
      keywords: product.meta_keywords,
      openGraph: {
        title,
        description,
        images: product.thumbnail
          ? [{ url: product.thumbnail, alt: product.name }]
          : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: product.thumbnail ? [product.thumbnail] : [],
      },
      alternates: {
        canonical: `/product/${slug}`,
      },
    };
  } catch (error) {
    return {
      title: "Товар не найден",
      description: "Запрашиваемый товар не найден",
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const response = await fetch(`${baseUrl}/api/products/${slug}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      notFound();
    }

    const data = await response.json();

    if (!data.success || !data.data?.product) {
      notFound();
    }

    return (
      <ProductDetailPage
        product={data.data.product}
        relatedProducts={data.data.relatedProducts || []}
      />
    );
  } catch (error) {
    notFound();
  }
}
