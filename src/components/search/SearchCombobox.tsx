"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Package, Tag, Folder, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// ScrollArea удален, используется обычный overflow-y-auto для скролла
import Link from "next/link";
import Image from "next/image";

interface SearchResult {
  products: Array<{
    id: string;
    name: string;
    slug: string;
    thumbnail?: string;
    images?: string[] | string;
    formatted_price?: string;
    brand_name?: string;
  }>;
  brands: Array<{
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    path?: string;
    image_url?: string;
  }>;
  total: number;
}

export function SearchCombobox() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Debounce поиска
  React.useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/catalog/search?q=${encodeURIComponent(query)}&limit=5`
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data.data);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Закрываем результаты при клике вне компонента
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (href: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(href);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/catalog?query=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
    setResults(null);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (query.length >= 2) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Поиск ..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            className="pl-10 pr-10 h-10 w-full text-foreground"
            aria-label="Поле поиска"
            aria-autocomplete="list"
            aria-controls="search-results"
            aria-expanded={isOpen}
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={handleClear}
              aria-label="Очистить поиск"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-[100] max-h-[400px] overflow-y-auto overflow-x-hidden" id="search-results" role="listbox" aria-label="Результаты поиска">
            {isLoading ? (
              <div className="flex items-center justify-center p-8" role="status" aria-live="polite">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">Загрузка результатов поиска</span>
              </div>
            ) : results && results.total > 0 ? (
              <div className="p-2">
                {/* Товары */}
                {results.products.length > 0 && (
                  <div className="mb-4">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                      <Package className="h-3 w-3" />
                      Товары ({results.products.length})
                    </div>
                    <div className="space-y-1">
                      {results.products.map((product) => {
                        // Получаем изображение товара
                        let imageSrc = product.thumbnail;
                        
                        // Если нет thumbnail, берем первое изображение из массива images
                        if (!imageSrc && product.images) {
                          if (Array.isArray(product.images) && product.images.length > 0) {
                            imageSrc = product.images[0];
                          } else if (typeof product.images === 'string' && product.images.trim()) {
                            imageSrc = product.images;
                          }
                        }
                        
                        // Fallback на placeholder
                        if (!imageSrc || imageSrc.trim() === '') {
                          imageSrc = "/images/placeholder-product.svg";
                        }
                        
                        return (
                          <Link
                            key={product.id}
                            href={`/catalog/product/${product.slug}`}
                            onClick={() => handleSelect(`/catalog/product/${product.slug}`)}
                            className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
                            role="option"
                            aria-label={`Товар: ${product.name}${product.formatted_price ? `, цена ${product.formatted_price}` : ''}`}
                          >
                            <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                              <Image
                                src={imageSrc}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                                quality={75}
                                unoptimized={
                                  imageSrc === "/images/placeholder-product.svg" ||
                                  imageSrc.includes("r2.asia-ntb.kz") ||
                                  imageSrc.includes("r2.dev")
                                }
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  if (target.src !== "/images/placeholder-product.svg") {
                                    target.src = "/images/placeholder-product.svg";
                                  }
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {product.name}
                              </div>
                              {product.brand_name && (
                                <div className="text-xs text-muted-foreground">
                                  {product.brand_name}
                                </div>
                              )}
                              {product.formatted_price && (
                                <div className="text-xs text-primary font-medium">
                                  {product.formatted_price}
                                </div>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Бренды */}
                {results.brands.length > 0 && (
                  <div className="mb-4">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                      <Tag className="h-3 w-3" />
                      Бренды ({results.brands.length})
                    </div>
                    <div className="space-y-1">
                      {results.brands.map((brand) => (
                        <Link
                          key={brand.id}
                          href={`/catalog?brand=${brand.slug}`}
                          onClick={() => handleSelect(`/catalog?brand=${brand.slug}`)}
                          className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
                          role="option"
                          aria-label={`Бренд: ${brand.name}`}
                        >
                          {brand.logo_url && (
                            <div className="relative w-10 h-10 rounded-md overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                              <Image
                                src={brand.logo_url}
                                alt={brand.name}
                                fill
                                className="object-contain p-1"
                                sizes="40px"
                              />
                            </div>
                          )}
                          <div className="text-sm font-medium">{brand.name}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Категории */}
                {results.categories.length > 0 && (
                  <div>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                      <Folder className="h-3 w-3" />
                      Категории ({results.categories.length})
                    </div>
                    <div className="space-y-1">
                      {results.categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/catalog/${category.path || category.slug}`}
                          onClick={() => handleSelect(`/catalog/${category.path || category.slug}`)}
                          className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
                          role="option"
                          aria-label={`Категория: ${category.name}`}
                        >
                          {category.image_url && (
                            <div className="relative w-10 h-10 rounded-md overflow-hidden bg-muted shrink-0">
                              <Image
                                src={category.image_url}
                                alt={category.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                          )}
                          <div className="text-sm font-medium">{category.name}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {query.trim() && (
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-foreground hover:text-primary hover:bg-accent"
                      onClick={() => {
                        setIsOpen(false);
                        router.push(`/catalog?query=${encodeURIComponent(query.trim())}`);
                        setQuery("");
                      }}
                    >
                      <Search className="mr-2 h-4 w-4 shrink-0" />
                      <span className="truncate">
                        Показать все результаты для &quot;{query.length > 30 ? `${query.substring(0, 30)}...` : query}&quot;
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            ) : query.length >= 2 ? (
              <div className="p-8 text-center text-sm text-muted-foreground" role="status" aria-live="polite">
                Ничего не найдено
              </div>
            ) : null}
        </div>
      )}
    </div>
  );
}

