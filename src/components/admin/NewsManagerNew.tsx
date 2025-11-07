"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  EyeOff,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { NewsFormNew } from "./NewsFormNew";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  content?: string;
  date: string;
  category: string;
  author?: string;
  images?: string[] | null;
  tags?: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Filters {
  search: string;
  category: string;
  is_active: string;
}

export function NewsManagerNew() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    category: "all",
    is_active: "all",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Загрузка новостей
  const loadNews = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.category !== "all") params.append("category", filters.category);
      if (filters.is_active !== "all")
        params.append("is_active", filters.is_active);

      const response = await fetch(
        `/api/admin/news?${params.toString()}`
      );
      if (!response.ok) throw new Error("Failed to load news");
      const data = await response.json();
      setNews(data);
    } catch (error) {
      console.error("Error loading news:", error);
      toast.error("Ошибка при загрузке новостей");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleCloseDialog = useCallback(() => {
    setIsFormOpen(false);
    setEditingNews(null);
    setDialogKey((prev) => prev + 1);
  }, []);

  const handleCreateNews = async (data: globalThis.FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/news", {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка при создании новости");
      }

      const createdNews = await response.json();
      
      // Добавляем новую новость в начало списка
      setNews((prevNews) => [createdNews, ...prevNews]);
      
      toast.success("Новость успешно создана");
      handleCloseDialog();
    } catch (error) {
      console.error("Error creating news:", error);
      toast.error(
        error instanceof Error ? error.message : "Ошибка при создании новости"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateNews = async (data: globalThis.FormData) => {
    if (!editingNews?.id) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/news/${editingNews.id}`, {
        method: "PUT",
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка при обновлении новости");
      }

      const updatedNews = await response.json();
      
      // Обновляем новость в списке
      setNews((prevNews) =>
        prevNews.map((item) =>
          item.id === updatedNews.id ? updatedNews : item
        )
      );
      
      toast.success("Новость успешно обновлена");
      handleCloseDialog();
    } catch (error) {
      console.error("Error updating news:", error);
      toast.error(
        error instanceof Error ? error.message : "Ошибка при обновлении новости"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту новость?")) return;

    // Оптимистичное удаление из UI
    const deletedNews = news.find((item) => item.id === id);
    setNews((prevNews) => prevNews.filter((item) => item.id !== id));

    try {
      const response = await fetch(`/api/admin/news/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete news");
      }

      toast.success("Новость удалена");
    } catch (error) {
      // Откатываем удаление при ошибке
      if (deletedNews) {
        setNews((prevNews) => [...prevNews, deletedNews]);
      }
      
      console.error("Error deleting news:", error);
      toast.error("Ошибка при удалении новости");
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    // Оптимистичное обновление UI
    const newStatus = !currentStatus;
    setNews((prevNews) =>
      prevNews.map((item) =>
        item.id === id ? { ...item, is_active: newStatus } : item
      )
    );

    try {
      const response = await fetch(`/api/admin/news/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to toggle status");
      }

      const updatedNews = await response.json();
      
      // Обновляем состояние с данными с сервера
      setNews((prevNews) =>
        prevNews.map((item) =>
          item.id === id ? updatedNews : item
        )
      );

      toast.success(
        newStatus ? "Новость активирована" : "Новость деактивирована"
      );
    } catch (error) {
      // Откатываем изменения при ошибке
      setNews((prevNews) =>
        prevNews.map((item) =>
          item.id === id ? { ...item, is_active: currentStatus } : item
        )
      );
      
      console.error("Error toggling status:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Ошибка при изменении статуса"
      );
    }
  };

  // Получаем уникальные категории для фильтра
  const categories = Array.from(
    new Set(news.map((item) => item.category))
  ).sort();

  // Фильтруем новости
  const filteredNews = news.filter((item) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !item.title.toLowerCase().includes(searchLower) &&
        !item.description.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    if (filters.category !== "all" && item.category !== filters.category) {
      return false;
    }
    if (filters.is_active !== "all") {
      const isActive = filters.is_active === "true";
      if (item.is_active !== isActive) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка */}
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
              onClick={() => setEditingNews(null)}
              className="enhanced-shadow"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить новость
            </Button>
          </DialogTrigger>
          <DialogContent size="xl" scrollable={true}>
            <DialogHeader>
              <DialogTitle>
                {editingNews ? "Редактировать новость" : "Добавить новость"}
              </DialogTitle>
              <DialogDescription>
                {editingNews
                  ? "Обновите информацию о новости"
                  : "Заполните информацию о новой новости"}
              </DialogDescription>
            </DialogHeader>
            <NewsFormNew
              key={editingNews?.id || "new"}
              onSubmit={editingNews ? handleUpdateNews : handleCreateNews}
              initialData={editingNews}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего новостей</CardTitle>
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{news.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Всего в базе данных
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные</CardTitle>
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {news.filter((n) => n.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Опубликованных новостей
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Неактивные</CardTitle>
            <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <EyeOff className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {news.filter((n) => !n.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Скрытых новостей
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Фильтры и поиск</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search">Поиск</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Поиск по заголовку, описанию..."
                  className="pl-8"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Категория</Label>
              <select
                id="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                <option value="all">Все категории</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="status">Статус</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={filters.is_active}
                onChange={(e) => handleFilterChange("is_active", e.target.value)}
              >
                <option value="all">Все</option>
                <option value="true">Активные</option>
                <option value="false">Неактивные</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблица новостей */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Список новостей</CardTitle>
          <CardDescription>
            Всего найдено: {filteredNews.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Новости не найдены
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Изображение</TableHead>
                    <TableHead className="w-[300px] max-w-[300px]">Заголовок</TableHead>
                    <TableHead className="w-[150px]">Категория</TableHead>
                    <TableHead className="w-[120px]">Дата</TableHead>
                    <TableHead className="w-[150px]">Автор</TableHead>
                    <TableHead className="w-[100px]">Статус</TableHead>
                    <TableHead className="text-right w-[150px]">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNews.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.images && item.images.length > 0 ? (
                          <div className="relative w-16 h-16 rounded-md overflow-hidden">
                            <Image
                              src={item.images[0]}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center">
                            <FileText className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <div className="font-medium line-clamp-2">{item.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {item.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(item.date).toLocaleDateString("ru-RU")}
                      </TableCell>
                      <TableCell>{item.author || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={item.is_active ? "default" : "secondary"}
                        >
                          {item.is_active ? "Активна" : "Неактивна"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleToggleActive(item.id, item.is_active)
                            }
                            title={
                              item.is_active
                                ? "Деактивировать"
                                : "Активировать"
                            }
                          >
                            {item.is_active ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingNews(item);
                              setIsFormOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteNews(item.id)}
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
    </div>
  );
}

