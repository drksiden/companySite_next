"use client";

import { useSearchParams } from "next/navigation";
import CatalogProducts from "@/features/catalog/components/CatalogProducts";
import type { CatalogProduct } from "@/lib/services/catalog";

interface CategoryProductsClientProps {
  slugs: string[];
  subcategories?: Array<{ id: string; name: string }>; // Подкатегории для группировки
  initialProducts?: CatalogProduct[];
  categoryId?: string; // ID текущей категории для фильтрации
}

export function CategoryProductsClient({ 
  slugs, 
  subcategories = [],
  initialProducts = [],
  categoryId,
}: CategoryProductsClientProps) {
  const searchParams = useSearchParams();
  
  // Формируем searchParams для CatalogProducts
  // Используем categoryId из пропсов или из URL параметров
  const catalogSearchParams = {
    category: categoryId || searchParams.get("category") || undefined,
    query: searchParams.get("query") || undefined,
    brand: searchParams.get("brand") || undefined,
  };

  return (
    <CatalogProducts
      initialProducts={initialProducts}
      searchParams={catalogSearchParams}
      subcategories={subcategories}
    />
  );
}
