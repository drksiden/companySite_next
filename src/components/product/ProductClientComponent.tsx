"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, ShoppingCart, Check, Heart } from "lucide-react";
import { ProductImageGallery } from "@/components/catalog/ProductImageGallery";
import ProductSeo from "@/components/product/ProductSeo";
import ProductTabs from "@/components/product/ProductTabs";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Product } from "@/types/supabase";

interface ProductClientComponentProps {
  product: Product;
  breadcrumbItems: Array<{ label: string; href: string }>;
}

const formatPrice = (
  amount?: number | null,
  currencyCode: string = "KZT",
): string => {
  if (typeof amount !== "number" || amount === null) {
    return "Цена по запросу";
  }

  const currency = currencyCode.toUpperCase();
  if (currency === "KZT") {
    return `${amount.toLocaleString("kk-KZ")} ₸`;
  }

  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

const getSafeString = (value: any, fallback: string = ""): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
};

export default function ProductClientComponent({
  product,
  breadcrumbItems,
}: ProductClientComponentProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  // Информация о цене и скидке
  const priceInfo = useMemo(() => {
    const display = formatPrice(product.price, product.currency_code || "KZT");
    const original = product.original_price
      ? formatPrice(product.original_price, product.currency_code || "KZT")
      : null;
    const isSale =
      product.original_price != null &&
      product.price != null &&
      product.original_price > product.price;
    const discountPercent = isSale
      ? Math.round(
          ((product.original_price! - product.price!) /
            product.original_price!) *
            100,
        )
      : 0;
    return { display, original, isSale, discountPercent };
  }, [product.price, product.original_price, product.currency_code]);

  // Статус наличия
  const inventoryQuantity = product.stock_quantity ?? 0;
  const allowBackorder = product.allow_backorder ?? false;
  const canPurchase = inventoryQuantity > 0 || allowBackorder;
  const stockStatusText = canPurchase
    ? inventoryQuantity > 0
      ? "В наличии"
      : "Под заказ"
    : "Нет в наличии";

  const handleAddToCart = async () => {
    if (!product.id) {
      toast.error("Не удалось идентифицировать товар.");
      return;
    }

    setIsAddingToCart(true);
    setAddedToCart(false);

    try {
      // Здесь будет интеграция с вашей корзиной
      // Пока просто имитируем добавление
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setAddedToCart(true);
      toast.success(`Товар "${product.name}" добавлен в корзину!`);
      setTimeout(() => setAddedToCart(false), 3000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Неизвестная ошибка";
      toast.error("Не удалось добавить товар", { description: errorMessage });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const toggleWishlist = async () => {
    try {
      setIsInWishlist(!isInWishlist);
      toast.success(
        isInWishlist ? "Удалено из избранного" : "Добавлено в избранное",
      );
    } catch (error) {
      toast.error("Ошибка при работе с избранным");
      setIsInWishlist(!isInWishlist); // Откатываем изменение
    }
  };

  // Изображения для галереи
  const galleryImages: string[] = product.image_urls || [];

  const productName = getSafeString(
    product.name,
    "Название товара отсутствует",
  );
  const productSKU = getSafeString(
    product.sku,
    getSafeString(product.id, "N/A"),
  );
  const productHandle = getSafeString(product.handle);

  let buttonIcon = <ShoppingCart className="w-5 h-5 mr-2" />;
  let buttonText = "Добавить в корзину";

  if (isAddingToCart) {
    buttonIcon = <Loader2 className="w-5 h-5 mr-2 animate-spin" />;
    buttonText = "Добавление...";
  } else if (addedToCart) {
    buttonIcon = <Check className="w-5 h-5 mr-2" />;
    buttonText = "Добавлено!";
  }

  const safeBreadcrumbItems =
    breadcrumbItems && breadcrumbItems.length > 0
      ? breadcrumbItems
      : [
          { label: "Главная", href: "/" },
          { label: "Каталог", href: "/catalog" },
          { label: productName, href: `/product/${productHandle}` },
        ];

  return (
    <section className="py-8 lg:py-12 px-4 max-w-7xl mx-auto">
      <ProductSeo
        product={{
          id: product.id,
          name: productName,
          description:
            typeof product.description === "string"
              ? product.description
              : undefined,
          image_urls: galleryImages,
          handle: product.handle,
        }}
      />

      <Breadcrumbs items={safeBreadcrumbItems} className="mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
        {/* Галерея изображений */}
        <div className="w-full lg:sticky lg:top-24 self-start">
          <ProductImageGallery
            images={galleryImages}
            productName={productName}
          />
        </div>

        {/* Информация о товаре */}
        <div className="w-full flex flex-col gap-6">
          <Card className="border shadow-sm bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-2xl lg:text-3xl font-bold">
                {productName}
              </CardTitle>
              {product.brands?.[0]?.name && (
                <div className="mt-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    Бренд:{" "}
                  </span>
                  {product.brands[0].handle ? (
                    <Link
                      href={`/brand/${product.brands[0].handle}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {product.brands[0].name}
                    </Link>
                  ) : (
                    <span className="text-sm text-foreground">
                      {product.brands[0].name}
                    </span>
                  )}
                </div>
              )}
            </CardHeader>

            <CardContent className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Артикул: {productSKU}
                </p>
                {/* <div className="flex items-center gap-2">
                  {priceInfo.isSale && (
                    <Badge variant="destructive" className="text-xs">
                      -{priceInfo.discountPercent}%
                    </Badge>
                  )}
                  <div
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      canPurchase
                        ? "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300"
                    }`}
                  >
                    {stockStatusText}
                  </div>
                </div> */}
              </div>

              {/* Цена */}
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

              {/* Количество */}
              {canPurchase && (
                <div className="flex items-center gap-3">
                  <label htmlFor="quantity" className="text-sm font-medium">
                    Количество:
                  </label>
                  <div className="flex items-center border rounded-md">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-muted transition-colors"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      id="quantity"
                      type="number"
                      min="1"
                      max={inventoryQuantity > 0 ? inventoryQuantity : 999}
                      value={quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value) && value >= 1) {
                          setQuantity(value);
                        }
                      }}
                      className="w-16 px-3 py-2 text-center border-x focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const maxQuantity =
                          inventoryQuantity > 0 ? inventoryQuantity : 999;
                        setQuantity(Math.min(maxQuantity, quantity + 1));
                      }}
                      className="px-3 py-2 hover:bg-muted transition-colors"
                      disabled={
                        inventoryQuantity > 0 && quantity >= inventoryQuantity
                      }
                    >
                      +
                    </button>
                  </div>
                  {inventoryQuantity > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Доступно: {inventoryQuantity} шт.
                    </p>
                  )}
                </div>
              )}

              {/* Кнопки действий */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 py-6 text-lg font-medium flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={
                      isAddingToCart ||
                      addedToCart ||
                      !product.id ||
                      !canPurchase
                    }
                    aria-label={buttonText}
                  >
                    {buttonIcon}
                    {buttonText}
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleWishlist}
                    className={`py-6 px-4 ${isInWishlist ? "text-red-500 border-red-500" : ""}`}
                    aria-label={
                      isInWishlist
                        ? "Удалить из избранного"
                        : "Добавить в избранное"
                    }
                  >
                    <Heart
                      className={`w-5 h-5 ${isInWishlist ? "fill-current" : ""}`}
                    />
                  </Button>
                </div>

                <Button
                  variant="outline"
                  className="w-full py-5"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Продолжить покупки
                </Button>
              </div>

              {/* Дополнительная информация */}
              {product.description && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="text-sm font-medium mb-2">
                    Краткое описание:
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {product.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Вкладки с подробной информацией */}
      <ProductTabs
        product={{
          description:
            typeof product.description === "string"
              ? product.description
              : undefined,
          metadata: product.metadata ?? undefined,
        }}
      />
    </section>
  );
}
