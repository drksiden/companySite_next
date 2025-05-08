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
import { useRegion } from '@/providers/region';
import { fetchProductByHandle, Product } from '@/lib/medusaClient';

export default function ProductPage() {
  const { productHandle } = useParams<{ productHandle: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const router = useRouter();
  const { region } = useRegion();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        if (!productHandle) {
          throw new Error('Handle продукта не указан');
        }
        const handle = productHandle;
        const productData = await fetchProductByHandle(handle, region?.id);
        if (!productData) {
          throw new Error('Продукт не найден');
        }
        console.log('Product data:', productData);
        console.log('Product variants:', productData.variants);
        console.log('First variant:', productData.variants?.[0]);
        console.log('Variant prices:', productData.variants?.[0]?.prices);
        setProduct(productData);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Ошибка при загрузке продукта';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (region) {
      fetchProduct();
    }
  }, [productHandle, region]);

  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: region?.currency_code || 'RUB',
    }).format(amount / 100);
  };

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return null;
    return product.variants[0];
  }, [product]);

  const price = useMemo(() => {
    if (!selectedVariant?.calculated_price) return null;
    return formatPrice(selectedVariant.calculated_price.calculated_amount);
  }, [selectedVariant]);

  const isSale = useMemo(() => {
    if (!selectedVariant?.calculated_price) return false;
    return selectedVariant.calculated_price.calculated_price.price_list_type === 'sale';
  }, [selectedVariant]);

  const originalPrice = useMemo(() => {
    if (!isSale || !selectedVariant?.calculated_price) return null;
    return formatPrice(selectedVariant.calculated_price.original_amount);
  }, [isSale, selectedVariant]);

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
      <ProductSeo product={product} />
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
                       ${selectedVariant?.inventory_quantity > 0 
                         ? 'bg-green-100 text-green-800' 
                         : 'bg-red-100 text-red-800'}`}>
                  {selectedVariant?.inventory_quantity > 0 ? 'В наличии' : 'Нет в наличии'}
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
                  disabled={isAddingToCart || addedToCart || !selectedVariant?.id}
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