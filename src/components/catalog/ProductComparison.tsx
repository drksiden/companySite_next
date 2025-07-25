"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  Star,
  ShoppingCart,
  Trash2,
  Plus,
  ArrowRight,
  Check,
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Product, SearchProductsResult } from "@/types/catalog";

interface ProductComparisonProps {
  products: SearchProductsResult[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveProduct: (productId: string) => void;
  onAddProduct: () => void;
}

interface ComparisonRow {
  label: string;
  key: string;
  getValue: (product: SearchProductsResult | Product) => string | number | boolean | null;
  format?: (value: any) => string;
  important?: boolean;
}

const comparisonRows: ComparisonRow[] = [
  {
    label: "Цена",
    key: "price",
    getValue: (product) => product.final_price || product.base_price,
    format: (value) => `${value?.toLocaleString("ru-RU")} ₸`,
    important: true,
  },
  {
    label: "Бренд",
    key: "brand",
    getValue: (product) => product.brand?.name || "—",
  },
  {
    label: "Категория",
    key: "category",
    getValue: (product) => product.category?.name || "—",
  },
  {
    label: "В наличии",
    key: "stock",
    getValue: (product) => product.inventory_quantity > 0,
    format: (value) => (value ? "Да" : "Нет"),
  },
  {
    label: "Количество",
    key: "quantity",
    getValue: (product) => product.inventory_quantity,
    format: (value) => `${value} шт.`,
  },
  {
    label: "Рекомендуемый",
    key: "featured",
    getValue: (product) => product.is_featured,
    format: (value) => (value ? "Да" : "Нет"),
  },
  {
    label: "Скидка",
    key: "discount",
    getValue: (product) => product.discount_percentage || 0,
    format: (value) => (value > 0 ? `${value}%` : "—"),
  },
  {
    label: "Артикул",
    key: "sku",
    getValue: (product) => product.sku || "—",
  },
];

export function ProductComparison({
  products,
  isOpen,
  onClose,
  onRemoveProduct,
  onAddProduct,
}: ProductComparisonProps) {
  const [fullProducts, setFullProducts] = useState<(Product | null)[]>([]);
  const [loadingStates, setLoadingStates] = useState<boolean[]>([]);

  // Загружаем полные данные о товарах
  useEffect(() => {
    if (products.length > 0 && isOpen) {
      setLoadingStates(new Array(products.length).fill(true));
      setFullProducts(new Array(products.length).fill(null));

      const loadProducts = async () => {
        const promises = products.map(async (product, index) => {
          try {
            const response = await fetch(`/api/products/${product.slug}`);
            const data = await response.json();
            if (data.success) {
              setFullProducts((prev) => {
                const newProducts = [...prev];
                newProducts[index] = data.data;
                return newProducts;
              });
            }
          } catch (error) {
            console.error(`Failed to load product ${product.slug}:`, error);
          } finally {
            setLoadingStates((prev) => {
              const newStates = [...prev];
              newStates[index] = false;
              return newStates;
            });
          }
        });

        await Promise.all(promises);
      };

      loadProducts();
    }
  }, [products, isOpen]);

  const formatPrice = (price: number, currencyCode?: string) => {
    const currency = currencyCode || "KZT";
    const symbol = currency === "KZT" ? "₸" : currency === "USD" ? "$" : "₽";
    return `${price.toLocaleString("ru-RU")} ${symbol}`;
  };

  const handleAddToCart = async (product: SearchProductsResult) => {
    try {
      // Здесь будет интеграция с корзиной
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success(`Товар "${product.name}" добавлен в корзину`);
    } catch (error) {
      toast.error("Не удалось добавить товар в корзину");
    }
  };

  const getComparisonValue = (row: ComparisonRow, productIndex: number) => {
    const product = fullProducts[productIndex] || products[productIndex];
    if (!product) return "—";

    const value = row.getValue(product);
    if (value === null || value === undefined) return "—";
    return row.format ? row.format(value) : String(value);
  };

  const getBestValue = (row: ComparisonRow) => {
    if (products.length === 0) return null;

    const values = products.map((_, index) => {
      const product = fullProducts[index] || products[index];
      return product ? row.getValue(product) : null;
    });

    switch (row.key) {
      case "price":
        const prices = values.filter((v) => typeof v === "number") as number[];
        return prices.length > 0 ? Math.min(...prices) : null;
      case "quantity":
        const quantities = values.filter((v) => typeof v === "number") as number[];
        return quantities.length > 0 ? Math.max(...quantities) : null;
      case "discount":
        const discounts = values.filter((v) => typeof v === "number") as number[];
        return discounts.length > 0 ? Math.max(...discounts) : null;
      case "featured":
      case "stock":
        return values.some((v) => v === true) ? true : null;
      default:
        return null;
    }
  };

  const isValueBest = (row: ComparisonRow, productIndex: number) => {
    const product = fullProducts[productIndex] || products[productIndex];
    if (!product) return false;

    const value = row.getValue(product);
    const bestValue = getBestValue(row);

    if (bestValue === null || value === null) return false;

    return value === bestValue;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Сравнение товаров</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onAddProduct}
                disabled={products.length >= 4}
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить товар
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="p-6 pt-0">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  Нет товаров для сравнения
                </div>
                <Button onClick={onAddProduct}>
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить товар
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  {/* Заголовок с товарами */}
                  <thead>
                    <tr>
                      <th className="w-48 p-4 text-left border-b"></th>
                      {products.map((product, index) => (
                        <th key={product.id} className="p-4 border-b min-w-64">
                          <div className="space-y-4">
                            {/* Изображение */}
                            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                              {product.thumbnail ? (
                                <Image
                                  src={product.thumbnail}
                                  alt={product.name}
                                  fill
                                  className="object-contain"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                  Нет фото
                                </div>
                              )}

                              {/* Бейджи */}
                              <div className="absolute top-2 left-2 space-y-1">
                                {product.is_featured && (
                                  <Badge className="bg-yellow-500 text-white text-xs">
                                    <Star className="w-3 h-3 mr-1" />
                                    ТОП
                                  </Badge>
                                )}
                                {product.discount_percentage && product.discount_percentage > 0 && (
                                  <Badge className="bg-red-500 text-white text-xs">
                                    -{product.discount_percentage}%
                                  </Badge>
                                )}
                              </div>

                              {/* Кнопка удаления */}
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8"
                                onClick={() => onRemoveProduct(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Название и бренд */}
                            <div className="space-y-2">
                              <Link
                                href={`/product/${product.slug}`}
                                className="font-semibold text-sm hover:underline line-clamp-2"
                              >
                                {product.name}
                              </Link>
                              {product.brand && (
                                <div className="text-xs text-muted-foreground">
                                  {product.brand.name}
                                </div>
                              )}
                            </div>

                            {/* Кнопки действий */}
                            <div className="space-y-2">
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={() => handleAddToCart(product)}
                                disabled={product.inventory_quantity === 0}
                              >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                В корзину
                              </Button>
                              <Button variant="outline" size="sm" className="w-full" asChild>
                                <Link href={`/product/${product.slug}`}>
                                  <ArrowRight className="w-4 h-4 mr-2" />
                                  Подробнее
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* Характеристики */}
                  <tbody>
                    {comparisonRows.map((row) => (
                      <tr key={row.key} className="border-b hover:bg-muted/50">
                        <td className="p-4 font-medium text-sm bg-muted/30">
                          {row.label}
                        </td>
                        {products.map((product, index) => {
                          const value = getComparisonValue(row, index);
                          const isBest = isValueBest(row, index);
                          const isLoading = loadingStates[index];

                          return (
                            <td key={product.id} className="p-4 text-center">
                              {isLoading ? (
                                <div className="flex items-center justify-center">
                                  <div className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin" />
                                </div>
                              ) : (
                                <div
                                  className={cn(
                                    "text-sm flex items-center justify-center gap-1",
                                    row.important && "font-medium",
                                    isBest && "text-green-600 font-semibold",
                                  )}
                                >
                                  {isBest && <Check className="w-4 h-4" />}
                                  {value}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {products.length > 0 && products.length < 4 && (
              <div className="mt-6 p-4 border-2 border-dashed border-muted rounded-lg text-center">
                <div className="text-muted-foreground mb-2">
                  Добавьте еще товары для сравнения (максимум 4)
                </div>
                <Button variant="outline" onClick={onAddProduct}>
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить товар
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
