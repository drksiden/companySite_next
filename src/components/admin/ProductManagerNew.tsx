"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDataCache } from "@/hooks/useAdminSettings";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Product as CatalogProduct,
  Category,
  Brand,
  Collection,
  Currency,
} from "@/types/catalog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  MoreHorizontal,
  Star,
  Package,
  TrendingUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { ProductFormNew } from "./ProductFormNew";
import { LoadingSkeleton } from "./LoadingSkeleton";
import {
  ProductStatusIndicator,
  StockStatusIndicator,
  FeaturedIndicator,
} from "./ProductStatusIndicator";
import { ProductImageDisplay } from "./ProductImageDisplay";
import { DialogScrollableContent } from "@/components/ui/scrollable-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminFormData {
  categories: any[];
  brands: any[];
  collections: any[];
  currencies: any[];
}

interface Filters {
  search: string;
  status: string;
  category: string;
  brand: string;
  featured: string;
}

interface Pagination {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

export function ProductManagerNew() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [formData, setFormData] = useState<AdminFormData>({
    categories: [],
    brands: [],
    collections: [],
    currencies: [],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(
    null,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "all",
    category: "all",
    brand: "all",
    featured: "all",
  });
  const [pagination, setPagination] = useState<Pagination>({
    limit: 20,
    offset: 0,
    total: 0,
    hasMore: false,
  });

  // Простая загрузка данных для форм
  const [formDataLoading, setFormDataLoading] = useState(false);
  const [formDataError, setFormDataError] = useState<string | null>(null);

  // Загружаем данные форм
  useEffect(() => {
    const loadFormData = async () => {
      try {
        setFormDataLoading(true);
        const response = await fetch("/api/admin/form-data?type=all");
        if (!response.ok) throw new Error("Failed to load form data");
        const data = await response.json();
        setFormData(data);
      } catch (error) {
        setFormDataError(
          error instanceof Error ? error.message : "Unknown error",
        );
      } finally {
        setFormDataLoading(false);
      }
    };

    loadFormData();
  }, []);

  // Построение URL для запроса продуктов
  const productsUrl = useMemo(() => {
    const params = new URLSearchParams({
      limit: pagination.limit.toString(),
      offset: pagination.offset.toString(),
    });

    if (filters.search) params.append("search", filters.search);
    if (filters.status !== "all") params.append("status", filters.status);
    if (filters.category !== "all") params.append("category", filters.category);
    if (filters.brand !== "all") params.append("brand", filters.brand);
    if (filters.featured !== "all") params.append("featured", filters.featured);

    return `/api/admin/products?${params}`;
  }, [filters, pagination.limit, pagination.offset]);

  // Простая загрузка продуктов
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Используем новый хук для кэширования
  const { getCachedData, setCachedData, isCacheEnabled } = useDataCache<{
    products: any[];
    total: number;
    hasMore: boolean;
  }>("products");

  // Загружаем продукты
  const loadProducts = async (url: string, isRefresh = false) => {
    try {
      // Проверяем кэш сначала (кроме случаев принудительного обновления)
      if (!isRefresh && isCacheEnabled) {
        const cachedData = getCachedData(url);
        if (cachedData) {
          setProducts(cachedData.products || []);
          setPagination((prev) => ({
            ...prev,
            total: cachedData.total || 0,
            hasMore: cachedData.hasMore || false,
          }));
          return;
        }
      }

      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setProductsLoading(true);
      }
      setProductsError(null);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to load products");
      const data = await response.json();

      // Кэшируем данные
      if (isCacheEnabled) {
        setCachedData(url, {
          products: data.products || [],
          total: data.total || 0,
          hasMore: data.hasMore || false,
        });
      }

      // Добавляем небольшую задержку для плавности анимации
      if (isRefresh) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      setProducts(data.products || []);
      setPagination((prev) => ({
        ...prev,
        total: data.total || 0,
        hasMore: data.hasMore || false,
      }));
    } catch (error) {
      setProductsError(
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setProductsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Загружаем продукты при изменении URL
  useEffect(() => {
    const isFirstLoad = products.length === 0;
    loadProducts(productsUrl, !isFirstLoad);
  }, [productsUrl]);

  // Устанавливаем общее состояние загрузки
  useEffect(() => {
    setLoading(formDataLoading || productsLoading);
  }, [formDataLoading, productsLoading]);

  // Показываем ошибки
  useEffect(() => {
    if (formDataError) {
      toast.error("Ошибка при загрузке данных для форм");
    }
    if (productsError) {
      toast.error("Ошибка при загрузке товаров");
    }
  }, [formDataError, productsError]);

  // Функция для закрытия диалога с очисткой состояния
  const handleCloseDialog = useCallback(() => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setDialogKey((prev) => prev + 1); // Принудительно пересоздаем диалог
  }, []);

  const handleCreateProduct = async (data: globalThis.FormData) => {
    try {
      setSubmitting(true);

      const response = await fetch("/api/admin/products", {
        method: "POST",
        body: data as unknown as BodyInit,
      });

      if (response.ok) {
        const result = await response.json();
        let message = "Продукт успешно создан";

        // Добавляем информацию о загрузке файлов
        if (result.uploadInfo) {
          const { imagesUploaded, documentsUploaded, errors } =
            result.uploadInfo;
          if (imagesUploaded > 0 || documentsUploaded > 0) {
            message += ` (загружено: ${imagesUploaded} изображений, ${documentsUploaded} документов)`;
          }
          if (errors && errors.length > 0) {
            message += `. Ошибки загрузки: ${errors.join(", ")}`;
          }
        }

        toast.success(message);
        handleCloseDialog();
        // Плавное обновление списка
        await new Promise((resolve) => setTimeout(resolve, 200));
        loadProducts(productsUrl, true);
      } else {
        const error = await response.json();
        toast.error(error.error || "Не удалось создать продукт");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Ошибка при создании продукта");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProduct = async (data: globalThis.FormData) => {
    try {
      setSubmitting(true);

      const response = await fetch("/api/admin/products", {
        method: "PUT",
        body: data as unknown as BodyInit,
      });

      if (response.ok) {
        const result = await response.json();
        let message = "Продукт успешно обновлен";

        // Добавляем информацию о загрузке файлов
        if (result.uploadInfo) {
          const { imagesUploaded, documentsUploaded, errors } =
            result.uploadInfo;
          if (imagesUploaded > 0 || documentsUploaded > 0) {
            message += ` (загружено: ${imagesUploaded} новых изображений, ${documentsUploaded} новых документов)`;
          }
          if (errors && errors.length > 0) {
            message += `. Ошибки загрузки: ${errors.join(", ")}`;
          }
        }

        toast.success(message);
        handleCloseDialog();
        // Плавное обновление списка
        await new Promise((resolve) => setTimeout(resolve, 200));
        loadProducts(productsUrl, true);
      } else {
        const error = await response.json();
        toast.error(error.error || "Не удалось обновить продукт");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Ошибка при обновлении продукта");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот продукт?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Продукт удален");
        // Плавное обновление списка после удаления
        await new Promise((resolve) => setTimeout(resolve, 200));
        loadProducts(productsUrl, true);
      } else {
        const error = await response.json();
        toast.error(error.error || "Не удалось удалить продукт");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Ошибка при удалении продукта");
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, offset: 0 }));
  };

  const handlePageChange = (newOffset: number) => {
    setPagination((prev) => ({ ...prev, offset: newOffset }));
  };

  const formatPrice = (price: number, currency?: { symbol: string }) => {
    return `${price.toLocaleString("kk-KZ")} ${currency?.symbol || "₸"}`;
  };

  const getStatusBadge = (status: string) => {
    return (
      <ProductStatusIndicator
        status={status as "draft" | "active" | "archived" | "out_of_stock"}
        size="sm"
      />
    );
  };

  const getStockStatus = (quantity: number, minLevel: number = 5) => {
    return (
      <StockStatusIndicator
        quantity={quantity}
        minStockLevel={minLevel}
        size="sm"
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и статистика */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Управление товарами</h1>
          <p className="text-muted-foreground mt-2">
            Управляйте каталогом товаров вашего магазина
          </p>
        </div>

        <Dialog
          key={dialogKey}
          open={isFormOpen}
          onOpenChange={(open) => {
            if (!open) {
              handleCloseDialog();
            } else {
              setIsFormOpen(true);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={() => setEditingProduct(null)}
              className="enhanced-shadow"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить товар
            </Button>
          </DialogTrigger>
          <DialogContent size="xl" scrollable={true}>
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Редактировать товар" : "Добавить товар"}
              </DialogTitle>
              <DialogDescription>
                {editingProduct
                  ? "Обновите информацию о товаре"
                  : "Заполните информацию о новом товаре"}
              </DialogDescription>
            </DialogHeader>
            <ProductFormNew
              key={editingProduct?.id || "new"}
              onSubmit={
                editingProduct ? handleUpdateProduct : handleCreateProduct
              }
              initialData={editingProduct}
              categories={formData.categories}
              brands={formData.brands}
              collections={formData.collections}
              currencies={formData.currencies}
              isSubmitting={submitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Статистические карточки */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего товаров</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Опубликованные
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter((p) => p.status === "active").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Рекомендуемые</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter((p) => p.is_featured).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Заканчиваются</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter((p) => p.inventory_quantity <= 5).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search">Поиск</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Поиск по названию, SKU..."
                  className="pl-8"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Статус</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="draft">Черновик</SelectItem>
                  <SelectItem value="active">Активный</SelectItem>
                  <SelectItem value="archived">Архивирован</SelectItem>
                  <SelectItem value="out_of_stock">Нет в наличии</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Категория</Label>
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilterChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  {formData.categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {"—".repeat(category.level)} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="brand">Бренд</Label>
              <Select
                value={filters.brand}
                onValueChange={(value) => handleFilterChange("brand", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все бренды</SelectItem>
                  {formData.brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="featured">Рекомендуемые</Label>
              <Select
                value={filters.featured}
                onValueChange={(value) => handleFilterChange("featured", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все товары</SelectItem>
                  <SelectItem value="true">Рекомендуемые</SelectItem>
                  <SelectItem value="false">Обычные</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблица товаров */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Товары</CardTitle>
            <CardDescription>
              Найдено {pagination.total} товаров
              {isRefreshing && (
                <span className="ml-2 text-primary">• Обновление...</span>
              )}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadProducts(productsUrl, true)}
            disabled={loading || isRefreshing}
            className="transition-all duration-200"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Обновление
              </>
            ) : (
              "Обновить"
            )}
          </Button>
        </CardHeader>
        <CardContent
          className={
            isRefreshing
              ? "opacity-75 transition-opacity duration-300"
              : "transition-opacity duration-300"
          }
        >
          {loading ? (
            <LoadingSkeleton rows={5} showFilters={false} />
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Товары не найдены
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {filters.search
                  ? "Попробуйте изменить параметры поиска"
                  : "Начните с добавления первого товара"}
              </p>
              {!filters.search && (
                <Button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsFormOpen(true);
                  }}
                  className="enhanced-shadow"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить первый товар
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-lg border overflow-hidden">
                <Table className="admin-table">
                  <TableHeader>
                    <TableRow className="border-b">
                      <TableHead className="w-16 text-center bg-muted/50">
                        Фото
                      </TableHead>
                      <TableHead className="min-w-[200px] bg-muted/50">
                        Товар
                      </TableHead>
                      <TableHead className="w-[120px] bg-muted/50">
                        Категория
                      </TableHead>
                      <TableHead className="w-[120px] bg-muted/50">
                        Бренд
                      </TableHead>
                      <TableHead className="w-[120px] text-right bg-muted/50">
                        Цена
                      </TableHead>
                      <TableHead className="w-[100px] text-center bg-muted/50">
                        Остаток
                      </TableHead>
                      <TableHead className="w-[100px] text-center bg-muted/50">
                        Статус
                      </TableHead>
                      <TableHead className="w-[80px] text-center bg-muted/50">
                        Действия
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product, index) => (
                      <TableRow
                        key={product.id}
                        className="hover:bg-muted/30 transition-all duration-200 animate-in fade-in slide-in-from-top-2"
                        style={{
                          animationDelay: `${index * 50}ms`,
                          animationFillMode: "both",
                        }}
                      >
                        <TableCell className="text-center p-2">
                          <div className="flex justify-center">
                            <ProductImageDisplay
                              thumbnail={product.thumbnail}
                              images={(product as any).images || []}
                              productName={product.name}
                              size="md"
                              showZoom={true}
                              showGallery={true}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="p-3">
                          <div className="space-y-1">
                            <div className="font-medium text-foreground leading-tight">
                              {product.name}
                            </div>
                            {product.sku && (
                              <div className="text-xs text-muted-foreground font-mono">
                                SKU: {product.sku}
                              </div>
                            )}
                            {product.is_featured && (
                              <FeaturedIndicator
                                isFeatured={true}
                                size="sm"
                                className="mt-1"
                              />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="p-3">
                          <div
                            className="text-sm text-overflow-ellipsis"
                            title={(product as any).category?.name}
                          >
                            {(product as any).category?.name || (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="p-3">
                          <div
                            className="text-sm text-overflow-ellipsis"
                            title={(product as any).brand?.name}
                          >
                            {(product as any).brand?.name || (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="p-3 text-right">
                          <div className="space-y-1">
                            <div className="font-medium text-sm">
                              {formatPrice(
                                product.base_price || 0,
                                (product as any).currencies,
                              )}
                            </div>
                            {product.sale_price && (
                              <div className="text-xs text-muted-foreground line-through">
                                {formatPrice(
                                  product.sale_price,
                                  (product as any).currencies,
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="p-3 text-center">
                          <div className="space-y-2">
                            <div className="text-sm font-medium">
                              {product.inventory_quantity} шт.
                            </div>
                            {getStockStatus(product.inventory_quantity)}
                          </div>
                        </TableCell>
                        <TableCell className="p-3 text-center">
                          {getStatusBadge(product.status)}
                        </TableCell>
                        <TableCell className="p-3 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-accent transition-colors duration-200"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Действия</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingProduct(product);
                                  setIsFormOpen(true);
                                }}
                                className="transition-colors duration-200 hover:bg-accent"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Редактировать
                              </DropdownMenuItem>
                              <DropdownMenuItem className="transition-colors duration-200">
                                <Eye className="h-4 w-4 mr-2" />
                                Просмотр
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  if (
                                    confirm(
                                      "Вы уверены, что хотите удалить этот товар?",
                                    )
                                  ) {
                                    handleDeleteProduct(product.id);
                                  }
                                }}
                                className="text-destructive hover:bg-destructive/10 transition-colors duration-200"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Удалить
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Пагинация */}
              {pagination.total > pagination.limit && (
                <div className="flex items-center justify-between mt-6 p-4 bg-muted/20 rounded-lg border">
                  <div className="text-sm text-muted-foreground font-medium">
                    Показано{" "}
                    <span className="text-foreground">
                      {pagination.offset + 1}
                    </span>
                    -
                    <span className="text-foreground">
                      {Math.min(
                        pagination.offset + pagination.limit,
                        pagination.total,
                      )}
                    </span>{" "}
                    из{" "}
                    <span className="text-foreground font-semibold">
                      {pagination.total}
                    </span>{" "}
                    товаров
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(
                          Math.max(0, pagination.offset - pagination.limit),
                        )
                      }
                      disabled={pagination.offset === 0}
                      className="transition-all duration-200 hover:shadow-sm"
                    >
                      Предыдущая
                    </Button>
                    <div className="text-sm text-muted-foreground px-2">
                      Страница{" "}
                      {Math.floor(pagination.offset / pagination.limit) + 1} из{" "}
                      {Math.ceil(pagination.total / pagination.limit)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(pagination.offset + pagination.limit)
                      }
                      disabled={!pagination.hasMore}
                      className="transition-all duration-200 hover:shadow-sm"
                    >
                      Следующая
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
