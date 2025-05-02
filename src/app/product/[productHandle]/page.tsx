'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, PackageSearch, Loader2, ShoppingCart, Check } from 'lucide-react';
import Medusa from '@medusajs/medusa-js';
import ProductGallery from '@/components/product/ProductGallery';
import ProductSeo from '@/components/product/ProductSeo';
import ProductTabs from '@/components/product/ProductTabs';
import { toast } from "sonner"

interface Product {
  id: string;
  title: string;
  description?: string;
  handle: string;
  images: { url: string }[];
  variants: { id: string; prices: { amount: number; currency_code: string }[] }[];
  categories?: { handle: string; name: string }[];
  collection?: { handle: string; title: string };
  metadata?: {
    [key: string]: any;
    specifications?: { [key: string]: string };
  };
}

const medusaClient = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000',
  maxRetries: 3,
  publishableApiKey: process.env.NEXT_PUBLIC_MEDUSA_API_KEY || '',
});

const Breadcrumbs = ({
  manufacturerHandle,
  manufacturerName,
  categoryHandle,
  categoryName,
  productTitle,
}: {
  manufacturerHandle?: string;
  manufacturerName?: string;
  categoryHandle?: string;
  categoryName?: string;
  productTitle?: string;
}) => (
  <nav className="mb-6 text-sm" aria-label="Breadcrumb">
    <ol className="flex flex-wrap items-center gap-2">
      <li>
        <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
          Главная
        </Link>
      </li>
      <li className="text-muted-foreground">/</li>
      <li>
        <Link href="/catalog" className="text-muted-foreground hover:text-foreground transition-colors">
          Каталог
        </Link>
      </li>
      {manufacturerHandle && manufacturerName && (
        <>
          <li className="text-muted-foreground">/</li>
          <li>
            <Link
              href={`/catalog/manufacturer/${manufacturerHandle}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {manufacturerName}
            </Link>
          </li>
        </>
      )}
      {categoryHandle && categoryName && (
        <>
          <li className="text-muted-foreground">/</li>
          <li>
            <Link
              href={`/catalog/manufacturer/${manufacturerHandle}/category/${categoryHandle}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {categoryName}
            </Link>
          </li>
        </>
      )}
      {productTitle && (
        <>
          <li className="text-muted-foreground">/</li>
          <li className="font-medium text-foreground truncate max-w-xs">{productTitle}</li>
        </>
      )}
    </ol>
  </nav>
);

export default function ProductPage() {
  const { productHandle } = useParams<{ productHandle: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await medusaClient.products.list({ handle: productHandle });
        const products = response.products;
        if (!products || products.length === 0) {
          throw new Error('Продукт не найден');
        }
        setProduct(products[0]);
      } catch (err: any) {
        setError(err.message || 'Ошибка при загрузке продукта');
      } finally {
        setIsLoading(false);
      }
    };

    if (productHandle) {
      fetchProduct();
    }
  }, [productHandle]);

  const addToCart = async (product: Product) => {
    try {
      setIsAddingToCart(true);
      let cartId = localStorage.getItem('cartId');
      if (!cartId) {
        const { cart } = await medusaClient.carts.create();
        cartId = cart.id;
        localStorage.setItem('cartId', cart.id);
      }

      const variantId = product.variants?.[0]?.id;
      if (variantId) {
        await medusaClient.carts.lineItems.create(cartId, {
          variant_id: variantId,
          quantity: 1,
        });
        
        // Показываем уведомление
        toast?.success(`${product.title} успешно добавлен в корзину`);
        
        // Подтверждаем в интерфейсе
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000); // Вернем кнопку в исходное состояние через 2 секунды
      } else {
        setError('Вариант продукта не найден');
      }
    } catch (err: any) {
      setError('Ошибка при добавлении в корзину');
      toast?.error("Ошибка", {
        description: "Не удалось добавить товар в корзину",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-16 px-4 text-center text-muted-foreground flex flex-col items-center gap-4">
        <PackageSearch className="w-12 h-12 mx-auto" />
        <p>{error || 'Товар не найден'}</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
      </div>
    );
  }

  const price = product.variants?.[0]?.prices?.[0];
  const formattedPrice = price
    ? `${(price.amount / 100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ${price.currency_code.toUpperCase()}`
    : 'Цена недоступна';

  return (
    <section className="py-8 lg:py-12 px-4 max-w-7xl mx-auto">
      <ProductSeo product={product} />
      <Breadcrumbs
        manufacturerHandle={product.collection?.handle}
        manufacturerName={product.collection?.title}
        categoryHandle={product.categories?.[0]?.handle}
        categoryName={product.categories?.[0]?.name}
        productTitle={product.title}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="w-full">
          <ProductGallery images={product.images || []} title={product.title} />
        </div>

        <div className="w-full flex flex-col gap-6">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl lg:text-3xl font-bold">{product.title}</CardTitle>
              {product.collection && (
                <p className="text-base text-muted-foreground">
                  Производитель: {product.collection.title}
                </p>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Артикул: {product.handle}</p>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                       bg-green-100 text-green-800">
                  В наличии
                </div>
              </div>
              
              <div className="my-2">
                <p className="text-3xl font-bold text-primary">{formattedPrice}</p>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => addToCart(product)}
                  className="w-full py-6 text-lg font-medium flex items-center justify-center gap-2"
                  disabled={isAddingToCart || addedToCart || !product.variants?.[0]?.id}
                >
                  {isAddingToCart ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : addedToCart ? (
                    <Check className="w-5 h-5 mr-2" />
                  ) : (
                    <ShoppingCart className="w-5 h-5 mr-2" />
                  )}
                  {isAddingToCart 
                    ? 'Добавление...'
                    : addedToCart 
                    ? 'Добавлено' 
                    : 'Добавить в корзину'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full py-5"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Вернуться к каталогу
                </Button>
              </div>
              
              {product.description && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-medium mb-2">Описание</h3>
                  <p className="text-muted-foreground text-sm">
                    {product.description.length > 200 
                      ? `${product.description.substring(0, 200)}...` 
                      : product.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {product.metadata?.specifications && Object.keys(product.metadata.specifications).length > 0 && (
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Основные характеристики</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {Object.entries(product.metadata.specifications)
                    .slice(0, 5)
                    .map(([key, value]) => (
                      <li key={key} className="flex justify-between pb-2 border-b border-dashed">
                        <span className="text-muted-foreground">{key}</span>
                        <span className="font-medium">{value}</span>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ProductTabs product={product} />
    </section>
  );
}