import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CatalogProduct } from "@/lib/services/catalog";

interface ProductCardProps {
  product: CatalogProduct;
}

// Server-side function to determine image source consistently
const getFinalImageSrc = (product: CatalogProduct): string => {
  if (
    product.thumbnail &&
    !product.thumbnail.includes("example.com") &&
    !product.thumbnail.includes("placeholder")
  ) {
    return product.thumbnail;
  }

  if (product.images && product.images.length > 0) {
    const firstImage = product.images[0];
    if (
      firstImage &&
      !firstImage.includes("example.com") &&
      !firstImage.includes("placeholder")
    ) {
      return firstImage;
    }
  }

  return "/images/placeholder-product.svg";
};

export default function ProductCard({ product }: ProductCardProps) {
  const imageSrc = getFinalImageSrc(product);

  const finalPrice = product.sale_price || product.base_price;
  const isOnSale = !!(
    product.sale_price && product.sale_price < product.base_price
  );
  const discountPercentage = isOnSale
    ? Math.round(
        ((product.base_price - product.sale_price!) / product.base_price) * 100
      )
    : 0;

  const isInStock = product.track_inventory
    ? product.inventory_quantity > 0
    : true;

  const formatPrice = (price: number) => {
    return `${price.toLocaleString("kk-KZ")} ₸`;
  };

  return (
    <Card className="group relative bg-[var(--card-bg)] shadow-sm hover:shadow-xl transition-all overflow-hidden h-full rounded-xl product-card hover:-translate-y-1">
      <Link href={`/catalog/product/${product.slug}`} className="block h-full">
        <div className="relative h-full flex flex-col">
          {/* Image Section */}
          <div className="relative w-full h-72 overflow-hidden bg-[var(--image-bg)] rounded-t-xl">
            <Image
              src={imageSrc}
              alt={product.name}
              width={300}
              height={240}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={85}
              priority={false}
              unoptimized={imageSrc === "/images/placeholder-product.svg"}
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              {isOnSale && (
                <Badge className="bg-[var(--sale-bg)] hover:bg-[var(--sale-hover-bg)] text-[var(--badge-text)] shadow-md backdrop-blur-sm border-0 font-bold px-2.5 py-0.5 rounded-full text-xs">
                  -{discountPercentage}%
                </Badge>
              )}
              {product.is_featured && (
                <Badge className="bg-[var(--featured-bg)] text-[var(--badge-text)] shadow-md backdrop-blur-sm border-0 font-bold px-2.5 py-0.5 rounded-full text-xs">
                  ХИТ
                </Badge>
              )}
              {!isInStock && (
                <Badge className="bg-[var(--out-of-stock-bg)] text-[var(--badge-text)] shadow-md backdrop-blur-sm border-0 font-medium px-2.5 py-0.5 rounded-full text-xs">
                  Нет в наличии
                </Badge>
              )}
            </div>
            
            {/* Quick View Overlay */}
            <div className="absolute inset-0 bg-white/70 dark:bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm z-20">
              <div className="text-center text-[var(--overlay-text)] p-4 max-w-[90%]">
                {product.short_description && (
                  <p className="text-sm leading-relaxed line-clamp-3 opacity-90 mb-2">
                    {product.short_description}
                  </p>
                )}
                <div className="mt-2 inline-flex items-center text-xs font-medium bg-[var(--overlay-button-bg)] px-3 py-1.5 rounded-full hover:bg-[var(--overlay-button-hover-bg)] transition-colors">
                  Подробнее →
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <CardContent className="p-4 flex-1 flex flex-col justify-between">
            <div className="space-y-2 flex-1">
              {/* Brand */}
              {product.brands?.name && (
                <p className="text-xs text-[var(--brand-text)] font-semibold uppercase tracking-wider bg-[var(--brand-bg)] px-1.5 py-0.5 rounded-md inline-block">
                  {product.brands.name}
                </p>
              )}
              {/* Title */}
              <h3 className="font-bold text-base leading-tight text-[var(--title-text)] group-hover:text-[var(--title-hover-text)] transition-colors duration-300">
                {product.name}
              </h3>
              {/* Category */}
              {product.categories?.name && (
                <p className="text-xs text-[var(--category-text)] font-medium">
                  {product.categories.name}
                </p>
              )}
            </div>

            {/* Bottom Section */}
            <div className="space-y-3">
              {/* Price Section */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-[var(--price-text)]">
                    {formatPrice(finalPrice)}
                  </span>
                  {isOnSale && (
                    <span className="text-xs text-[var(--price-old-text)] line-through font-medium">
                      {formatPrice(product.base_price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Stock Information */}
              {product.track_inventory && (
                <div className="flex items-center gap-1.5 bg-[var(--stock-bg)] px-2.5 py-1.5 rounded-md">
                  <div
                    className={`w-2 rounded-full ${
                      isInStock ? "bg-[var(--stock-dot-in)] animate-pulse" : "bg-[var(--stock-dot-out)]"
                    }`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      isInStock ? "text-[var(--stock-text-in)]" : "text-[var(--stock-text-out)]"
                    }`}
                  >
                    {isInStock
                      ? `В наличии: ${product.inventory_quantity} шт.`
                      : "Нет в наличии"}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </div>
      </Link>
    </Card>
  );
}
