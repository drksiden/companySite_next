import { NextSeo } from 'next-seo';

interface Product {
  title: string;
  description?: string;
  images: { url: string }[];
}

interface ProductSeoProps {
  product: Product;
}

export default function ProductSeo({ product }: ProductSeoProps) {
  return (
    <NextSeo
      title={product.title}
      description={product.description || 'Описание товара отсутствует'}
      openGraph={{
        title: product.title,
        description: product.description || 'Описание товара отсутствует',
        images: product.images?.map((img) => ({
          url: img.url,
          alt: product.title,
        })),
      }}
    />
  );
}