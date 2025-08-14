"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, Search, Filter } from "lucide-react";
import { CategoryItem, BrandItem } from "@/lib/services/catalog";

interface FiltersSidebarProps {
  categories: CategoryItem[];
  brands: BrandItem[];
  currentFilters: {
    categories: string[];
    brands: string[];
    collections: string[];
    minPrice?: number;
    maxPrice?: number;
    inStockOnly: boolean;
    search: string;
  };
  onFiltersChange: (filters: Partial<FiltersSidebarProps["currentFilters"]>) => void;
  onClose?: () => void;
}

export default function FiltersSidebar({
  categories,
  brands,
  currentFilters,
  onFiltersChange,
  onClose,
}: FiltersSidebarProps) {
  const [searchTerm, setSearchTerm] = useState(currentFilters.search);
  const [priceRange, setPriceRange] = useState([
    currentFilters.minPrice || 0,
    currentFilters.maxPrice || 100000,
  ]);
  const [expandedSections, setExpandedSections] = useState({
    search: true,
    categories: true,
    brands: true,
    price: true,
    options: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ search: searchTerm });
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...currentFilters.categories, categoryId]
      : currentFilters.categories.filter(id => id !== categoryId);

    onFiltersChange({ categories: newCategories });
  };

  const handleBrandChange = (brandId: string, checked: boolean) => {
    const newBrands = checked
      ? [...currentFilters.brands, brandId]
      : currentFilters.brands.filter(id => id !== brandId);

    onFiltersChange({ brands: newBrands });
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
    onFiltersChange({
      minPrice: values[0] > 0 ? values[0] : undefined,
      maxPrice: values[1] < 100000 ? values[1] : undefined,
    });
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setPriceRange([0, 100000]);
    onFiltersChange({
      categories: [],
      brands: [],
      collections: [],
      minPrice: undefined,
      maxPrice: undefined,
      inStockOnly: false,
      search: "",
    });
  };

  const hasActiveFilters =
    currentFilters.categories.length > 0 ||
    currentFilters.brands.length > 0 ||
    currentFilters.collections.length > 0 ||
    currentFilters.minPrice ||
    currentFilters.maxPrice ||
    currentFilters.inStockOnly ||
    currentFilters.search;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle className="text-lg">Фильтры</CardTitle>
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                {[
                  currentFilters.categories.length,
                  currentFilters.brands.length,
                  currentFilters.search ? 1 : 0,
                  currentFilters.minPrice || currentFilters.maxPrice ? 1 : 0,
                  currentFilters.inStockOnly ? 1 : 0,
                ].reduce((sum, count) => sum + count, 0)}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                Очистить
              </Button>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="lg:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection("search")}
            className="flex items-center justify-between w-full text-left"
          >
            <Label className="text-sm font-medium">Поиск</Label>
            <span className="text-xs text-muted-foreground">
              {expandedSections.search ? "−" : "+"}
            </span>
          </button>

          {expandedSections.search && (
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Поиск товаров..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" size="sm">
                Найти
              </Button>
            </form>
          )}
        </div>

        <Separator />

        {/* Categories */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection("categories")}
            className="flex items-center justify-between w-full text-left"
          >
            <Label className="text-sm font-medium">Категории</Label>
            <div className="flex items-center gap-2">
              {currentFilters.categories.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {currentFilters.categories.length}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {expandedSections.categories ? "−" : "+"}
              </span>
            </div>
          </button>

          {expandedSections.categories && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={currentFilters.categories.includes(category.id)}
                    onCheckedChange={(checked) =>
                      handleCategoryChange(category.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`category-${category.id}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {category.name}
                    {category.product_count && (
                      <span className="text-muted-foreground ml-1">
                        ({category.product_count})
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Brands */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection("brands")}
            className="flex items-center justify-between w-full text-left"
          >
            <Label className="text-sm font-medium">Бренды</Label>
            <div className="flex items-center gap-2">
              {currentFilters.brands.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {currentFilters.brands.length}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {expandedSections.brands ? "−" : "+"}
              </span>
            </div>
          </button>

          {expandedSections.brands && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {brands.map((brand) => (
                <div key={brand.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand.id}`}
                    checked={currentFilters.brands.includes(brand.id)}
                    onCheckedChange={(checked) =>
                      handleBrandChange(brand.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`brand-${brand.id}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {brand.name}
                    {brand.product_count && (
                      <span className="text-muted-foreground ml-1">
                        ({brand.product_count})
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Price Range */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection("price")}
            className="flex items-center justify-between w-full text-left"
          >
            <Label className="text-sm font-medium">Цена</Label>
            <div className="flex items-center gap-2">
              {(currentFilters.minPrice || currentFilters.maxPrice) && (
                <Badge variant="secondary" className="text-xs">
                  {currentFilters.minPrice || 0} - {currentFilters.maxPrice || "∞"} ₸
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {expandedSections.price ? "−" : "+"}
              </span>
            </div>
          </button>

          {expandedSections.price && (
            <div className="space-y-4">
              <div className="px-2">
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceChange}
                  max={100000}
                  min={0}
                  step={1000}
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">от</span>
                <span className="font-medium">{priceRange[0].toLocaleString()} ₸</span>
                <span className="text-muted-foreground">до</span>
                <span className="font-medium">
                  {priceRange[1] >= 100000 ? "∞" : `${priceRange[1].toLocaleString()} ₸`}
                </span>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Additional Options */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection("options")}
            className="flex items-center justify-between w-full text-left"
          >
            <Label className="text-sm font-medium">Дополнительно</Label>
            <span className="text-xs text-muted-foreground">
              {expandedSections.options ? "−" : "+"}
            </span>
          </button>

          {expandedSections.options && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inStockOnly"
                  checked={currentFilters.inStockOnly}
                  onCheckedChange={(checked) =>
                    onFiltersChange({ inStockOnly: checked as boolean })
                  }
                />
                <Label htmlFor="inStockOnly" className="text-sm cursor-pointer">
                  Только в наличии
                </Label>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
