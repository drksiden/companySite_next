"use client";

import { useQuery } from "@tanstack/react-query";
import ProductGrid from "@/features/catalog/components/ProductGrid";
import { catalogKeys } from "@/lib/hooks/useCatalog";
import type { CatalogProduct } from "@/lib/services/catalog";
import { LayoutGrid, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface CategoryProductsClientProps {
  slugs: string[];
}

export function CategoryProductsClient({ slugs }: CategoryProductsClientProps) {
  const categoryPath = slugs.join("/");

  // Загружаем товары только на клиенте через TanStack Query с кешированием
  const { data, error, isLoading } = useQuery({
    queryKey: catalogKeys.categoryProducts(categoryPath, slugs),
    queryFn: async () => {
      const response = await fetch(`/api/catalog/category/${categoryPath}`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch products");
      }
      return { data: result.data, meta: result.meta };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - данные актуальны 5 минут
    gcTime: 10 * 60 * 1000, // 10 minutes - хранить в кеше 10 минут
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Загружаем при монтировании, но используем кеш если есть
  });

  const products = data?.data || [];

  // Показываем ошибку
  if (error) {
    return (
      <div className="text-center py-12 md:py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
          <LayoutGrid className="w-8 h-8 text-destructive" />
        </div>
        <p className="text-lg text-destructive mb-2">Ошибка загрузки товаров</p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Неизвестная ошибка"}
        </p>
      </div>
    );
  }

  // Показываем товары (из кеша или загруженные)
  // Если isLoading и нет данных - показываем spinner с анимацией
  if (isLoading && products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center py-16 md:py-24"
      >
        <div className="relative mb-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <motion.div
            className="absolute inset-0 h-12 w-12 rounded-full border-4 border-primary/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-medium text-foreground mb-2"
        >
          Загрузка товаров...
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex space-x-2"
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-primary rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 md:py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <LayoutGrid className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-lg text-muted-foreground">
          В этой категории пока нет товаров.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <ProductGrid products={products} />
    </motion.div>
  );
}

