// src/components/product/ProductSeo.tsx
'use client';

import Head from 'next/head';

interface Product {
  id: string;
  name: string;
  description?: string | null;
  image_urls?: string[] | null;
  handle?: string | null;
}

interface ProductSeoProps {
  product: Product;
}

export default function ProductSeo({ product }: ProductSeoProps) {
  const title = product.name;
  const description = product.description || 'Описание товара отсутствует';
  const images = product.image_urls || [];
  const url = `/catalog/product/${product.handle}`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="product" />
      {images.length > 0 && (
        <meta property="og:image" content={images[0]} />
      )}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {images.length > 0 && (
        <meta name="twitter:image" content={images[0]} />
      )}
      <link rel="canonical" href={url} />
    </Head>
  );
}