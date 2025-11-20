"use client";

import React, { useState, useEffect, useCallback } from "react";
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
} from "@/components/ui/enhanced-dialog";
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
  Package,
  AlertCircle,
  Loader2,
  MapPin,
  User,
  Calendar,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "./TableSkeleton";
import { ErrorDisplay } from "./ErrorDisplay";
import { WarehouseItemForm } from "./WarehouseItemForm";

interface WarehouseItem {
  id: string;
  product_id: string;
  location: string;
  quantity: number;
  reserved_quantity: number;
  status: "available" | "in_use" | "maintenance" | "reserved" | "sold" | "written_off";
  assigned_to?: string;
  notes?: string;
  last_counted_at?: string;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    sku?: string;
    thumbnail?: string;
    images?: string[];
    category_id?: string;
    brand_id?: string;
    collection_id?: string;
    inventory_quantity?: number;
    track_inventory?: boolean;
    category?: { name: string };
    brand?: { name: string };
  };
  assigned_user?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

interface Filters {
  search: string;
  location: string;
  status: string;
  category: string;
  assigned_to: string;
}

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  in_use: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  maintenance: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  reserved: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  sold: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  written_off: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  available: "Доступно",
  in_use: "В использовании",
  maintenance: "На обслуживании",
  reserved: "Зарезервировано",
  sold: "Продано",
  written_off: "Списано",
};

export function WarehouseManagerClient() {
  const [items, setItems] = useState<WarehouseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<WarehouseItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    location: "all",
    status: "all",
    category: "all",
    assigned_to: "all",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<Array<{ id: string; first_name?: string; last_name?: string; email?: string }>>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string; sku?: string }>>([]);
  const [categoriesList, setCategoriesList] = useState<Array<{ id: string; name: string }>>([]);

  // Загрузка пользователей для фильтра
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch("/api/admin/users");
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error("Error loading users:", error);
      }
    };
    loadUsers();
  }, []);

  // Загрузка категорий для фильтра
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/admin/categories?flat=true");
        if (response.ok) {
          const data = await response.json();
          // API возвращает объект с полем categories
          const categoriesArray = Array.isArray(data.categories) 
            ? data.categories 
            : Array.isArray(data) 
            ? data 
            : [];
          setCategoriesList(categoriesArray);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
        setCategoriesList([]); // Устанавливаем пустой массив при ошибке
      }
    };
    loadCategories();
  }, []);

  // Загрузка товаров для выбора
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch("/api/admin/products?limit=1000");
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error("Error loading products:", error);
      }
    };
    loadProducts();
  }, []);

  // Загрузка позиций склада
  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.location !== "all") params.append("location", filters.location);
      if (filters.status !== "all") params.append("status", filters.status);
      if (filters.category !== "all") params.append("category", filters.category);
      if (filters.assigned_to !== "all") params.append("assigned_to", filters.assigned_to);

      const response = await fetch(`/api/admin/warehouse?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load warehouse items");
      }

      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error("Error loading warehouse items:", error);
      setError(
        error instanceof Error ? error.message : "Ошибка при загрузке позиций склада"
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleCreateItem = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/warehouse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка при создании позиции");
      }

      toast.success("Позиция склада успешно создана");
      handleCloseDialog();
      loadItems();
    } catch (error) {
      console.error("Error creating warehouse item:", error);
      toast.error(
        error instanceof Error ? error.message : "Ошибка при создании позиции склада"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateItem = async (data: any) => {
    if (!editingItem) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/warehouse/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка при обновлении позиции");
      }

      toast.success("Позиция склада успешно обновлена");
      handleCloseDialog();
      loadItems();
    } catch (error) {
      console.error("Error updating warehouse item:", error);
      toast.error(
        error instanceof Error ? error.message : "Ошибка при обновлении позиции склада"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/warehouse/${itemToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      toast.success("Позиция склада удалена");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setSelectedItems((prev) => {
        const next = new Set(prev);
        next.delete(itemToDelete);
        return next;
      });
      loadItems();
    } catch (error) {
      console.error("Error deleting warehouse item:", error);
      toast.error("Ошибка при удалении позиции склада");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Функции для работы с выделением
  const handleSelectItem = (itemId: string, checked: boolean) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(itemId);
      } else {
        next.delete(itemId);
      }
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(items.map((item) => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;

    setIsSubmitting(true);
    try {
      const itemIds = Array.from(selectedItems);
      let successCount = 0;
      let errorCount = 0;

      for (const itemId of itemIds) {
        try {
          const response = await fetch(`/api/admin/warehouse/${itemId}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete item");
          }
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`Error deleting item ${itemId}:`, error);
        }
      }

      if (successCount > 0) {
        toast.success(`Успешно удалено позиций: ${successCount}`);
      }
      if (errorCount > 0) {
        toast.error(`Ошибок при удалении: ${errorCount}`);
      }

      setBulkDeleteDialogOpen(false);
      setSelectedItems(new Set());
      loadItems();
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast.error("Ошибка при массовом удалении позиций");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAllSelected = items.length > 0 && selectedItems.size === items.length;

  const handleCloseDialog = useCallback(() => {
    setIsFormOpen(false);
    setEditingItem(null);
    setDialogKey((prev) => prev + 1);
  }, []);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Получаем уникальные значения для фильтров
  const locations = Array.from(new Set(items.map((item) => item.location))).sort();

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-muted-foreground mt-1">
            Учет оборудования в офисе и на складе
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
            <Button onClick={() => setEditingItem(null)} className="enhanced-shadow">
              <Plus className="h-4 w-4 mr-2" />
              Добавить позицию
            </Button>
          </DialogTrigger>
          <DialogContent size="xl" scrollable={true}>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Редактировать позицию" : "Добавить позицию"}
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Обновите информацию о позиции склада"
                  : "Заполните информацию о новой позиции склада"}
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 pb-6">
              <WarehouseItemForm
                key={editingItem?.id || "new"}
                onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
                initialData={editingItem}
                isSubmitting={isSubmitting}
                users={users}
                products={products}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Фильтры */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Фильтры и поиск</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search">Поиск</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Поиск по названию, модели, серийному номеру..."
                  className="pl-8"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Местоположение</Label>
              <Select
                value={filters.location}
                onValueChange={(value) => handleFilterChange("location", value)}
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder="Все" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Статус</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Все" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Категория</Label>
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilterChange("category", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Все" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  {categoriesList.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблица позиций склада */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex-1">
            <CardTitle>Список позиций</CardTitle>
            <CardDescription>
              Всего найдено: {items.length}
              {selectedItems.size > 0 && (
                <span className="ml-2 text-primary font-semibold">
                  (Выбрано: {selectedItems.size})
                </span>
              )}
            </CardDescription>
          </div>
          {selectedItems.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteDialogOpen(true)}
              disabled={isSubmitting}
              className="transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Удаление...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить ({selectedItems.size})
                </>
              )}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={5} columns={8} />
          ) : error ? (
            <ErrorDisplay
              title="Ошибка загрузки позиций склада"
              message={error}
              onRetry={() => loadItems()}
              variant="card"
            />
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Позиции склада не найдены</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={(checked) => handleSelectAll(checked === true)}
                        aria-label="Выбрать все"
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </TableHead>
                    <TableHead>Товар</TableHead>
                    <TableHead>Количество</TableHead>
                    <TableHead>Местоположение</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Назначено</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow
                      key={item.id}
                      className={selectedItems.has(item.id) ? "bg-muted/50" : ""}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={(checked) =>
                            handleSelectItem(item.id, checked === true)
                          }
                          aria-label={`Выбрать ${item.product?.name || item.id}`}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{item.product?.name || "Товар не найден"}</div>
                        {item.product?.sku && (
                          <div className="text-xs text-muted-foreground font-mono">
                            SKU: {item.product.sku}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {item.product?.category && (
                            <Badge variant="outline" className="text-xs">
                              {item.product.category.name}
                            </Badge>
                          )}
                          {item.product?.brand && (
                            <Badge variant="outline" className="text-xs">
                              {item.product.brand.name}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {item.quantity}
                          {item.reserved_quantity > 0 && (
                            <span className="text-muted-foreground ml-1">
                              (резерв: {item.reserved_quantity})
                            </span>
                          )}
                        </div>
                        {item.product?.inventory_quantity !== undefined && (
                          <div className="text-xs text-muted-foreground">
                            Всего: {item.product.inventory_quantity}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {item.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={STATUS_COLORS[item.status] || ""}
                        >
                          {STATUS_LABELS[item.status] || item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.assigned_user ? (
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {item.assigned_user.first_name || item.assigned_user.last_name
                                ? `${item.assigned_user.first_name || ""} ${item.assigned_user.last_name || ""}`.trim()
                                : item.assigned_user.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingItem(item);
                              setIsFormOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Dialog for Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить позицию?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить эту позицию склада? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Удаление...
                </>
              ) : (
                "Удалить"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog for Bulk Delete Confirmation */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить выбранные позиции?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить {selectedItems.size} позицию(ий)? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBulkDeleteDialogOpen(false)}>
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Удаление...
                </>
              ) : (
                `Удалить (${selectedItems.size})`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

