'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, PackageSearch, Loader2, ShoppingCart, Check } from 'lucide-react';
import ProductGallery from '@/components/product/ProductGallery';
import ProductSeo from '@/components/product/ProductSeo';
import ProductTabs from '@/components/product/ProductTabs';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { toast } from "sonner";
// import { useRegion } from '@/providers/region'; // Провайдер региона удален
import { fetchProductByHandle, medusaClient, Product } from '@/lib/medusaClient';

export default function ProductPage() {
  const { productHandle } = useParams<{ productHandle: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const router = useRouter();
  // const { region } = useRegion(); // Провайдер региона удален

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null); // Очищаем предыдущие ошибки
        if (!productHandle) {
          throw new Error('Handle продукта не указан');
        }
        const handle = productHandle;
        const productData = await fetchProductByHandle(handle); // Вызываем без regionId
        if (!productData) {
          throw new Error('Продукт не найден');
        }
        // Логируем данные только если они успешно получены
        console.log('Product data:', productData); 
        console.log('Product variants:', productData?.variants);
        console.log('First variant:', productData?.variants?.[0]);
        console.log('Variant prices:', productData?.variants?.[0]?.prices);
        setProduct(productData);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Ошибка при загрузке продукта';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    // Условие if (region) удалено, т.к. region больше не используется для этого запроса
    fetchProduct();
  }, [productHandle]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return null;
    return product.variants[0];
  }, [product]);

  const formatPrice = (amount: number, currencyCode?: string): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currencyCode || // 1. Явно переданный код
                selectedVariant?.calculated_price?.currency_code || // 2. Код из calculated_price
                selectedVariant?.prices?.[0]?.currency_code ||    // 3. Код из первого элемента массива prices
                'KZT', // 4. Валюта по умолчанию
    }).format(amount / 100);
  };

  const price = useMemo(() => {
    if (!selectedVariant?.calculated_price?.calculated_amount) return null;
    return formatPrice(
      selectedVariant.calculated_price.calculated_amount, 
      selectedVariant.calculated_price.currency_code // Приоритет валюты из calculated_price
    );
  }, [selectedVariant, formatPrice]);

  const isSale = useMemo(() => {
    if (!selectedVariant?.calculated_price) return false;
    // Используем calculated_price_type для определения скидки
    return selectedVariant.calculated_price.calculated_price_type === 'sale';
  }, [selectedVariant]);

  const originalPrice = useMemo(() => {
    if (!isSale || !selectedVariant?.calculated_price) return null;
    return formatPrice(selectedVariant.calculated_price.original_amount, selectedVariant.calculated_price.currency_code);
  }, [isSale, selectedVariant, formatPrice]);

  const addToCart = async (product: Product) => {
    try {
      setIsAddingToCart(true);
      let currentCartId = localStorage.getItem('cartId');
      if (!currentCartId) {
        const { cart } = await medusaClient.carts.create();
        // Убедимся, что cart.id является строкой перед использованием
        if (typeof cart.id === 'string') {
          currentCartId = cart.id;
          localStorage.setItem('cartId', cart.id);
        } else {
          throw new Error('Не удалось создать корзину: ID не является строкой.');
        }
      }

      if (!currentCartId) { // Дополнительная проверка, если cartId все еще null
        throw new Error('Не удалось получить или создать ID корзины.');
      }

      const variantId = product.variants?.[0]?.id;
      if (variantId) {
        await medusaClient.carts.lineItems.create(currentCartId, {
          variant_id: variantId,
          quantity: 1,
        });
        
        toast?.success(`${product.title} успешно добавлен в корзину`);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
      } else {
        setError('Вариант продукта не найден');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при добавлении в корзину';
      setError(errorMessage);
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

  // Формируем путь для хлебных крошек
  const breadcrumbItems = [
    { label: 'Каталог', href: '/catalog' }
  ];

  if (product.collection) {
    breadcrumbItems.push({
      label: product.collection.title,
      href: `/catalog/manufacturer/${product.collection.handle}`
    });
  }

  if (product.categories?.[0]) {
    breadcrumbItems.push({
      label: product.categories[0].name,
      href: `/catalog/${product.categories[0].handle}`
    });
  }

  breadcrumbItems.push({
    label: product.title,
    href: `/product/${product.handle}`
  });

  return (
    <section className="py-8 lg:py-12 px-4 max-w-7xl mx-auto">
      {/* Преобразуем product.description: string | null в string | undefined для ProductSeo */}
      <ProductSeo product={{
        ...product,
        description: product.description ?? undefined
      }} />
      <Breadcrumbs items={breadcrumbItems} className="mb-8" />

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
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                       ${(selectedVariant?.inventory_quantity ?? 0) > 0
                         ? 'bg-green-100 text-green-800'
                         : 'bg-red-100 text-red-800'}`}
                >
                  {selectedVariant && (selectedVariant.inventory_quantity ?? 0) > 0 ? 'В наличии' : 'Нет в наличии'}
                </div>
              </div>
              
              <div className="my-2">
                {price ? (
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold text-primary">
                      {price}
                    </p>
                    {isSale && originalPrice && (
                      <p className="text-lg text-muted-foreground line-through">
                        {originalPrice}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-lg text-muted-foreground">Цена недоступна</p>
                )}
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => addToCart(product)}
                  className="w-full py-6 text-lg font-medium flex items-center justify-center gap-2"
                  disabled={isAddingToCart || addedToCart || !selectedVariant?.id || (selectedVariant?.inventory_quantity ?? 0) <= 0}
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
          
          {product.metadata?.specifications && 
           typeof product.metadata.specifications === 'object' && 
           !Array.isArray(product.metadata.specifications) && // Убедимся, что это не массив
           Object.keys(product.metadata.specifications).length > 0 && (
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Основные характеристики</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {Object.entries(product.metadata.specifications as Record<string, unknown>) // Приводим тип для Object.entries
                      .slice(0, 5)
                      .map(([key, value]) => (
                        <li key={key} className="flex justify-between pb-2 border-b border-dashed">
                          <span className="text-muted-foreground text-sm">{String(key)}</span>
                          <span className="font-medium text-sm">{String(value)}</span>
                        </li>
                      ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Преобразуем product.description: string | null в string | undefined для ProductTabs */}
      <ProductTabs product={{
        ...product,
        description: product.description ?? undefined,
        metadata: product.metadata ?? undefined,
      }} />
    </section>
  );
}