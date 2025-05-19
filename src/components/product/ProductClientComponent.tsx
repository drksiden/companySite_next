'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Loader2, ShoppingCart, Check } from 'lucide-react';
import ProductGallery from '@/components/product/ProductGallery';
import ProductSeo from '@/components/product/ProductSeo';
import ProductTabs from '@/components/product/ProductTabs';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { toast } from 'sonner';
import { HttpTypes } from '@medusajs/types';
import { Label } from '@/components/ui/label';
import { useCart } from '@/providers/cart';

// Types
type ProductImageType = { id?: string; url: string; metadata?: Record<string, unknown> | null };
type CalculatedPriceSetType = HttpTypes.StoreCalculatedPrice;

type ProductVariantType = HttpTypes.StoreProductVariant & {
  calculated_price?: CalculatedPriceSetType | null;
};

type ProductType = HttpTypes.StoreProduct & {
  variants?: ProductVariantType[] | null;
  images?: ProductImageType[] | null;
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
  }).format(amount);
};

const getSafeString = (value: any, fallback: string = ''): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return fallback;
};

export default function ProductClientComponent({ product, breadcrumbItems }: ProductClientComponentProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantType | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [isAddingToCartLocal, setIsAddingToCartLocal] = useState(false);
  const [addedToCartLocal, setAddedToCartLocal] = useState(false);
  const router = useRouter();

  const { addItem: addItemToCartContext, isLoading: isCartGloballyLoading } = useCart();

  // Debug logs for cart button state
  useEffect(() => {
    console.log('[ProductClientComponent] Product variants:', product.variants);
    console.log('[ProductClientComponent] Selected variant:', selectedVariant);
    console.log('[ProductClientComponent] Is adding to cart:', isAddingToCartLocal);
    console.log('[ProductClientComponent] Added to cart:', addedToCartLocal);
    console.log('[ProductClientComponent] Cart loading state:', isCartGloballyLoading);
    console.log('[ProductClientComponent] Can purchase:', canPurchase);
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      console.log('[ProductClientComponent] Setting default variant:', product.variants[0]);
      setSelectedVariant(product.variants[0]);
    } else if (!product.variants || product.variants.length === 0) {
      console.warn('[ProductClientComponent] No variants available for product:', product.title);
    }
  }, [product.variants, selectedVariant, isAddingToCartLocal, addedToCartLocal, isCartGloballyLoading]);

  const priceInfo = useMemo(() => {
    if (!selectedVariant) {
      return { display: 'Выберите вариант', original: null, currencyCode: 'KZT', isSale: false };
    }

    const price = selectedVariant.calculated_price;
    const currency = price?.currency_code || 'KZT';
    const displayAmount = price?.calculated_amount;
    const originalAmount = price?.original_amount;
    const isSale = originalAmount != null && displayAmount != null && originalAmount > displayAmount;

    return {
      display: formatPrice(displayAmount, currency),
      original: isSale ? formatPrice(originalAmount, currency) : null,
      currencyCode: currency,
      isSale,
    };
  }, [selectedVariant]);

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) {
      console.warn('[ProductClientComponent] Attempted to add to cart with no selected variant');
      toast.error('Пожалуйста, выберите вариант товара.');
      return;
    }
    console.log('[ProductClientComponent] Adding variant to cart:', selectedVariant.id);
    setIsAddingToCartLocal(true);
    setAddedToCartLocal(false);
    try {
      await addItemToCartContext(selectedVariant.id, 1);
      console.log('[ProductClientComponent] Successfully added to cart:', selectedVariant.id);
      setAddedToCartLocal(true);
      toast.success('Товар добавлен в корзину!');
      setTimeout(() => setAddedToCartLocal(false), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error('[ProductClientComponent] Error adding to cart:', error);
      toast.error('Не удалось добавить товар', { description: errorMessage });
    } finally {
      setIsAddingToCartLocal(false);
    }
  };

  const inventoryQuantity = selectedVariant?.inventory_quantity ?? 0;
  const allowBackorder = selectedVariant?.allow_backorder ?? false;
  const canPurchase = inventoryQuantity > 0 || allowBackorder;

  const galleryImages: ProductImageType[] = useMemo(() => {
    const allImages: ProductImageType[] = [];
    if (product.thumbnail && typeof product.thumbnail === 'string') {
      if (!product.images?.find((img) => img.url === product.thumbnail)) {
        allImages.push({ url: product.thumbnail, id: 'thumbnail-main' });
      }
    }
    if (product.images) {
      allImages.push(
        ...product.images
          .filter((img) => typeof img.url === 'string')
          .map((img) => ({ id: img.id || img.url, url: img.url }))
      );
    }
    return Array.from(new Map(allImages.map((img) => [img.url, img])).values());
  }, [product.images, product.thumbnail]);

  const productTitle = getSafeString(product.title, 'Название товара отсутствует');
  const collectionTitle = getSafeString(product.collection?.title);
  const selectedVariantSKU = getSafeString(selectedVariant?.sku);
  const productHandle = getSafeString(product.handle);

  let buttonIcon = <ShoppingCart className="w-5 h-5 mr-2" />;
  let buttonText = 'Добавить в корзину';

  if (isAddingToCartLocal) {
    buttonIcon = <Loader2 className="w-5 h-5 mr-2 animate-spin" />;
    buttonText = 'Добавление...';
  } else if (addedToCartLocal) {
    buttonIcon = <Check className="w-5 h-5 mr-2" />;
    buttonText = 'Добавлено!';
  }

  const safeBreadcrumbItems =
    breadcrumbItems.length > 0
      ? breadcrumbItems
      : [
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products' },
          { label: productTitle, href: `/product/${productHandle}` },
        ];

  return (
    <section className="py-8 lg:py-12 px-4 max-w-7xl mx-auto">
      <ProductSeo
        product={{
          ...product,
          title: productTitle,
          description: typeof product.description === 'string' ? product.description : undefined,
          images: galleryImages.map((img) => ({ url: img.url })),
        }}
      />
      <Breadcrumbs items={safeBreadcrumbItems} className="mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
        <div className="w-full lg:sticky lg:top-24 self-start">
          <ProductGallery images={galleryImages} title={productTitle} />
        </div>

        <div className="w-full flex flex-col gap-6">
          <Card className="border shadow-sm bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-2xl lg:text-3xl font-bold">{productTitle}</CardTitle>
              {collectionTitle && product.collection?.handle && (
                <Link
                  href={`/collections/${product.collection.handle}`}
                  className="text-base text-muted-foreground hover:text-primary transition-colors"
                >
                  Производитель: {collectionTitle}
                </Link>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Артикул: {selectedVariantSKU || productHandle || 'N/A'}
                </p>
                <div
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    canPurchase
                      ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300'
                  }`}
                >
                  {canPurchase ? (inventoryQuantity > 0 ? 'В наличии' : 'Под заказ') : 'Нет в наличии'}
                </div>
              </div>

              {product.variants && product.variants.length > 1 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Варианты:</Label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <Button
                        key={variant.id}
                        variant={selectedVariant?.id === variant.id ? 'default' : 'outline'}
                        onClick={() => setSelectedVariant(variant)}
                        size="sm"
                        className={selectedVariant?.id === variant.id ? 'ring-2 ring-primary' : ''}
                      >
                        {getSafeString(variant.title, 'Вариант')}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="my-2">
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-primary">{priceInfo.display}</p>
                  {priceInfo.isSale && priceInfo.original && (
                    <p className="text-lg text-muted-foreground line-through">{priceInfo.original}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleAddToCart}
                  className="w-full py-6 text-lg font-medium flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={
                    isAddingToCartLocal ||
                    addedToCartLocal ||
                    !selectedVariant?.id ||
                    !canPurchase ||
                    isCartGloballyLoading
                  }
                  aria-label={buttonText}
                >
                  {buttonIcon}
                  {buttonText}
                </Button>
                <Button variant="outline" className="w-full py-5" onClick={() => router.back()}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Продолжить покупки
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ProductTabs
        product={{
          ...product,
          description: typeof product.description === 'string' ? product.description : undefined,
          metadata: product.metadata ?? undefined,
        }}
      />
    </section>
  );
}