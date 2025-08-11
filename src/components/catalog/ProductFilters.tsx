"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  Search,
  X,
  Filter,
  Star,
  Package,
  Tag,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Category,
  Brand,
  Collection,
  ProductFilters as FilterType,
} from "@/types/catalog";

interface ProductFiltersProps {
  filters: FilterType;
  categories: Category[];
  brands: Brand[];
  collections: Collection[];
  onFiltersChange: (filters: FilterType) => void;
  className?: string;
}

export function ProductFilters({
  filters,
  categories,
  brands,
  collections,
  onFiltersChange,
  className,
}: ProductFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterType>(filters);
  const [priceRange, setPriceRange] = useState([
    filters.priceRange?.min || 0,
    filters.priceRange?.max || 1000000,
  ]);
  const [searchTerms, setSearchTerms] = useState({
    category: "",
    brand: "",
    collection: "",
  });

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    price: true,
    categories: true,
    brands: true,
    collections: false,
    options: true,
  });

  // Sync with external filters
  useEffect(() => {
    setLocalFilters(filters);
    setPriceRange([
      filters.priceRange?.min || 0,
      filters.priceRange?.max || 1000000,
    ]);
  }, [filters]);

  const updateFilters = (newFilters: Partial<FilterType>) => {
    const updatedFilters = { ...localFilters, ...newFilters };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const currentCategories = localFilters.categories || [];
    const newCategories = checked
      ? [...currentCategories, categoryId]
      : currentCategories.filter((id) => id !== categoryId);

    updateFilters({ categories: newCategories });
  };

  const handleBrandChange = (brandId: string, checked: boolean) => {
    const currentBrands = localFilters.brands || [];
    const newBrands = checked
      ? [...currentBrands, brandId]
      : currentBrands.filter((id) => id !== brandId);

    updateFilters({ brands: newBrands });
  };

  const handleCollectionChange = (collectionId: string, checked: boolean) => {
    const currentCollections = localFilters.collections || [];
    const newCollections = checked
      ? [...currentCollections, collectionId]
      : currentCollections.filter((id) => id !== collectionId);

    updateFilters({ collections: newCollections });
  };

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value);
    updateFilters({
      priceRange: {
        min: value[0],
        max: value[1],
      },
    });
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterType = {
      categories: [],
      brands: [],
      collections: [],
      inStockOnly: false,
      featured: false,
      priceRange: { min: 0, max: 0 },
    };
    setLocalFilters(clearedFilters);
    setPriceRange([0, 1000000]);
    setSearchTerms({ category: "", brand: "", collection: "" });
    onFiltersChange(clearedFilters);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const getActiveFiltersCount = () => {
    return (
      (localFilters.categories?.length || 0) +
      (localFilters.brands?.length || 0) +
      (localFilters.collections?.length || 0) +
      (localFilters.inStockOnly ? 1 : 0) +
      (localFilters.featured ? 1 : 0) +
      ((localFilters.priceRange?.min || 0) > 0 ? 1 : 0) +
      ((localFilters.priceRange?.max || 0) > 0 ? 1 : 0)
    );
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerms.category.toLowerCase()),
  );

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerms.brand.toLowerCase()),
  );

  const filteredCollections = collections.filter((collection) =>
    collection.name
      .toLowerCase()
      .includes(searchTerms.collection.toLowerCase()),
  );

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Фильтры
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              <X className="h-4 w-4 mr-1" />
              Очистить
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Price Range */}
        <Collapsible
          open={expandedSections.price}
          onOpenChange={() => toggleSection("price")}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto"
            >
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium">Цена</span>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  expandedSections.price && "rotate-180",
                )}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="px-3">
              <Slider
                value={priceRange}
                onValueChange={handlePriceRangeChange}
                max={1000000}
                step={1000}
                className="w-full"
              />
              <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                <span>{priceRange[0].toLocaleString("ru-RU")} ₸</span>
                <span>{priceRange[1].toLocaleString("ru-RU")} ₸</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Categories */}
        <Collapsible
          open={expandedSections.categories}
          onOpenChange={() => toggleSection("categories")}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto"
            >
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span className="font-medium">Категории</span>
                {(localFilters.categories?.length || 0) > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {localFilters.categories?.length}
                  </Badge>
                )}
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  expandedSections.categories && "rotate-180",
                )}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск категорий..."
                value={searchTerms.category}
                onChange={(e) =>
                  setSearchTerms((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="pl-10"
              />
            </div>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={localFilters.categories?.includes(category.id)}
                      onCheckedChange={(checked) =>
                        handleCategoryChange(category.id, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Brands */}
        <Collapsible
          open={expandedSections.brands}
          onOpenChange={() => toggleSection("brands")}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto"
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="font-medium">Бренды</span>
                {(localFilters.brands?.length || 0) > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {localFilters.brands?.length}
                  </Badge>
                )}
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  expandedSections.brands && "rotate-180",
                )}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск брендов..."
                value={searchTerms.brand}
                onChange={(e) =>
                  setSearchTerms((prev) => ({
                    ...prev,
                    brand: e.target.value,
                  }))
                }
                className="pl-10"
              />
            </div>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {filteredBrands.map((brand) => (
                  <div key={brand.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand.id}`}
                      checked={localFilters.brands?.includes(brand.id)}
                      onCheckedChange={(checked) =>
                        handleBrandChange(brand.id, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`brand-${brand.id}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {brand.name}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Collections */}
        {collections.length > 0 && (
          <>
            <Collapsible
              open={expandedSections.collections}
              onOpenChange={() => toggleSection("collections")}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto"
                >
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <span className="font-medium">Коллекции</span>
                    {(localFilters.collections?.length || 0) > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {localFilters.collections?.length}
                      </Badge>
                    )}
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      expandedSections.collections && "rotate-180",
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск коллекций..."
                    value={searchTerms.collection}
                    onChange={(e) =>
                      setSearchTerms((prev) => ({
                        ...prev,
                        collection: e.target.value,
                      }))
                    }
                    className="pl-10"
                  />
                </div>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {filteredCollections.map((collection) => (
                      <div
                        key={collection.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`collection-${collection.id}`}
                          checked={localFilters.collections?.includes(
                            collection.id,
                          )}
                          onCheckedChange={(checked) =>
                            handleCollectionChange(
                              collection.id,
                              checked as boolean,
                            )
                          }
                        />
                        <Label
                          htmlFor={`collection-${collection.id}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          {collection.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CollapsibleContent>
            </Collapsible>
            <Separator />
          </>
        )}

        {/* Additional Options */}
        <Collapsible
          open={expandedSections.options}
          onOpenChange={() => toggleSection("options")}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="font-medium">Дополнительно</span>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  expandedSections.options && "rotate-180",
                )}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="in-stock-only" className="text-sm font-normal">
                  Только в наличии
                </Label>
                <Switch
                  id="in-stock-only"
                  checked={localFilters.inStockOnly || false}
                  onCheckedChange={(checked) =>
                    updateFilters({ inStockOnly: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="featured-only" className="text-sm font-normal">
                  Только рекомендуемые
                </Label>
                <Switch
                  id="featured-only"
                  checked={localFilters.featured || false}
                  onCheckedChange={(checked) =>
                    updateFilters({ featured: checked })
                  }
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Активные фильтры ({activeFiltersCount})
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-6 px-2 text-xs"
                >
                  Очистить все
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {localFilters.categories?.map((categoryId) => {
                  const category = categories.find((c) => c.id === categoryId);
                  return category ? (
                    <Badge
                      key={categoryId}
                      variant="secondary"
                      className="text-xs cursor-pointer"
                      onClick={() => handleCategoryChange(categoryId, false)}
                    >
                      {category.name}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ) : null;
                })}

                {localFilters.brands?.map((brandId) => {
                  const brand = brands.find((b) => b.id === brandId);
                  return brand ? (
                    <Badge
                      key={brandId}
                      variant="secondary"
                      className="text-xs cursor-pointer"
                      onClick={() => handleBrandChange(brandId, false)}
                    >
                      {brand.name}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ) : null;
                })}

                {localFilters.collections?.map((collectionId) => {
                  const collection = collections.find(
                    (c) => c.id === collectionId,
                  );
                  return collection ? (
                    <Badge
                      key={collectionId}
                      variant="secondary"
                      className="text-xs cursor-pointer"
                      onClick={() =>
                        handleCollectionChange(collectionId, false)
                      }
                    >
                      {collection.name}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ) : null;
                })}

                {localFilters.inStockOnly && (
                  <Badge
                    variant="secondary"
                    className="text-xs cursor-pointer"
                    onClick={() => updateFilters({ inStockOnly: false })}
                  >
                    В наличии
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                )}

                {localFilters.featured && (
                  <Badge
                    variant="secondary"
                    className="text-xs cursor-pointer"
                    onClick={() => updateFilters({ featured: false })}
                  >
                    Рекомендуемые
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
