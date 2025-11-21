"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle, Loader2, Eye, Check } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface PriceUpdateResult {
  updated: Array<{
    id: string;
    name: string;
    oldPrice: number | null;
    newPrice: number;
    foundBy?: 'sku' | 'name'; // По какому полю был найден товар
  }>;
  notFound: Array<{
    name: string;
    price: number;
  }>;
  errors: Array<{
    name: string;
    error: string;
  }>;
  skipped?: Array<{
    id: string;
    name: string;
    price: number;
    reason: string;
  }>;
}

interface Summary {
  total: number;
  updated: number;
  notFound: number;
  errors: number;
  skipped?: number;
}

export default function BulkPriceUpdateClient() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [results, setResults] = useState<PriceUpdateResult | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isPreview, setIsPreview] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResults(null);
      setSummary(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Выберите файл для загрузки");
      return;
    }

    setIsUploading(true);
    setResults(null);
    setSummary(null);
    setIsPreview(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", "preview");

      const response = await fetch("/api/admin/products/bulk-update-prices", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка при анализе файла");
      }

      setResults(data.results);
      setSummary(data.summary);
      setIsPreview(data.mode === "preview");
      
      // Автоматически выбираем все товары для обновления
      if (data.results.updated) {
        setSelectedIds(new Set(data.results.updated.map((item: { id: string }) => item.id)));
      }

      toast.success("Файл проанализирован. Проверьте предпросмотр изменений.");
    } catch (error) {
      console.error("Error analyzing file:", error);
      toast.error(
        error instanceof Error ? error.message : "Ошибка при анализе файла"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmUpdate = async () => {
    if (!file) {
      return;
    }

    setIsUpdating(true);
    setConfirmDialogOpen(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", "update");
      formData.append("selectedIds", JSON.stringify(Array.from(selectedIds)));

      const response = await fetch("/api/admin/products/bulk-update-prices", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка при обновлении цен");
      }

      setResults(data.results);
      setSummary(data.summary);
      setIsPreview(false);

      if (data.summary.updated > 0) {
        toast.success(`Успешно обновлено ${data.summary.updated} товаров`);
      }

      if (data.summary.notFound > 0) {
        toast.warning(`Не найдено ${data.summary.notFound} товаров`);
      }

      if (data.summary.errors > 0) {
        toast.error(`Ошибок при обновлении: ${data.summary.errors}`);
      }
    } catch (error) {
      console.error("Error updating prices:", error);
      toast.error(
        error instanceof Error ? error.message : "Ошибка при обновлении цен"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResults(null);
    setSummary(null);
    setIsPreview(true);
    setConfirmDialogOpen(false);
    setSelectedIds(new Set());
  };

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (results?.updated) {
      if (selectedIds.size === results.updated.length) {
        // Снимаем выбор со всех
        setSelectedIds(new Set());
      } else {
        // Выбираем все
        setSelectedIds(new Set(results.updated.map(item => item.id)));
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Загрузка файла с ценами</CardTitle>
          <CardDescription>
            Загрузите CSV файл с двумя колонками: название товара и цена.
            Товары будут найдены по точному совпадению названия (без учета регистра).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            {isDragActive ? (
              <p className="text-primary font-medium">Отпустите файл здесь</p>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Перетащите файл сюда или нажмите для выбора
                </p>
                <p className="text-xs text-muted-foreground">
                  Поддерживаются форматы: CSV, XLS, XLSX
                </p>
              </div>
            )}
          </div>

          {file && (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <span className="font-medium">{file.name}</span>
                <span className="text-sm text-muted-foreground">
                  ({(file.size / 1024).toFixed(2)} KB)
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Удалить
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleAnalyze}
              disabled={!file || isUploading || isUpdating}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Анализ...
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Проанализировать файл
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isPreview ? "Предпросмотр изменений" : "Результаты обновления"}
            </CardTitle>
            <CardDescription>
              {isPreview
                ? "Проверьте изменения перед подтверждением. Цены еще не обновлены."
                : "Цены успешно обновлены."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{summary.total}</div>
                <div className="text-sm text-muted-foreground">Всего строк</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {summary.updated}
                </div>
                <div className="text-sm text-muted-foreground">К обновлению</div>
              </div>
              {summary.skipped !== undefined && summary.skipped > 0 && (
                <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {summary.skipped}
                  </div>
                  <div className="text-sm text-muted-foreground">Пропущено</div>
                </div>
              )}
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {summary.notFound}
                </div>
                <div className="text-sm text-muted-foreground">Не найдено</div>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {summary.errors}
                </div>
                <div className="text-sm text-muted-foreground">Ошибок</div>
              </div>
            </div>

            {results && (
              <div className="space-y-4">
                {results.updated.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        Товары к обновлению ({results.updated.length})
                      </h3>
                      {isPreview && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAll}
                        >
                          {selectedIds.size === results.updated.length
                            ? "Снять выбор"
                            : "Выбрать все"}
                        </Button>
                      )}
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {results.updated.map((item, idx) => {
                        const isSelected = selectedIds.has(item.id);
                        return (
                          <div
                            key={idx}
                            className={`p-2 rounded text-sm flex items-center gap-2 ${
                              isSelected
                                ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
                                : "bg-muted border border-transparent"
                            }`}
                          >
                            {isPreview && (
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleToggleSelect(item.id)}
                              />
                            )}
                            <div className="flex-1 flex items-center justify-between">
                              <div>
                                <span className="font-medium">{item.name}</span>
                                {item.foundBy && (
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    (найден по {item.foundBy === 'sku' ? 'артикулу' : 'названию'})
                                  </span>
                                )}
                              </div>
                              <span className="text-muted-foreground">
                                {item.oldPrice !== null
                                  ? `${item.oldPrice} → ${item.newPrice}`
                                  : `новая цена: ${item.newPrice}`}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {results.skipped && results.skipped.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-gray-600" />
                      Пропущено ({results.skipped.length})
                    </h3>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {results.skipped.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2 bg-gray-50 dark:bg-gray-950 rounded text-sm"
                        >
                          <span className="font-medium">{item.name}</span>
                          {" - "}
                          <span className="text-muted-foreground">
                            {item.reason} (цена: {item.price})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.notFound.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      Товары не найдены ({results.notFound.length})
                    </h3>
                    <Alert>
                      <AlertDescription>
                        <div className="max-h-60 overflow-y-auto space-y-1">
                          {results.notFound.map((item, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="font-medium">{item.name}</span>
                              {" - "}
                              <span className="text-muted-foreground">
                                цена: {item.price}
                              </span>
                            </div>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {results.errors.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      Ошибки при обновлении ({results.errors.length})
                    </h3>
                    <Alert variant="destructive">
                      <AlertDescription>
                        <div className="max-h-60 overflow-y-auto space-y-1">
                          {results.errors.map((item, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="font-medium">{item.name}</span>
                              {" - "}
                              <span>{item.error}</span>
                            </div>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            )}

            {isPreview && summary.updated > 0 && (
              <div className="pt-4 border-t space-y-2">
                <div className="text-sm text-muted-foreground">
                  Выбрано для обновления: {selectedIds.size} из {summary.updated}
                </div>
                <Button
                  onClick={() => setConfirmDialogOpen(true)}
                  disabled={isUpdating || selectedIds.size === 0}
                  className="w-full"
                  size="lg"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Обновление...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Подтвердить и обновить выбранные цены ({selectedIds.size})
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтвердите обновление цен</AlertDialogTitle>
            <AlertDialogDescription>
              Вы собираетесь обновить цены для {selectedIds.size} выбранных товаров из {summary?.updated || 0} найденных.
              {summary && summary.notFound > 0 && (
                <span className="block mt-2 text-yellow-600 dark:text-yellow-400">
                  Внимание: {summary.notFound} товаров не будут обновлены, так как не найдены в базе.
                </span>
              )}
              {summary && summary.skipped && summary.skipped > 0 && (
                <span className="block mt-2 text-gray-600 dark:text-gray-400">
                  {summary.skipped} товаров будут пропущены (цена не изменилась или не выбраны).
                </span>
              )}
              Это действие нельзя отменить. Продолжить?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUpdate}>
              Подтвердить обновление
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

