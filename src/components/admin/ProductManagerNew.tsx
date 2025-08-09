"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { ProductFormNew } from "./ProductFormNew";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  base_price: number;
  sale_price?: number;
  inventory_quantity: number;
  status: "draft" | "published" | "archived";
  is_featured: boolean;
  thumbnail?: string;
  view_count: number;
  sales_count: number;
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name: string;
    slug: string;
    path: string;
    level: number;
  };
  brands?: {
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
  };
  collections?: {
    id: string;
    name: string;
    slug: string;
  };
  currencies?: {
    id: string;
    code: string;
    symbol: string;
    name: string;
  };
}

interface FormData {
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
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<FormData>({
    categories: [],
    brands: [],
    collections: [],
    currencies: [],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
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

  // Загрузка данных для форм
  useEffect(() => {
    loadFormData();
  }, []);

  // Загрузка продуктов при изменении фильтров
  useEffect(() => {
    loadProducts();
  }, [filters, pagination.limit, pagination.offset]);

  const loadFormData = async () => {
    try {
      const response = await fetch("/api/admin/form-data?type=all");
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      } else {
        toast.error("Не удалось загрузить данные для форм");
      }
    } catch (error) {
      console.error("Error loading form data:", error);
      toast.error("Ошибка при загрузке данных для форм");
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
      });

      if (filters.search) params.append("search", filters.search);
      if (filters.status !== "all") params.append("status", filters.status);
      if (filters.category !== "all")
        params.append("category", filters.category);
      if (filters.brand !== "all") params.append("brand", filters.brand);
      if (filters.featured !== "all")
        params.append("featured", filters.featured);

      const response = await fetch(`/api/admin/products?${params}`);

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
          hasMore: data.pagination?.hasMore || false,
        }));
      } else {
        toast.error("Не удалось загрузить продукты");
      }
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Ошибка при загрузке продуктов");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (data: globalThis.FormData) => {
    try {
      setSubmitting(true);

      const response = await fetch("/api/admin/products", {
        method: "POST",
        body: data as unknown as BodyInit,
      });

      if (response.ok) {
        toast.success("Продукт успешно создан");
        setIsFormOpen(false);
        loadProducts();
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
        toast.success("Продукт успешно обновлен");
        setIsFormOpen(false);
        setEditingProduct(null);
        loadProducts();
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
      const response = await fetch(`/api/admin/products?id=${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Продукт успешно удален");
        loadProducts();
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
    return `${price.toLocaleString("ru-RU")} ${currency?.symbol || "₸"}`;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "secondary",
      published: "default",
      archived: "outline",
    } as const;

    const labels = {
      draft: "Черновик",
      published: "Опубликован",
      archived: "Архивирован",
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getStockStatus = (quantity: number, minLevel: number = 0) => {
    if (quantity === 0) {
      return <Badge variant="destructive">Нет в наличии</Badge>;
    } else if (quantity <= minLevel) {
      return (
        <Badge variant="outline" className="text-orange-600">
          Заканчивается
        </Badge>
      );
    } else {
      return (
        <Badge variant="default" className="bg-green-600">
          В наличии
        </Badge>
      );
    }
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

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProduct(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить товар
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
              {products.filter((p) => p.status === "published").length}
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
                  <SelectItem value="published">Опубликован</SelectItem>
                  <SelectItem value="archived">Архивирован</SelectItem>
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
        <CardHeader>
          <CardTitle>Товары</CardTitle>
          <CardDescription>Найдено {pagination.total} товаров</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Товар</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Бренд</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>Остаток</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.thumbnail ? (
                          <Image
                            src={product.thumbnail}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.sku && `SKU: ${product.sku}`}
                          </div>
                          {product.is_featured && (
                            <Badge variant="secondary" className="mt-1">
                              <Star className="h-3 w-3 mr-1" />
                              Рекомендуемый
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{product.categories?.name || "—"}</TableCell>
                      <TableCell>{product.brands?.name || "—"}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatPrice(
                              product.base_price,
                              product.currencies,
                            )}
                          </div>
                          {product.sale_price && (
                            <div className="text-sm text-green-600">
                              Скидка:{" "}
                              {formatPrice(
                                product.sale_price,
                                product.currencies,
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {product.inventory_quantity} шт.
                          </div>
                          {getStockStatus(product.inventory_quantity)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(product.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Действия</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingProduct(product);
                                setIsFormOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Просмотр
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600"
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

              {/* Пагинация */}
              {pagination.total > pagination.limit && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Показано {pagination.offset + 1}-
                    {Math.min(
                      pagination.offset + pagination.limit,
                      pagination.total,
                    )}{" "}
                    из {pagination.total}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(
                          Math.max(0, pagination.offset - pagination.limit),
                        )
                      }
                      disabled={pagination.offset === 0}
                    >
                      Предыдущая
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(pagination.offset + pagination.limit)
                      }
                      disabled={!pagination.hasMore}
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
