// components/product/ProductClientComponent.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
// ... (остальные импорты UI)
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, ShoppingCart, Check } from 'lucide-react';
import ProductGallery from '@/components/product/ProductGallery';
import ProductSeo from '@/components/product/ProductSeo';
import ProductTabs from '@/components/product/ProductTabs';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { toast } from "sonner";
import { sdk } from '@/lib/sdk';
import { HttpTypes } from '@medusajs/types';


// Типы
type ProductImageType = { id?: string; url: string; metadata?: Record<string, unknown> | null; };
type MoneyAmountType = HttpTypes.MoneyAmountDTO; // Или HttpTypes.MoneyAmount, проверьте ваш SDK
type CalculatedPriceSetType = HttpTypes.CalculatedPriceSet;

type ProductVariantType = HttpTypes.StoreProductVariant & {
  calculated_price?: CalculatedPriceSetType | null;
  // original_price само по себе не поле варианта, а часть calculated_price
  prices?: MoneyAmountType[] | null; // Массив "сырых" цен
};

type ProductType = HttpTypes.StoreProduct & {
  variants?: ProductVariantType[] | null;
  images?: ProductImageType[] | null; // Используем наш упрощенный тип
  collection?: HttpTypes.StoreCollection | null;
  categories?: (HttpTypes.StoreProductCategory & { parent_category_id?: string | null })[] | null;
};


interface ProductClientComponentProps {
  product: ProductType;
  breadcrumbItems: Array<{ label: string; href: string }>;
}

const formatPrice = (amount?: number | null, currencyCode: string = 'KZT'): string => {
  if (typeof amount !== 'number' || amount === null) {
    return 'Цена по запросу';
  }
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  }).format(amount / 100);
};

export default function ProductClientComponent({ product, breadcrumbItems }: ProductClientComponentProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantType | undefined>(
    product.variants?.[0]
  );
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setSelectedVariant(product.variants?.[0]);
  }, [product]);

  const priceInfo = useMemo(() => {
    if (!selectedVariant) {
      console.log("No selected variant for priceInfo");
      return { display: 'Цена не указана', original: null, currencyCode: 'KZT', isSale: false };
    }

    let displayAmount: number | null | undefined = undefined;
    let originalAmount: number | null | undefined = undefined;
    let currency = 'KZT';
    let sale = false;

    console.log("Selected Variant for Price Calc:", JSON.stringify(selectedVariant, null, 2));

    if (selectedVariant.calculated_price) {
      console.log("Using calculated_price:", selectedVariant.calculated_price);
      displayAmount = selectedVariant.calculated_price.calculated_amount;
      originalAmount = selectedVariant.calculated_price.original_amount; // Это поле в CalculatedPriceSet
      currency = selectedVariant.calculated_price.currency_code || currency;
      sale = originalAmount != null && displayAmount != null && originalAmount > displayAmount;
    } else {
      console.warn("calculated_price is missing for variant:", selectedVariant.id);
      // Fallback на массив prices, если он есть и содержит данные (маловероятно без expand)
      // Убедитесь, что тип ProductVariantType включает prices?, если вы используете этот fallback
      if (selectedVariant.prices && selectedVariant.prices.length > 0) {
        console.warn("Falling back to variant.prices array.");
        displayAmount = selectedVariant.prices[0].amount;
        currency = selectedVariant.prices[0].currency_code || currency;
         // Не можем определить sale или original_amount из этого массива напрямую
      } else {
        console.warn("No prices array available for fallback on variant:", selectedVariant.id);
      }
    }
    
    console.log("Price Info Calculated:", { displayAmount, originalAmount, currency, sale });

    return {
      display: formatPrice(displayAmount, currency),
      original: sale && originalAmount ? formatPrice(originalAmount, currency) : null,
      currencyCode: currency,
      isSale: sale,
    };
  }, [selectedVariant]);

  // ... (addToCart и остальной JSX остается таким же, как в предыдущем ответе)
  const addToCart = async () => {
    if (!selectedVariant?.id) {
      toast.error("Вариант товара не выбран.");
      return;
    }
    setIsAddingToCart(true);
    try {
      let cartId = localStorage.getItem('cart_id');
      if (!cartId) {
        const cartData = await sdk.store.cart.create({});
        if (cartData.cart?.id) {
          cartId = cartData.cart.id;
          localStorage.setItem('cart_id', cartId);
        } else {
          throw new Error('Не удалось создать корзину.');
        }
      }

      await sdk.store.cart.lineItems.create(cartId, { // ИСПРАВЛЕНО
        variant_id: selectedVariant.id,
        quantity: 1,
      });
      
      toast.success(`${product.title} добавлен в корзину`);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при добавлении в корзину';
      console.error("Add to cart error:", error);
      toast.error("Ошибка", { description: `Не удалось добавить товар: ${errorMessage}` });
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  const inventoryQuantity = selectedVariant?.inventory_quantity ?? 0;
  const allowBackorder = selectedVariant?.allow_backorder ?? false;
  const canPurchase = inventoryQuantity > 0 || allowBackorder;

  return (
    <section className="py-8 lg:py-12 px-4 max-w-7xl mx-auto">
      <ProductSeo product={{
        ...product,
        description: product.description ?? undefined,
        images: product.images?.map(img => ({ url: img.url })) || [],
      }} />
      <Breadcrumbs items={breadcrumbItems} className="mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
        <div className="w-full">
          <ProductGallery images={product.images || []} title={product.title || "Изображение товара"} />
        </div>

        <div className="w-full flex flex-col gap-6">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl lg:text-3xl font-bold">{product.title}</CardTitle>
              {product.collection?.title && (
                <Link href={`/collections/${product.collection.handle}`} className="text-base text-muted-foreground hover:text-primary transition-colors">
                  Производитель: {product.collection.title}
                </Link>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Артикул: {selectedVariant?.sku || product.handle}</p>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                       ${canPurchase ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}
                >
                  {canPurchase ? (inventoryQuantity > 0 ? 'В наличии' : 'Под заказ') : 'Нет в наличии'}
                </div>
              </div>
              
              <div className="my-2">
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-primary">
                    {priceInfo.display}
                  </p>
                  {priceInfo.isSale && priceInfo.original && (
                    <p className="text-lg text-muted-foreground line-through">
                      {priceInfo.original}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={addToCart}
                  className="w-full py-6 text-lg font-medium flex items-center justify-center gap-2"
                  disabled={isAddingToCart || addedToCart || !selectedVariant?.id || !canPurchase}
                >
                  {isAddingToCart ? ( <Loader2 className="w-5 h-5 mr-2 animate-spin" /> ) : 
                   addedToCart ? ( <Check className="w-5 h-5 mr-2" /> ) : 
                   ( <ShoppingCart className="w-5 h-5 mr-2" /> )}
                  {isAddingToCart ? 'Добавление...' : addedToCart ? 'Добавлено!' : 'Добавить в корзину'}
                </Button>
                <Button variant="outline" className="w-full py-5" onClick={() => router.back()} >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Продолжить покупки
                </Button>
              </div>
              
              {product.description && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-medium mb-2 text-foreground">Описание</h3>
                  <div className="prose prose-sm dark:prose-invert text-muted-foreground max-w-none"
                       dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
          
          {product.metadata?.specifications && 
           typeof product.metadata.specifications === 'object' && 
           !Array.isArray(product.metadata.specifications) &&
           Object.keys(product.metadata.specifications).length > 0 && (
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Основные характеристики</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {Object.entries(product.metadata.specifications as Record<string, string | number | boolean>)
                      .slice(0, 7)
                      .map(([key, value]) => (
                        <li key={key} className="flex justify-between items-center pb-2 border-b border-dashed last:border-b-0">
                          <span className="text-muted-foreground text-sm capitalize">{String(key).replace(/_/g, ' ')}:</span>
                          <span className="font-medium text-sm text-right">{String(value)}</span>
                        </li>
                      ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ProductTabs product={{
        ...product,
        description: product.description ?? undefined,
        metadata: product.metadata ?? undefined,
        images: product.images?.map(img => ({ url: img.url })) || [],
      }} />
    </section>
  );
}