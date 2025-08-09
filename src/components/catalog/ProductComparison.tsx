"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  X,
  ShoppingCart,
  Heart,
  Star,
  Check,
  Minus,
  Plus,
  Share2,
  Download,
  ArrowUpDown,
  Package,
  CheckCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { SearchProductsResult } from "@/types/catalog";

interface ProductComparisonProps {
  products: SearchProductsResult[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveProduct: (productId: string) => void;
  onAddToCart?: (product: SearchProductsResult) => void;
  onAddToWishlist?: (product: SearchProductsResult) => void;
}

interface ComparisonRow {
  label: string;
  key: string;
  render: (product: SearchProductsResult) => React.ReactNode;
}

export function ProductComparison({
  products,
  isOpen,
  onClose,
  onRemoveProduct,
  onAddToCart,
  onAddToWishlist,
}: ProductComparisonProps) {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const handleAddToWishlist = (product: SearchProductsResult) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(product.id)) {
      newWishlist.delete(product.id);
      toast.success("Товар удален из избранного");
    } else {
      newWishlist.add(product.id);
      toast.success("Товар добавлен в избранное");
    }
    setWishlist(newWishlist);
    onAddToWishlist?.(product);
  };

  const handleAddToCart = (product: SearchProductsResult) => {
    toast.success(`${product.name} добавлен в корзину`);
    onAddToCart?.(product);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/catalog?compare=${products.map((p) => p.id).join(",")}`;
    navigator.clipboard.writeText(url);
    toast.success("Ссылка на сравнение скопирована");
  };

  const comparisonRows: ComparisonRow[] = [
    {
      label: "Изображение",
      key: "image",
      render: (product) => (
        <div className="relative w-24 h-24 mx-auto">
          <Image
            src={product.thumbnail || "/images/no-image.png"}
            alt={product.name}
            fill
            className="object-cover rounded-lg"
          />
        </div>
      ),
    },
    {
      label: "Название",
      key: "name",
      render: (product) => (
        <Link
          href={`/product/${product.slug}`}
          className="font-medium text-blue-600 hover:text-blue-800 line-clamp-2"
        >
          {product.name}
        </Link>
      ),
    },
    {
      label: "Цена",
      key: "price",
      render: (product) => (
        <div className="text-center">
          {product.is_on_sale ? (
            <>
              <div className="text-lg font-bold text-green-600">
                {product.formatted_price}
              </div>
              <div className="text-sm text-gray-500 line-through">
                {product.base_price?.toLocaleString("ru-RU")} ₸
              </div>
              <Badge variant="destructive" className="text-xs">
                -{product.discount_percentage}%
              </Badge>
            </>
          ) : (
            <div className="text-lg font-bold">{product.formatted_price}</div>
          )}
        </div>
      ),
    },
    {
      label: "Бренд",
      key: "brand",
      render: (product) => (
        <div className="text-sm text-gray-600">{product.brand_name || "—"}</div>
      ),
    },
    {
      label: "Наличие",
      key: "stock",
      render: (product) => (
        <div className="flex items-center justify-center gap-1">
          {(product.inventory_quantity || 0) > 0 ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">В наличии</span>
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-orange-600">Под заказ</span>
            </>
          )}
        </div>
      ),
    },
    {
      label: "Рейтинг",
      key: "rating",
      render: (product) => (
        <div className="flex items-center justify-center gap-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-4 h-4",
                  i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
                )}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-1">4.0</span>
        </div>
      ),
    },
    {
      label: "Описание",
      key: "description",
      render: (product) => (
        <div className="text-sm text-gray-600 line-clamp-3">
          {product.short_description || "—"}
        </div>
      ),
    },
  ];

  if (!isOpen || products.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Сравнение товаров ({products.length})
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                Поделиться
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 pt-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="w-40 text-left p-4 font-semibold bg-gray-50 border-b sticky left-0 z-10">
                      Характеристики
                    </th>
                    {products.map((product) => (
                      <th
                        key={product.id}
                        className="min-w-64 p-4 border-b bg-gray-50"
                      >
                        <div className="space-y-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveProduct(product.id)}
                            className="absolute top-2 right-2 p-1 h-auto text-gray-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </Button>

                          <div className="flex justify-center gap-2 mt-8">
                            <Button
                              size="sm"
                              onClick={() => handleAddToCart(product)}
                              className="gap-1"
                            >
                              <ShoppingCart className="w-4 h-4" />В корзину
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddToWishlist(product)}
                              className={cn(
                                "gap-1",
                                wishlist.has(product.id) &&
                                  "bg-red-50 border-red-200",
                              )}
                            >
                              <Heart
                                className={cn(
                                  "w-4 h-4",
                                  wishlist.has(product.id) &&
                                    "fill-red-500 text-red-500",
                                )}
                              />
                            </Button>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, index) => (
                    <tr
                      key={row.key}
                      className={index % 2 === 0 ? "bg-gray-50/50" : ""}
                    >
                      <td className="p-4 font-medium bg-white border-r sticky left-0 z-10">
                        {row.label}
                      </td>
                      {products.map((product) => (
                        <td
                          key={product.id}
                          className="p-4 text-center border-l"
                        >
                          {row.render(product)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollArea>

        {products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Нет товаров для сравнения
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              Добавьте товары в сравнение, чтобы увидеть их характеристики рядом
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ProductComparison;
