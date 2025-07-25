"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, X, Filter } from "lucide-react";
import type {
  Category,
  Brand,
  Collection,
  ProductFilters as FilterType,
  CategoryFilter,
} from "@/types/catalog";
import { cn } from "@/lib/utils";

interface ProductFiltersProps {
  categories: Category[];
  brands: Brand[];
  collections: Collection[];
  categoryFilters: CategoryFilter[];
  activeFilters: FilterType;
  onFilterChange: (filters: FilterType) => void;
  className?: string;
}

export function ProductFilters({
  categories,
  brands,
  collections,
  activeFilters,
  onFilterChange,
  className,
}: ProductFiltersProps) {
  // Локальное состояние фильтров для кнопки "Применить"
  const [localFilters, setLocalFilters] = useState<FilterType>(activeFilters);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    activeFilters.priceRange?.min || 0,
    activeFilters.priceRange?.max || 1000000,
  ]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: true,
    brands: true,
    price: true,
    options: true,
  });

  // Синхронизируем локальные фильтры с активными при их изменении
  useEffect(() => {
    setLocalFilters(activeFilters);
    setPriceRange([
      activeFilters.priceRange?.min || 0,
      activeFilters.priceRange?.max || 1000000,
    ]);
  }, [activeFilters]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...(localFilters.categories || []), categoryId]
      : (localFilters.categories || []).filter((id) => id !== categoryId);

    setLocalFilters({
      ...localFilters,
      categories: newCategories,
    });
  };

  const handleBrandChange = (brandId: string, checked: boolean) => {
    const newBrands = checked
      ? [...(localFilters.brands || []), brandId]
      : (localFilters.brands || []).filter((id) => id !== brandId);

    setLocalFilters({
      ...localFilters,
      brands: newBrands,
    });
  };

  const handleCollectionChange = (collectionId: string, checked: boolean) => {
    const newCollections = checked
      ? [...(localFilters.collections || []), collectionId]
      : (localFilters.collections || []).filter((id) => id !== collectionId);

    setLocalFilters({
      ...localFilters,
      collections: newCollections,
    });
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };

  const handleToggleOption = (option: keyof FilterType) => {
    setLocalFilters({
      ...localFilters,
      [option]: !localFilters[option],
    });
  };

  const applyFilters = () => {
    const filtersToApply = {
      ...localFilters,
      priceRange: {
        min: priceRange[0],
        max: priceRange[1],
      },
    };
    onFilterChange(filtersToApply);
  };

  const clearAllFilters = () => {
    const emptyFilters: FilterType = {
      categories: [],
      brands: [],
      collections: [],
      inStockOnly: false,
      featured: false,
      priceRange: { min: 0, max: 0 },
    };
    setLocalFilters(emptyFilters);
    setPriceRange([0, 1000000]);
    onFilterChange(emptyFilters);
  };

  const clearFilter = (filterType: string, value?: string) => {
    switch (filterType) {
      case "categories":
        const newCategories = value
          ? (localFilters.categories || []).filter((id) => id !== value)
          : [];
        setLocalFilters({ ...localFilters, categories: newCategories });
        break;
      case "brands":
        const newBrands = value
          ? (localFilters.brands || []).filter((id) => id !== value)
          : [];
        setLocalFilters({ ...localFilters, brands: newBrands });
        break;
      case "collections":
        const newCollections = value
          ? (localFilters.collections || []).filter((id) => id !== value)
          : [];
        setLocalFilters({ ...localFilters, collections: newCollections });
        break;
      case "priceRange":
        setPriceRange([0, 1000000]);
        break;
      case "inStockOnly":
        setLocalFilters({ ...localFilters, inStockOnly: false });
        break;
      case "featured":
        setLocalFilters({ ...localFilters, featured: false });
        break;
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (activeFilters.categories?.length)
      count += activeFilters.categories.length;
    if (activeFilters.brands?.length) count += activeFilters.brands.length;
    if (activeFilters.collections?.length)
      count += activeFilters.collections.length;
    if (activeFilters.priceRange?.min || activeFilters.priceRange?.max)
      count += 1;
    if (activeFilters.inStockOnly) count += 1;
    if (activeFilters.featured) count += 1;
    return count;
  };

  const hasChanges = () => {
    const currentPriceRange = {
      min: priceRange[0] > 0 ? priceRange[0] : 0,
      max: priceRange[1] < 1000000 ? priceRange[1] : 0,
    };

    return (
      JSON.stringify(localFilters.categories?.sort()) !==
        JSON.stringify(activeFilters.categories?.sort()) ||
      JSON.stringify(localFilters.brands?.sort()) !==
        JSON.stringify(activeFilters.brands?.sort()) ||
      JSON.stringify(localFilters.collections?.sort()) !==
        JSON.stringify(activeFilters.collections?.sort()) ||
      localFilters.inStockOnly !== activeFilters.inStockOnly ||
      localFilters.featured !== activeFilters.featured ||
      currentPriceRange.min !== (activeFilters.priceRange?.min || 0) ||
      currentPriceRange.max !== (activeFilters.priceRange?.max || 0)
    );
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Фильтры
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Активные фильтры:</h4>
            <div className="flex flex-wrap gap-1">
              {activeFilters.categories?.map((categoryId) => {
                const category = categories.find((c) => c.id === categoryId);
                return category ? (
                  <Badge
                    key={categoryId}
                    variant="outline"
                    className="text-xs pr-1"
                  >
                    {category.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1 hover:bg-transparent"
                      onClick={() => clearFilter("categories", categoryId)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ) : null;
              })}

              {activeFilters.brands?.map((brandId) => {
                const brand = brands.find((b) => b.id === brandId);
                return brand ? (
                  <Badge
                    key={brandId}
                    variant="outline"
                    className="text-xs pr-1"
                  >
                    {brand.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1 hover:bg-transparent"
                      onClick={() => clearFilter("brands", brandId)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ) : null;
              })}

              {activeFilters.inStockOnly && (
                <Badge variant="outline" className="text-xs pr-1">
                  В наличии
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                    onClick={() => clearFilter("inStockOnly")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {activeFilters.featured && (
                <Badge variant="outline" className="text-xs pr-1">
                  Рекомендуемые
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                    onClick={() => clearFilter("featured")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
            <Separator />
          </div>
        )}

        {/* Categories Filter */}
        {categories.length > 0 && (
          <Collapsible
            open={openSections.categories}
            onOpenChange={() => toggleSection("categories")}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-muted/50 p-2 rounded">
              <h3 className="text-sm font-medium">Категории</h3>
              {openSections.categories ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {categories.slice(0, 10).map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={
                      localFilters.categories?.includes(category.id) || false
                    }
                    onCheckedChange={(checked) =>
                      handleCategoryChange(category.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`category-${category.id}`}
                    className="text-sm cursor-pointer flex-1 hover:text-foreground/80"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Brands Filter */}
        {brands.length > 0 && (
          <Collapsible
            open={openSections.brands}
            onOpenChange={() => toggleSection("brands")}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-muted/50 p-2 rounded">
              <h3 className="text-sm font-medium">Бренды</h3>
              {openSections.brands ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {brands.slice(0, 10).map((brand) => (
                <div key={brand.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand.id}`}
                    checked={localFilters.brands?.includes(brand.id) || false}
                    onCheckedChange={(checked) =>
                      handleBrandChange(brand.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`brand-${brand.id}`}
                    className="text-sm cursor-pointer flex-1 hover:text-foreground/80"
                  >
                    {brand.name}
                  </Label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Price Range Filter */}
        <Collapsible
          open={openSections.price}
          onOpenChange={() => toggleSection("price")}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-muted/50 p-2 rounded">
            <h3 className="text-sm font-medium">Цена</h3>
            {openSections.price ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-2">
            <div className="px-2">
              <Slider
                value={priceRange}
                onValueChange={handlePriceChange}
                max={1000000}
                min={0}
                step={1000}
                className="w-full"
              />
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="number"
                  placeholder="От"
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([Number(e.target.value), priceRange[1]])
                  }
                  className="w-20 h-8 text-xs"
                />
                <span className="text-xs text-muted-foreground">—</span>
                <Input
                  type="number"
                  placeholder="До"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], Number(e.target.value)])
                  }
                  className="w-20 h-8 text-xs"
                />
                <span className="text-xs text-muted-foreground">₸</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Options */}
        <Collapsible
          open={openSections.options}
          onOpenChange={() => toggleSection("options")}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-muted/50 p-2 rounded">
            <h3 className="text-sm font-medium">Дополнительно</h3>
            {openSections.options ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStockOnly"
                checked={localFilters.inStockOnly || false}
                onCheckedChange={() => handleToggleOption("inStockOnly")}
              />
              <Label
                htmlFor="inStockOnly"
                className="text-sm cursor-pointer hover:text-foreground/80"
              >
                Только в наличии
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={localFilters.featured || false}
                onCheckedChange={() => handleToggleOption("featured")}
              />
              <Label
                htmlFor="featured"
                className="text-sm cursor-pointer hover:text-foreground/80"
              >
                Рекомендуемые
              </Label>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4 border-t">
          <Button
            onClick={applyFilters}
            disabled={!hasChanges()}
            className="w-full"
            size="sm"
          >
            Применить фильтры
          </Button>
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="w-full"
            >
              Сбросить все
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
