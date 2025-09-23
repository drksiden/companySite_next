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
  // Try thumbnail first
  if (
    product.thumbnail &&
    !product.thumbnail.includes("example.com") &&
    !product.thumbnail.includes("placeholder")
  ) {
    return product.thumbnail;
  }

  // Try first image from array
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
        ((product.base_price - product.sale_price!) / product.base_price) * 100,
      )
    : 0;

  const isInStock = product.track_inventory
    ? product.inventory_quantity > 0
    : true;

  const formatPrice = (price: number) => {
    return `${price.toLocaleString("kk-KZ")} ₸`;
  };

  return (
    <Card className="group relative bg-white border-0 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden h-full rounded-2xl product-card hover:-translate-y-1">
      <Link href={`/catalog/product/${product.slug}`} className="block h-full">
        <div className="relative h-full flex flex-col">
          {/* Image Section */}
          <div className="relative w-full h-64 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-2xl">
            <Image
              src={imageSrc}
              alt={product.name}
              width={300}
              height={256}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={85}
              priority={false}
              unoptimized={imageSrc === "/images/placeholder-product.svg"}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Badges - Enhanced Design */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {isOnSale && (
                <Badge className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg backdrop-blur-sm border-0 font-bold px-3 py-1 rounded-full">
                  -{discountPercentage}%
                </Badge>
              )}
              {product.is_featured && (
                <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg backdrop-blur-sm border-0 font-bold px-3 py-1 rounded-full">
                  ХИТ
                </Badge>
              )}
              {!isInStock && (
                <Badge className="bg-gray-800/90 text-white shadow-lg backdrop-blur-sm border-0 font-medium px-3 py-1 rounded-full">
                  Нет в наличии
                </Badge>
              )}
            </div>

            {/* Quick View Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
              <div className="text-center text-white p-6 max-w-[90%]">
                {product.short_description && (
                  <p className="text-sm leading-relaxed line-clamp-4 opacity-90">
                    {product.short_description}
                  </p>
                )}
                <div className="mt-3 inline-flex items-center text-xs font-medium bg-white/20 px-3 py-1 rounded-full">
                  Подробнее →
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <CardContent className="p-6 flex-1 flex flex-col justify-between">
            <div className="space-y-3 flex-1">
              {/* Brand */}
              {product.brands?.name && (
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-md inline-block">
                  {product.brands.name}
                </p>
              )}

              {/* Title */}
              <h3 className="font-bold text-lg leading-tight text-gray-900 line-clamp-2 min-h-[3.5rem] group-hover:text-blue-600 transition-colors duration-300">
                {product.name}
              </h3>

              {/* Category */}
              {product.categories?.name && (
                <p className="text-sm text-gray-500 font-medium">
                  {product.categories.name}
                </p>
              )}
            </div>

            {/* Bottom Section */}
            <div className="space-y-4 mt-4">
              {/* Price Section */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {formatPrice(finalPrice)}
                  </span>
                  {isOnSale && (
                    <span className="text-sm text-gray-400 line-through font-medium">
                      {formatPrice(product.base_price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Stock Information */}
              {product.track_inventory && (
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isInStock ? "bg-green-500 animate-pulse" : "bg-red-500"
                    }`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      isInStock ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {isInStock
                      ? `В наличии: ${product.inventory_quantity} шт.`
                      : "Нет в наличии"}
                  </span>
                </div>
              )}

              {/* Action Indicator */}
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
              </div>
            </div>
          </CardContent>
        </div>
      </Link>
    </Card>
  );
}