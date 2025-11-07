"use client";

import React, {
  useState,
  useEffect,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Star,
  Package,
  AlertCircle,
  Loader2,
  FileText,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { ProductFormNew } from "./ProductFormNew";
import { LoadingSkeleton } from "./LoadingSkeleton";
import {
  ProductStatusIndicator,
  StockStatusIndicator,
  FeaturedIndicator,
} from "./ProductStatusIndicator";
import { ProductImageDisplay } from "./ProductImageDisplay";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useProductsQuery,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/lib/hooks/useProductsQuery";
import { ProductsResponse } from "@/lib/services/admin/product";

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

export function ProductManagerNew() {
  const [formData, setFormData] = useState<AdminFormData>({
    categories: [],
    brands: [],
    collections: [],
    currencies: [],
  });
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(
    null,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "all",
    category: "all",
    brand: "all",
    featured: "all",
  });
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
  });

  // Загружаем данные форм
  useEffect(() => {
    const loadFormData = async () => {
      try {
        const response = await fetch("/api/admin/form-data?type=all");
        if (!response.ok) throw new Error("Failed to load form data");
        const data = await response.json();
        setFormData(data);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Ошибка при загрузке данных для форм"
        );
      }
    };

    loadFormData();
  }, []);

  // Используем TanStack Query для загрузки продуктов
  const {
    data: productsData,
    isLoading: productsLoading,
    isRefetching: isRefreshing,
    error: productsError,
    refetch,
  } = useProductsQuery(
    {
      search: filters.search || undefined,
      status: filters.status !== "all" ? filters.status : undefined,
      category: filters.category !== "all" ? filters.category : undefined,
      brand: filters.brand !== "all" ? filters.brand : undefined,
      featured: filters.featured !== "all" ? filters.featured : undefined,
    },
    pagination
  );

  const products = (productsData as ProductsResponse | undefined)?.products || [];
  const total = (productsData as ProductsResponse | undefined)?.total || 0;
  const hasMore = (productsData as ProductsResponse | undefined)?.hasMore || false;

  // Мутации для CRUD операций
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  // Показываем ошибки
  useEffect(() => {
    if (productsError) {
      toast.error("Ошибка при загрузке товаров");
    }
  }, [productsError]);

  // Функция для закрытия диалога с очисткой состояния
  const handleCloseDialog = useCallback(() => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setDialogKey((prev) => prev + 1); // Принудительно пересоздаем диалог
  }, []);

  const handleCreateProduct = async (data: globalThis.FormData) => {
    try {
      const result = await createProductMutation.mutateAsync({
        formData: data as unknown as FormData,
      });

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
      // Очищаем автосохранение после успешного создания
      localStorage.removeItem(`product-form-draft-${editingProduct?.id || 'new'}`);
      handleCloseDialog();
    } catch (error) {
      console.error("Error creating product:", error);
      const errorMessage = error instanceof Error ? error.message : "Ошибка при создании продукта";
      
      // Если ошибка связана с сессией, предлагаем обновить страницу
      if (errorMessage.includes("Session expired") || errorMessage.includes("Unauthorized")) {
        toast.error(
          "Сессия истекла. Пожалуйста, обновите страницу и попробуйте снова.",
          {
            duration: 5000,
            action: {
              label: "Обновить",
              onClick: () => window.location.reload(),
            },
          }
        );
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleUpdateProduct = async (data: globalThis.FormData) => {
    try {
      const productId = data.get("id") as string;
      if (!productId) {
        toast.error("ID продукта не найден");
        return;
      }

      const result = await updateProductMutation.mutateAsync({
        id: productId,
        formData: data as unknown as FormData,
      });

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
      // Очищаем автосохранение после успешного обновления
      localStorage.removeItem(`product-form-draft-${editingProduct?.id || 'new'}`);
      handleCloseDialog();
    } catch (error) {
      console.error("Error updating product:", error);
      const errorMessage = error instanceof Error ? error.message : "Ошибка при обновлении продукта";
      
      // Если ошибка связана с сессией, предлагаем обновить страницу
      if (errorMessage.includes("Session expired") || errorMessage.includes("Unauthorized")) {
        toast.error(
          "Сессия истекла. Пожалуйста, обновите страницу и попробуйте снова.",
          {
            duration: 5000,
            action: {
              label: "Обновить",
              onClick: () => window.location.reload(),
            },
          }
        );
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот продукт?")) {
      return;
    }

    try {
      await deleteProductMutation.mutateAsync(productId);
      toast.success("Продукт удален");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(
        error instanceof Error ? error.message : "Ошибка при удалении продукта"
      );
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, offset: 0 }));
  };

  const handlePageChange = (newOffset: number) => {
    setPagination((prev) => ({ ...prev, offset: newOffset }));
    // Прокручиваем вверх при смене страницы
    window.scrollTo({ top: 0, behavior: "smooth" });
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
              onClick={() => {
                setEditingProduct(null);
                // Очищаем автосохранение при создании нового товара
                localStorage.removeItem("product-form-draft-new");
              }}
              className="enhanced-shadow"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить товар
            </Button>
          </DialogTrigger>
          <DialogContent 
            size="xl" 
            scrollable={true}
            onInteractOutside={(e) => {
              // Перехватываем закрытие при клике вне формы
              const formElement = document.querySelector('[data-unsaved-changes]');
              if (formElement) {
                e.preventDefault();
                if (confirm("У вас есть несохраненные изменения. Вы уверены, что хотите закрыть форму?")) {
                  // Очищаем автосохранение при подтверждении закрытия
                  localStorage.removeItem(`product-form-draft-${editingProduct?.id || 'new'}`);
                  handleCloseDialog();
                }
              }
            }}
            onEscapeKeyDown={(e) => {
              // Перехватываем закрытие по Escape
              const formElement = document.querySelector('[data-unsaved-changes]');
              if (formElement) {
                e.preventDefault();
                if (confirm("У вас есть несохраненные изменения. Вы уверены, что хотите закрыть форму?")) {
                  // Очищаем автосохранение при подтверждении закрытия
                  localStorage.removeItem(`product-form-draft-${editingProduct?.id || 'new'}`);
                  handleCloseDialog();
                }
              }
            }}
          >
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
              isSubmitting={
                createProductMutation.isPending || updateProductMutation.isPending
              }
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Статистические карточки */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего товаров</CardTitle>
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Всего в базе данных
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Опубликованные
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {products.filter((p) => p.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Активных товаров
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Рекомендуемые</CardTitle>
            <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {products.filter((p) => p.is_featured).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Избранных товаров
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Заканчиваются</CardTitle>
            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {products.filter((p) => p.inventory_quantity <= 5).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Требуют пополнения
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Фильтры и поиск</CardTitle>
          </div>
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
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg">Список товаров</CardTitle>
            <CardDescription className="mt-1">
              Найдено <span className="font-semibold text-foreground">{total}</span> товаров
              {isRefreshing && (
                <span className="ml-2 text-primary flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Обновление...
                </span>
              )}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={productsLoading || isRefreshing}
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
          {productsLoading ? (
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
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-foreground leading-tight">
                                {product.name}
                              </div>
                            </div>
                            {product.sku && (
                              <div className="text-xs text-muted-foreground font-mono">
                                SKU: {product.sku}
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              {product.is_featured && (
                                <FeaturedIndicator
                                  isFeatured={true}
                                  size="sm"
                                />
                              )}
                              {(product as any).documents &&
                                Array.isArray((product as any).documents) &&
                                (product as any).documents.length > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <FileText className="h-3.5 w-3.5" />
                                    <span>
                                      {(product as any).documents.length}{" "}
                                      {(product as any).documents.length === 1
                                        ? "документ"
                                        : "документов"}
                                    </span>
                                  </div>
                                )}
                            </div>
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
              {total > pagination.limit && (
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
                        total,
                      )}
                    </span>{" "}
                    из{" "}
                    <span className="text-foreground font-semibold">
                      {total}
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
                      {Math.ceil(total / pagination.limit)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(pagination.offset + pagination.limit)
                      }
                      disabled={!hasMore}
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
