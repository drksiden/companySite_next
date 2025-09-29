"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryItem, BrandItem } from "@/lib/services/catalog";

interface ResponsiveFilterPanelProps {
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
  isMobile?: boolean;
}

const CategoryTree: React.FC<CategoryTreeProps> = ({
  nodes,
  selectedCategories,
  onChange,
  level = 0,
  isMobile = false,
}) => {
  const paddingStyle = { paddingLeft: `${level * (isMobile ? 0.75 : 1.5)}rem` };

  return (
    <React.Fragment>
      {nodes.map((node) => {
        const hasChildren = node.children.length > 0;

        if (hasChildren) {
          return (
            <AccordionItem
              key={node.category.id}
              value={node.category.id}
              className="border-none"
            >
              <AccordionTrigger className="py-2 hover:no-underline text-sm transition-all duration-200">
                <div className="flex items-center justify-between group py-1 w-full transition-all duration-200 hover:bg-accent/30 rounded px-2">
                  <div
                    className="flex items-center gap-2 flex-1"
                    style={paddingStyle}
                  >
                    <span className="text-sm font-medium text-foreground transition-colors duration-200">
                      {node.category.name}
                    </span>
                  </div>
                  {node.category.product_count != null &&
                    node.category.product_count > 0 && (
                      <Badge
                        variant="secondary"
                        className="text-xs ml-2 transition-all duration-200"
                      >
                        {node.category.product_count}
                      </Badge>
                    )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                <div className={isMobile ? "ml-1" : "ml-4"}>
                  <div className="flex items-center gap-2 py-1 transition-all duration-200 hover:bg-accent/30 rounded px-2">
                    <Checkbox
                      id={`category-${node.category.id}`}
                      checked={selectedCategories.includes(node.category.id)}
                      onCheckedChange={(checked) =>
                        onChange(node.category.id, !!checked)
                      }
                      className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all duration-200"
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
                    isMobile={isMobile}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        } else {
          return (
            <div
              key={node.category.id}
              className="flex items-center justify-between group py-1 transition-all duration-200 hover:bg-accent/30 rounded px-2"
            >
              <div
                className="flex items-center gap-2 flex-1"
                style={paddingStyle}
              >
                <Checkbox
                  id={`category-${node.category.id}`}
                  checked={selectedCategories.includes(node.category.id)}
                  onCheckedChange={(checked) =>
                    onChange(node.category.id, !!checked)
                  }
                  className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary group-hover:border-primary transition-all duration-200"
                />
                <label
                  htmlFor={`category-${node.category.id}`}
                  className={cn(
                    "text-sm font-medium text-foreground cursor-pointer transition-colors duration-200",
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
                    className="text-xs transition-all duration-200"
                  >
                    {node.category.product_count}
                  </Badge>
                )}
            </div>
          );
        }
      })}
    </React.Fragment>
  );
};

interface FilterContentProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
  categoryTree: CategoryTreeNode[];
  selectedCategories: string[];
  brands: BrandItem[];
  selectedBrands: string[];
  handleFilterChange: (
    type: "category" | "brand",
    id: string,
    checked: boolean,
  ) => void;
  isMobile: boolean;
}

const FilterContent: React.FC<FilterContentProps> = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  categoryTree,
  selectedCategories,
  brands,
  selectedBrands,
  handleFilterChange,
  isMobile,
}) => {
  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-3">
        <h3 className="text-base flex items-center gap-2 font-semibold text-foreground">
          <Search className="h-4 w-4" />
          Поиск
        </h3>
        <div className="flex gap-2">
          <Input
            placeholder="Поиск товаров..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 border-input focus:border-primary transition-all duration-200"
          />
          <Button
            onClick={handleSearch}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
          >
            <Search size={16} />
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h3 className="text-base flex items-center gap-2 font-semibold text-foreground">
          <Filter className="h-4 w-4" />
          Категории
        </h3>
        <Accordion type="multiple" className="w-full">
          <CategoryTree
            nodes={categoryTree}
            selectedCategories={selectedCategories}
            onChange={(id, checked) =>
              handleFilterChange("category", id, checked)
            }
            isMobile={isMobile}
          />
        </Accordion>
      </div>

      {/* Brands */}
      <div className="space-y-3">
        <h3 className="text-base flex items-center gap-2 font-semibold text-foreground">
          <Filter className="h-4 w-4" />
          Бренды
        </h3>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="brands" className="border-none">
            <AccordionTrigger className="py-2 hover:no-underline text-sm transition-all duration-200">
              Выбрать бренды
            </AccordionTrigger>
            <AccordionContent>
              <div
                className={cn(
                  "space-y-2",
                  isMobile ? "max-h-32" : "max-h-48",
                  "overflow-y-auto custom-scrollbar",
                )}
              >
                {brands.slice(0, 15).map((brand) => (
                  <div
                    key={brand.id}
                    className="flex items-center justify-between group transition-all duration-200 hover:bg-accent/50 rounded px-2 py-1"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`brand-${brand.id}`}
                        checked={selectedBrands.includes(brand.id)}
                        onCheckedChange={(checked) =>
                          handleFilterChange("brand", brand.id, !!checked)
                        }
                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary group-hover:border-primary transition-all duration-200"
                      />
                      <label
                        htmlFor={`brand-${brand.id}`}
                        className={cn(
                          "text-sm font-medium text-foreground cursor-pointer transition-colors duration-200",
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
                        className="text-xs transition-all duration-200"
                      >
                        {brand.product_count}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default function ResponsiveFilterPanel({
  searchParams,
  categories,
  brands,
}: ResponsiveFilterPanelProps) {
  const router = useRouter();
  const params = useSearchParams();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams?.query || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams?.category?.split(",").filter(Boolean) || [],
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams?.brand?.split(",").filter(Boolean) || [],
  );

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
    router.push(`/catalog?${newParams.toString()}`, { scroll: false });
    setIsOpen(false);
  }, [searchQuery, params, router]);

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
      router.push(`/catalog?${newParams.toString()}`, { scroll: false });
    },
    [params, router],
  );

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedBrands([]);
    router.push("/catalog", { scroll: false });
    setIsOpen(false);
  }, [router]);

  const applyFilters = useCallback(() => {
    setIsOpen(false);
  }, []);

  const hasFilters =
    searchQuery || selectedCategories.length || selectedBrands.length;

  const activeFiltersCount =
    selectedCategories.length + selectedBrands.length + (searchQuery ? 1 : 0);

  const triggerButton = (
    <Button
      variant="outline"
      size="sm"
      className="relative transition-all duration-200 hover:scale-105 hover:shadow-md"
    >
      <SlidersHorizontal className="h-4 w-4 mr-2" />
      Фильтры
      {activeFiltersCount > 0 && (
        <Badge className="ml-2 px-1.5 py-0.5 h-5 text-xs animate-pulse">
          {activeFiltersCount}
        </Badge>
      )}
    </Button>
  );

  const headerContent = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Filter className="h-5 w-5" />
        Фильтры и поиск
      </div>
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-xs transition-all duration-200 hover:scale-110 hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="h-4 w-4 mr-1" />
          Сбросить
        </Button>
      )}
    </div>
  );

  const filterContentProps = {
    searchQuery,
    setSearchQuery,
    handleSearch,
    categoryTree,
    selectedCategories,
    brands,
    selectedBrands,
    handleFilterChange,
    isMobile,
  };

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>{headerContent}</DrawerTitle>
              <DrawerDescription>
                Используйте фильтры для поиска нужных товаров
              </DrawerDescription>
            </DrawerHeader>

            <div className="p-4 pb-0 max-h-[50vh] overflow-y-auto">
              <FilterContent {...filterContentProps} />
            </div>

            <DrawerFooter>
              <Button onClick={applyFilters}>
                Применить фильтры
                {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Отмена</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{triggerButton}</SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>{headerContent}</SheetTitle>
            <SheetDescription>
              Используйте фильтры для поиска нужных товаров
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 p-4">
            <FilterContent {...filterContentProps} />
          </ScrollArea>

          <div className="p-4 border-t">
            <Button
              onClick={applyFilters}
              className="w-full transition-all duration-200 hover:scale-105"
            >
              Применить фильтры
              {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
