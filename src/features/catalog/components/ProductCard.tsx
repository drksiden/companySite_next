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
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden h-full product-card">
      <Link href={`/catalog/product/${product.slug}`}>
        <div className="relative">
          {/* Image */}
          <div className="relative w-full h-64 overflow-hidden bg-gray-100 product-card-image">
            <Image
              src={imageSrc}
              alt={product.name}
              width={300}
              height={256}
              className={`w-full h-full transition-all duration-300 group-hover:scale-105 ${
                imageSrc === "/images/placeholder-product.svg"
                  ? "object-contain p-4"
                  : "object-cover"
              }`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={75}
              priority={false}
              unoptimized={imageSrc === "/images/placeholder-product.svg"}
            />

            {/* Overlay with description on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/70 transition-all duration-300 flex items-end opacity-0 group-hover:opacity-100">
              <div className="p-4 text-white w-full">
                {product.short_description && (
                  <p className="text-sm leading-relaxed line-clamp-4">
                    {product.short_description}
                  </p>
                )}
                {!product.short_description && product.name && (
                  <p className="text-sm leading-relaxed">{product.name}</p>
                )}
              </div>
            </div>

            {/* Badges - top left */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {isOnSale && (
                <Badge className="bg-red-500 hover:bg-red-600 text-white shadow-lg">
                  -{discountPercentage}%
                </Badge>
              )}
              {product.is_featured && (
                <Badge variant="secondary" className="shadow-lg">
                  ХИТ
                </Badge>
              )}
              {!isInStock && (
                <Badge variant="destructive" className="shadow-lg">
                  Нет в наличии
                </Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Brand */}
              {product.brands?.name && (
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {product.brands.name}
                </p>
              )}

              {/* Title */}
              <h3 className="font-semibold text-base leading-tight line-clamp-2 min-h-[2.5rem]">
                {product.name}
              </h3>

              {/* Category */}
              {product.categories?.name && (
                <p className="text-sm text-muted-foreground">
                  {product.categories.name}
                </p>
              )}

              {/* Price */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(finalPrice)}
                  </span>
                  {isOnSale && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.base_price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Stock info */}
              {product.track_inventory && (
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${isInStock ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <span
                    className={`text-xs ${isInStock ? "text-green-600" : "text-red-600"}`}
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
