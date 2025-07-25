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
  const [comparisonProducts, setComparisonProducts] = useState<SearchProductsResult[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false
