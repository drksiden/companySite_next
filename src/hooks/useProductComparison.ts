"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { SearchProductsResult } from "@/types/catalog";

const COMPARISON_STORAGE_KEY = "product-comparison";
const MAX_COMPARISON_ITEMS = 4;

export interface UseProductComparisonReturn {
  comparisonProducts: SearchProductsResult[];
  isInComparison: (productId: string) => boolean;
  addToComparison: (product: SearchProductsResult) => void;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
  comparisonCount: number;
  isComparisonOpen: boolean;
  openComparison: () => void;
  closeComparison: () => void;
  toggleComparison: () => void;
}

export function useProductComparison(): UseProductComparisonReturn {
  const [comparisonProducts, setComparisonProducts] = useState<
    SearchProductsResult[]
  >([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  // Load comparison products from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(COMPARISON_STORAGE_KEY);
    if (saved) {
      try {
        const products = JSON.parse(saved);
        setComparisonProducts(products);
      } catch (error) {
        console.error(
          "Failed to parse comparison products from localStorage:",
          error,
        );
      }
    }
  }, []);

  // Save to localStorage whenever comparison products change
  useEffect(() => {
    localStorage.setItem(
      COMPARISON_STORAGE_KEY,
      JSON.stringify(comparisonProducts),
    );
  }, [comparisonProducts]);

  const isInComparison = useCallback(
    (productId: string) => {
      return comparisonProducts.some((product) => product.id === productId);
    },
    [comparisonProducts],
  );

  const addToComparison = useCallback(
    (product: SearchProductsResult) => {
      if (comparisonProducts.length >= MAX_COMPARISON_ITEMS) {
        toast.error(`Можно сравнить максимум ${MAX_COMPARISON_ITEMS} товара`);
        return;
      }

      if (isInComparison(product.id)) {
        toast.info("Товар уже добавлен в сравнение");
        return;
      }

      setComparisonProducts((prev) => [...prev, product]);
      toast.success("Товар добавлен в сравнение");
    },
    [comparisonProducts.length, isInComparison],
  );

  const removeFromComparison = useCallback((productId: string) => {
    setComparisonProducts((prev) =>
      prev.filter((product) => product.id !== productId),
    );
    toast.success("Товар удален из сравнения");
  }, []);

  const clearComparison = useCallback(() => {
    setComparisonProducts([]);
    toast.success("Сравнение очищено");
  }, []);

  const openComparison = useCallback(() => {
    setIsComparisonOpen(true);
  }, []);

  const closeComparison = useCallback(() => {
    setIsComparisonOpen(false);
  }, []);

  const toggleComparison = useCallback(() => {
    setIsComparisonOpen((prev) => !prev);
  }, []);

  return {
    comparisonProducts,
    isInComparison,
    addToComparison,
    removeFromComparison,
    clearComparison,
    comparisonCount: comparisonProducts.length,
    isComparisonOpen,
    openComparison,
    closeComparison,
    toggleComparison,
  };
}
