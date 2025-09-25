"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronRight, Filter } from "lucide-react";
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

const CategoryTree: React.FC<CategoryTreeProps> = ({ nodes, selectedCategories, onChange, level = 0 }) => {
  return (
    <>
      {nodes.map((node) => (
        <AccordionItem key={node.category.id} value={node.category.id} className="border-none">
          <AccordionTrigger className="py-2 px-0 hover:no-underline group">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 flex-1">
                <div style={{ paddingLeft: `${level * 1.5}rem` }}>
                  <Checkbox
                    id={`category-${node.category.id}`}
                    checked={selectedCategories.includes(node.category.id)}
                    onCheckedChange={(checked) => onChange(node.category.id, !!checked)}
                    className="group-hover:border-primary"
                  />
                </div>
                <label
                  htmlFor={`category-${node.category.id}`}
                  className="text-sm text-foreground hover:text-primary cursor-pointer transition-colors duration-200 flex-1"
                >
                  {node.category.name}
                </label>
              </div>
              {node.category.product_count != null && (
                <Badge variant="secondary" className="text-xs ml-2">
                  {node.category.product_count}
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-0">
            <CategoryTree
              nodes={node.children}
              selectedCategories={selectedCategories}
              onChange={onChange}
              level={level + 1}
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </>
  );
};

export default function FilterSidebar({ searchParams, categories, brands }: FilterSidebarProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams?.query || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams?.category?.split(",").filter(Boolean) || []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams?.brand?.split(",").filter(Boolean) || []
  );

  useEffect(() => {
    setSelectedCategories(searchParams?.category?.split(",").filter(Boolean) || []);
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
    router.push(`/catalog?${newParams.toString()}`);
  }, [searchQuery, params, router]);

  const handleFilterChange = useCallback(
    (type: "category" | "brand", id: string, checked: boolean) => {
      const newParams = new URLSearchParams(params);
      const currentFilters = newParams.get(type)?.split(",").filter(Boolean) || [];
      
      const updatedFilters = checked
        ? [...currentFilters, id]
        : currentFilters.filter((item) => item !== id);

      if (updatedFilters.length) {
        newParams.set(type, updatedFilters.join(","));
      } else {
        newParams.delete(type);
      }
      router.push(`/catalog?${newParams.toString()}`);
    },
    [params, router]
  );

  const clearFilters = useCallback(() => {
    router.push("/catalog");
  }, [router]);

  const hasFilters =
    searchQuery || selectedCategories.length || selectedBrands.length;

  return (
    <div className="bg-card border-r border-border p-6 space-y-6 w-80 h-full">
      {/* Search */}
      <div className="space-y-2">
        <h3 className="text-lg flex items-center gap-2 font-semibold text-foreground">
          <Search className="h-5 w-5" />
          Поиск
        </h3>
        <div className="flex gap-2">
          <Input
            placeholder="Поиск товаров..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full"
          />
          <Button
            onClick={handleSearch}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Search size={16} />
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <h3 className="text-lg flex items-center gap-2 font-semibold text-foreground">
          <Filter className="h-5 w-5" />
          Категории
        </h3>
        <Accordion type="multiple" className="w-full">
          <CategoryTree
            nodes={categoryTree}
            selectedCategories={selectedCategories}
            onChange={(id, checked) => handleFilterChange("category", id, checked)}
          />
        </Accordion>
      </div>

      {/* Brands */}
      <div className="space-y-2">
        <h3 className="text-lg flex items-center gap-2 font-semibold text-foreground">
          <Filter className="h-5 w-5" />
          Бренды
        </h3>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="brands" className="border-none">
            <AccordionTrigger className="py-2 hover:no-underline">
              Выбрать бренды
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {brands.slice(0, 10).map((brand) => (
                  <div
                    key={brand.id}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`brand-${brand.id}`}
                        checked={selectedBrands.includes(brand.id)}
                        onCheckedChange={(checked) =>
                          handleFilterChange("brand", brand.id, !!checked)
                        }
                      />
                      <label
                        htmlFor={`brand-${brand.id}`}
                        className="text-sm text-foreground hover:text-primary cursor-pointer transition-colors duration-200"
                      >
                        {brand.name}
                      </label>
                    </div>
                    {brand.product_count != null && (
                      <Badge variant="secondary" className="text-xs">
                        {brand.product_count}
                      </Badge>
                    )}
                  </div>
                ))}
                {brands.length > 10 && (
                  <Button
                    variant="link"
                    className="text-primary hover:text-primary/80 text-sm p-0"
                    onClick={() => router.push("/brands")}
                  >
                    Показать все бренды
                  </Button>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Clear Filters */}
      {hasFilters && (
        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full"
        >
          Сбросить фильтры
        </Button>
      )}
    </div>
  );
}