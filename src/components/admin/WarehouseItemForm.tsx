"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface WarehouseItem {
  id?: string;
  product_id?: string;
  location?: string;
  quantity?: number;
  reserved_quantity?: number;
  status?: "available" | "in_use" | "maintenance" | "reserved" | "sold" | "written_off";
  assigned_to?: string;
  notes?: string;
}

interface WarehouseItemFormProps {
  onSubmit: (data: any) => void;
  initialData?: WarehouseItem | null;
  isSubmitting?: boolean;
  users?: Array<{ id: string; first_name?: string; last_name?: string; email?: string }>;
  products?: Array<{ id: string; name: string; sku?: string }>;
}

const STATUS_OPTIONS = [
  { value: "available", label: "Доступно" },
  { value: "in_use", label: "В использовании" },
  { value: "maintenance", label: "На обслуживании" },
  { value: "reserved", label: "Зарезервировано" },
  { value: "sold", label: "Продано" },
  { value: "written_off", label: "Списано" },
];

export function WarehouseItemForm({
  onSubmit,
  initialData,
  isSubmitting = false,
  users = [],
  products = [],
}: WarehouseItemFormProps) {
  const [formData, setFormData] = useState<WarehouseItem>({
    product_id: "",
    location: "",
    quantity: 0,
    reserved_quantity: 0,
    status: "available",
    assigned_to: "",
    notes: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        product_id: initialData.product_id || "",
        location: initialData.location || "",
        quantity: initialData.quantity || 0,
        reserved_quantity: initialData.reserved_quantity || 0,
        status: initialData.status || "available",
        assigned_to: initialData.assigned_to || "",
        notes: initialData.notes || "",
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация
    if (!formData.product_id || !formData.location || !formData.status) {
      alert("Пожалуйста, заполните все обязательные поля");
      return;
    }

    // Подготовка данных для отправки
    const submitData = {
      product_id: formData.product_id,
      location: formData.location,
      quantity: Number(formData.quantity) || 0,
      reserved_quantity: Number(formData.reserved_quantity) || 0,
      status: formData.status,
      assigned_to: formData.assigned_to || null,
      notes: formData.notes || null,
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Товар */}
        <div className="md:col-span-2">
          <Label htmlFor="product_id">
            Товар <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.product_id}
            onValueChange={(value) => setFormData({ ...formData, product_id: value })}
            disabled={!!initialData?.id} // Нельзя менять товар при редактировании
          >
            <SelectTrigger id="product_id">
              <SelectValue placeholder="Выберите товар" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} {product.sku && `(${product.sku})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {products.length === 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Загрузка товаров...
            </p>
          )}
        </div>

        {/* Местоположение */}
        <div>
          <Label htmlFor="location">
            Местоположение <span className="text-destructive">*</span>
          </Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
            placeholder="Например: Офис, Склад, У клиента"
          />
        </div>

        {/* Количество */}
        <div>
          <Label htmlFor="quantity">
            Количество <span className="text-destructive">*</span>
          </Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: Number(e.target.value) || 0 })
            }
            required
            placeholder="0"
          />
        </div>

        {/* Зарезервированное количество */}
        <div>
          <Label htmlFor="reserved_quantity">Зарезервировано</Label>
          <Input
            id="reserved_quantity"
            type="number"
            min="0"
            value={formData.reserved_quantity}
            onChange={(e) =>
              setFormData({
                ...formData,
                reserved_quantity: Number(e.target.value) || 0,
              })
            }
            placeholder="0"
          />
        </div>

        {/* Статус */}
        <div>
          <Label htmlFor="status">
            Статус <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.status}
            onValueChange={(value: any) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Назначено */}
        <div>
          <Label htmlFor="assigned_to">Назначено</Label>
          <Select
            value={formData.assigned_to || "unassigned"}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                assigned_to: value === "unassigned" ? "" : value,
              })
            }
          >
            <SelectTrigger id="assigned_to">
              <SelectValue placeholder="Не назначено" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Не назначено</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.first_name || user.last_name
                    ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                    : user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Примечания */}
        <div className="md:col-span-2">
          <Label htmlFor="notes">Примечания</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Дополнительные примечания"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Сохранение...
            </>
          ) : initialData ? (
            "Обновить"
          ) : (
            "Создать"
          )}
        </Button>
      </div>
    </form>
  );
}
