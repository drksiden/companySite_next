"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryItem, BrandItem } from "@/lib/services/catalog";

interface FilterSidebarProps {
  searchParams?: {
    query?: string;
    category?: string;
    brand?: string;
  };
  categories: CategoryItem[];
  brands: BrandItem[];
}

interface CategoryTreeNode {
  category: CategoryItem;
  children: CategoryTreeNode[];
}

function buildCategoryTree(categories: CategoryItem[]): CategoryTreeNode[] {
  const categoryMap = new Map<string, CategoryTreeNode>();
  const rootCategories: CategoryTreeNode[] = [];

  // Create nodes for all categories
  categories.forEach((cat) => {
    categoryMap.set(cat.id, { category: cat, children: [] });
  });

  // Build tree structure
  categories.forEach((cat) => {
    const node = categoryMap.get(cat.id)!;
    if (cat.parent_id) {
      const parentNode = categoryMap.get(cat.parent_id);
      if (parentNode) {
        parentNode.children.push(node);
      } else {
        // If parent not found, treat as root
        rootCategories.push(node);
      }
    } else {
      rootCategories.push(node);
    }
  });

  return rootCategories;
}

interface CategoryTreeProps {
  nodes: CategoryTreeNode[];
  selectedCategories: string[];
  onChange: (id: string, checked: boolean) => void;
  level?: number;
}

const CategoryTree: React.FC<CategoryTreeProps> = ({
  nodes,
  selectedCategories,
  onChange,
  level = 0,
}) => {
  return (
    <>
      {nodes.map((node) => {
        const hasChildren = node.children.length > 0;

        if (hasChildren) {
          return (
            <AccordionItem
              key={node.category.id}
              value={node.category.id}
              className="border-none"
            >
              <AccordionTrigger className="py-0 hover:no-underline transition-all duration-200">
                <div className="flex items-center justify-between group py-2 w-full transition-all duration-200 hover:bg-background rounded-lg px-2 cursor-pointer">
                  <div
                    className="flex items-center gap-2 flex-1"
                    style={{ paddingLeft: `${level * 1.5}rem` }}
                  >
                    <span
                      className={cn(
                        "text-sm font-medium text-foreground transition-colors duration-200",
                        selectedCategories.includes(node.category.id) && "text-primary font-semibold"
                      )}
                    >
                      {node.category.name}
                    </span>
                  </div>
                  {node.category.product_count != null &&
                    node.category.product_count > 0 && (
                      <Badge
                        variant="secondary"
                        className="text-xs font-semibold bg-primary/10 text-primary border-0 shrink-0"
                      >
                        {node.category.product_count}
                      </Badge>
                    )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                  <div className="ml-4">
                    <div className="flex items-center gap-2 py-2 transition-all duration-200 hover:bg-background rounded-lg px-2 cursor-pointer">
                      <Checkbox
                        id={`category-${node.category.id}`}
                        checked={selectedCategories.includes(node.category.id)}
                        onCheckedChange={(checked) =>
                          onChange(node.category.id, !!checked)
                        }
                        className="border-2 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all duration-200"
                      />
                      <label
                        htmlFor={`category-${node.category.id}`}
                        className={cn(
                          "text-sm font-medium text-foreground cursor-pointer transition-colors duration-200",
                          selectedCategories.includes(node.category.id) &&
                            "text-primary font-semibold",
                        )}
                      >
                        Все в категории
                      </label>
                    </div>
                    <CategoryTree
                      nodes={node.children}
                      selectedCategories={selectedCategories}
                      onChange={onChange}
                      level={level + 1}
                    />
                  </div>
              </AccordionContent>
            </AccordionItem>
          );
        } else {
          return (
            <div
              key={node.category.id}
              className="flex items-center justify-between group py-2 transition-all duration-200 hover:bg-background rounded-lg px-2 cursor-pointer"
            >
              <div
                className="flex items-center gap-2 flex-1 min-w-0"
                style={{ paddingLeft: `${level * 1.5}rem` }}
              >
                <Checkbox
                  id={`category-${node.category.id}`}
                  checked={selectedCategories.includes(node.category.id)}
                  onCheckedChange={(checked) =>
                    onChange(node.category.id, !!checked)
                  }
                  className="border-2 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary group-hover:border-primary transition-all duration-200 shrink-0"
                />
                <label
                  htmlFor={`category-${node.category.id}`}
                  className={cn(
                    "text-sm font-medium text-foreground cursor-pointer transition-colors duration-200 truncate",
                    selectedCategories.includes(node.category.id) &&
                      "text-primary font-semibold",
                  )}
                >
                  {node.category.name}
                </label>
              </div>
              {node.category.product_count != null &&
                node.category.product_count > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-xs font-semibold bg-primary/10 text-primary border-0 shrink-0 ml-2"
                  >
                    {node.category.product_count}
                  </Badge>
                )}
            </div>
          );
        }
      })}
    </>
  );
};

export default function FilterSidebar({
  searchParams,
  categories,
  brands,
}: FilterSidebarProps) {
  const router = useRouter();
  const params = useSearchParams();
  
  // Инициализируем состояние без localStorage (безопасно для SSR)
  const [searchQuery, setSearchQuery] = useState(
    searchParams?.query || ""
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams?.category?.split(",").filter(Boolean) || [],
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams?.brand?.split(",").filter(Boolean) || [],
  );

  // Загружаем сохраненные фильтры из localStorage только на клиенте
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem('catalog-filters');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Применяем сохраненные фильтры только если нет параметров в URL
        if (!searchParams?.query && parsed.query) {
          setSearchQuery(parsed.query);
        }
        if (!searchParams?.category && parsed.categories?.length > 0) {
          setSelectedCategories(parsed.categories);
        }
        if (!searchParams?.brand && parsed.brands?.length > 0) {
          setSelectedBrands(parsed.brands);
        }
      }
    } catch (e) {
      console.error('Error loading saved filters:', e);
    }
  }, []); // Загружаем только один раз при монтировании

  // Сохраняем фильтры в localStorage
  const saveFilters = useCallback((query: string, categories: string[], brands: string[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('catalog-filters', JSON.stringify({ query, categories, brands }));
    }
  }, []);

  useEffect(() => {
    setSelectedCategories(
      searchParams?.category?.split(",").filter(Boolean) || [],
    );
    setSelectedBrands(searchParams?.brand?.split(",").filter(Boolean) || []);
    setSearchQuery(searchParams?.query || "");
  }, [searchParams]);

  const categoryTree = buildCategoryTree(categories);

  const handleSearch = useCallback(() => {
    const newParams = new URLSearchParams(params);
    if (searchQuery) {
      newParams.set("query", searchQuery);
    } else {
      newParams.delete("query");
    }
    saveFilters(searchQuery, selectedCategories, selectedBrands);
    router.push(`/catalog?${newParams.toString()}`, { scroll: false });
  }, [searchQuery, selectedCategories, selectedBrands, params, router, saveFilters]);

  const handleFilterChange = useCallback(
    (type: "category" | "brand", id: string, checked: boolean) => {
      const newParams = new URLSearchParams(params);
      const currentFilters =
        newParams.get(type)?.split(",").filter(Boolean) || [];

      const updatedFilters = checked
        ? [...currentFilters, id]
        : currentFilters.filter((item) => item !== id);

      if (type === "category") {
        setSelectedCategories(updatedFilters);
      } else {
        setSelectedBrands(updatedFilters);
      }

      if (updatedFilters.length) {
        newParams.set(type, updatedFilters.join(","));
      } else {
        newParams.delete(type);
      }
      
      const finalCategories = type === "category" ? updatedFilters : selectedCategories;
      const finalBrands = type === "brand" ? updatedFilters : selectedBrands;
      saveFilters(searchQuery, finalCategories, finalBrands);
      
      router.push(`/catalog?${newParams.toString()}`, { scroll: false });
    },
    [params, router, searchQuery, selectedCategories, selectedBrands, saveFilters],
  );

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedBrands([]);
    saveFilters("", [], []);
    router.push("/catalog", { scroll: false });
  }, [router, saveFilters]);

  const hasFilters =
    !!searchQuery || selectedCategories.length > 0 || selectedBrands.length > 0;

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6 w-80 h-full custom-scrollbar shadow-sm sticky top-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          Фильтры
        </h2>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground h-auto p-1"
          >
            Очистить
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" />
          Поиск
        </h3>
        <div className="flex gap-2">
          <Input
            placeholder="Название товара..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full border-2 border-border focus:border-primary transition-all duration-200 rounded-lg"
          />
          <Button
            onClick={handleSearch}
            size="icon"
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-105 shrink-0 rounded-lg"
          >
            <Search size={18} />
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          Категории
        </h3>
        <div className="bg-muted/30 rounded-lg p-2 border border-border/50">
          <Accordion type="multiple" className="w-full">
            <CategoryTree
              nodes={categoryTree}
              selectedCategories={selectedCategories}
              onChange={(id, checked) =>
                handleFilterChange("category", id, checked)
              }
            />
          </Accordion>
        </div>
      </div>

      {/* Brands */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          Бренды
        </h3>
        <div className="bg-muted/30 rounded-lg p-2 border border-border/50">
          <Accordion type="single" collapsible className="w-full" defaultValue="brands">
            <AccordionItem value="brands" className="border-none">
              <AccordionTrigger className="py-2 hover:no-underline transition-all duration-200 font-medium text-sm">
                Выбрать бренды
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                  {brands.slice(0, 15).map((brand) => (
                    <div
                      key={brand.id}
                      className="flex items-center justify-between group transition-all duration-200 hover:bg-background rounded-lg px-2 py-1.5 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Checkbox
                          id={`brand-${brand.id}`}
                          checked={selectedBrands.includes(brand.id)}
                          onCheckedChange={(checked) =>
                            handleFilterChange("brand", brand.id, !!checked)
                          }
                          className="border-2 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary group-hover:border-primary transition-all duration-200 shrink-0"
                        />
                        <label
                          htmlFor={`brand-${brand.id}`}
                          className={cn(
                            "text-sm font-medium text-foreground cursor-pointer transition-colors duration-200 truncate",
                            selectedBrands.includes(brand.id) &&
                              "text-primary font-semibold",
                          )}
                        >
                          {brand.name}
                        </label>
                      </div>
                      {brand.product_count != null && brand.product_count > 0 && (
                        <Badge
                          variant="secondary"
                          className="text-xs font-semibold shrink-0 ml-2 bg-primary/10 text-primary border-0"
                        >
                          {brand.product_count}
                        </Badge>
                      )}
                    </div>
                  ))}
                  {brands.length > 15 && (
                    <Button
                      variant="link"
                      className="text-primary hover:text-primary/80 text-sm p-0 mt-2 w-full justify-center transition-all duration-200"
                      onClick={() => router.push("/brands")}
                    >
                      Показать все ({brands.length})
                    </Button>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasFilters && (
        <div className="pt-4 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {selectedCategories.length > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {selectedCategories.length} категорий
              </Badge>
            )}
            {selectedBrands.length > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {selectedBrands.length} брендов
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                Поиск: "{searchQuery}"
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
