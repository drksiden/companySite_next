'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // CardDescription removed as it's not used
import { ArrowLeft, Loader2, ShoppingCart, Check } from 'lucide-react';
import ProductGallery from '@/components/product/ProductGallery';
import ProductSeo from '@/components/product/ProductSeo';
import ProductTabs from '@/components/product/ProductTabs';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { toast } from 'sonner';
import { Product } from '@/types/supabase'; // Adjusted path
import { useCart } from '@/providers/cart';

interface ProductClientComponentProps {
  product: Product; // Use Supabase Product type
  breadcrumbItems: Array<{ label: string; href: string }>;
}

// formatPrice remains the same as it's generic
const formatPrice = (amount?: number | null, currencyCode: string = 'KZT'): string => {
  if (typeof amount !== 'number' || amount === null) {
    return 'Цена по запросу';
  }
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  }).format(amount); // Assuming amount is already in the correct denomination
};

const getSafeString = (value: any, fallback: string = ''): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return fallback;
};

export default function ProductClientComponent({ product, breadcrumbItems }: ProductClientComponentProps) {
  const [isAddingToCartLocal, setIsAddingToCartLocal] = useState(false);
  const [addedToCartLocal, setAddedToCartLocal] = useState(false);
  const router = useRouter();

  const { addItem: addItemToCartContext, isLoading: isCartGloballyLoading } = useCart();

  // Price and Sale Info
  const priceInfo = useMemo(() => {
    const display = formatPrice(product.price, product.currency_code);
    const original = product.original_price ? formatPrice(product.original_price, product.currency_code) : null;
    const isSale = product.original_price != null && product.price != null && product.original_price > product.price;
    return { display, original, isSale };
  }, [product.price, product.original_price, product.currency_code]);

  // Inventory and Purchase Status
  // Assuming allowBackorder is false if not present on product model
  const inventoryQuantity = product.stock_quantity ?? 0;
  const allowBackorder = product.allow_backorder ?? false; 
  const canPurchase = inventoryQuantity > 0 || allowBackorder;
  const stockStatusText = canPurchase 
    ? (inventoryQuantity > 0 ? 'В наличии' : 'Под заказ') 
    : 'Нет в наличии';

  // Debug logs (can be removed in production)
  useEffect(() => {
    console.log('[ProductClientComponent] Product data:', product);
    console.log('[ProductClientComponent] Price info:', priceInfo);
    console.log('[ProductClientComponent] Can purchase:', canPurchase, "Stock:", inventoryQuantity, "Allow Backorder:", allowBackorder);
    console.log('[ProductClientComponent] Cart loading state:', isCartGloballyLoading);
  }, [product, priceInfo, canPurchase, inventoryQuantity, allowBackorder, isCartGloballyLoading]);


  const handleAddToCart = async () => {
    if (!product.id) { // Product ID is now directly from the product object
      console.warn('[ProductClientComponent] Attempted to add to cart with no product ID');
      toast.error('Не удалось идентифицировать товар.');
      return;
    }
    console.log('[ProductClientComponent] Adding product to cart:', product.id);
    setIsAddingToCartLocal(true);
    setAddedToCartLocal(false);
    try {
      await addItemToCartContext(product.id, 1); // Use product.id
      console.log('[ProductClientComponent] Successfully added to cart:', product.id);
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

  // Image Gallery
  const galleryImages: string[] = product.image_urls || [];

  const productName = getSafeString(product.name, 'Название товара отсутствует');
  // SKU display (using product.sku if available, otherwise product.id as fallback, or 'N/A')
  const productSKU = getSafeString(product.sku, getSafeString(product.id, 'N/A'));
  const productHandle = getSafeString(product.handle); // Assuming handle is still relevant for links/SEO

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
    breadcrumbItems && breadcrumbItems.length > 0
      ? breadcrumbItems
      : [
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/catalog' }, // Changed to /catalog
          { label: productName, href: `/product/${productHandle}` },
        ];

  return (
    <section className="py-8 lg:py-12 px-4 max-w-7xl mx-auto">
      <ProductSeo
        product={{
          id: product.id,
          name: productName,
          description: typeof product.description === 'string' ? product.description : undefined,
          image_urls: galleryImages, // Pass string array
          handle: product.handle,
          // Assuming other fields for ProductSeo are optional or derived
        }}
      />
      <Breadcrumbs items={safeBreadcrumbItems} className="mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
        <div className="w-full lg:sticky lg:top-24 self-start">
          {/* ProductGallery should be updated to accept string[] for images */}
          <ProductGallery images={galleryImages} title={productName} />
        </div>

        <div className="w-full flex flex-col gap-6">
          <Card className="border shadow-sm bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-2xl lg:text-3xl font-bold">{productName}</CardTitle>
              {product.brand?.name && (
                <div className="mt-1"> {/* Adjusted margin slightly */}
                  <span className="text-sm font-medium text-muted-foreground">Бренд: </span>
                  {product.brand.handle ? (
                    <Link href={`/brand/${product.brand.handle}`} className="text-sm text-primary hover:underline">
                      {product.brand.name}
                    </Link>
                  ) : (
                    <span className="text-sm text-foreground">{product.brand.name}</span>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Артикул: {productSKU}
                </p>
                <div
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    canPurchase
                      ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300'
                  }`}
                >
                  {stockStatusText}
                </div>
              </div>

              {/* Variant selection UI removed */}

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
                    !product.id || // Check product.id directly
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
        product={{ // Pass necessary fields from Supabase product type
          description: typeof product.description === 'string' ? product.description : undefined,
          // Pass other fields like 'features' or 'specifications' if they exist on your Supabase Product type
          // metadata: product.metadata ?? undefined, // If you have a JSON metadata field
        }}
      />
    </section>
  );
}