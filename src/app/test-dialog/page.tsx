"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/enhanced-dialog";
import { BrandForm } from "@/components/admin/BrandForm";
import { CollectionForm } from "@/components/admin/CollectionForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TestDialogPage() {
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);
  const [simpleDialogOpen, setSimpleDialogOpen] = useState(false);
  const [largeDialogOpen, setLargeDialogOpen] = useState(false);

  const mockBrands = [
    {
      id: "1",
      name: "Apple",
      slug: "apple",
      is_active: true,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      description: undefined,
      logo_url: undefined,
      website: undefined,
      country: undefined,
      meta_title: undefined,
      meta_description: undefined,
    },
    {
      id: "2",
      name: "Samsung",
      slug: "samsung",
      is_active: true,
      sort_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      description: undefined,
      logo_url: undefined,
      website: undefined,
      country: undefined,
      meta_title: undefined,
      meta_description: undefined,
    },
  ];

  const mockCategories = [
    {
      id: "1",
      name: "Смартфоны",
      slug: "smartphones",
      level: 1,
      is_active: true,
      sort_order: 1,
      path: "smartphones",
      description: undefined,
      parent_id: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      children: [],
    },
    {
      id: "2",
      name: "Ноутбуки",
      slug: "laptops",
      level: 1,
      is_active: true,
      sort_order: 2,
      path: "laptops",
      description: undefined,
      parent_id: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      children: [],
    },
  ];

  const handleBrandSubmit = (data: any) => {
    console.log("Brand data:", data);
    setBrandDialogOpen(false);
  };

  const handleCollectionSubmit = (data: any) => {
    console.log("Collection data:", data);
    setCollectionDialogOpen(false);
  };

  // Генерируем длинный контент для тестирования прокрутки
  const generateLongContent = () => {
    return Array.from({ length: 50 }, (_, i) => (
      <div key={i} className="space-y-2">
        <Label htmlFor={`field-${i}`}>Поле {i + 1}</Label>
        <Input id={`field-${i}`} placeholder={`Введите значение ${i + 1}`} />
      </div>
    ));
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Тестирование модальных окон</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Тест формы бренда */}
        <Dialog open={brandDialogOpen} onOpenChange={setBrandDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-20">
              Форма бренда
              <br />
              <small className="text-muted-foreground">
                Size: lg, scrollable
              </small>
            </Button>
          </DialogTrigger>
          <DialogContent size="lg" scrollable>
            <DialogHeader className="dialog-header-sticky">
              <DialogTitle>Создать новый бренд</DialogTitle>
              <DialogDescription>
                Заполните информацию о новом бренде
              </DialogDescription>
            </DialogHeader>
            <BrandForm onSubmit={handleBrandSubmit} isSubmitting={false} />
          </DialogContent>
        </Dialog>

        {/* Тест формы коллекции */}
        <Dialog
          open={collectionDialogOpen}
          onOpenChange={setCollectionDialogOpen}
        >
          <DialogTrigger asChild>
            <Button variant="outline" className="h-20">
              Форма коллекции
              <br />
              <small className="text-muted-foreground">
                Size: lg, scrollable
              </small>
            </Button>
          </DialogTrigger>
          <DialogContent size="lg" scrollable>
            <DialogHeader className="dialog-header-sticky">
              <DialogTitle>Создать новую коллекцию</DialogTitle>
              <DialogDescription>
                Заполните информацию о новой коллекции
              </DialogDescription>
            </DialogHeader>
            <CollectionForm
              brands={mockBrands}
              categories={mockCategories}
              onSubmit={handleCollectionSubmit}
              isSubmitting={false}
            />
          </DialogContent>
        </Dialog>

        {/* Простой диалог */}
        <Dialog open={simpleDialogOpen} onOpenChange={setSimpleDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-20">
              Простой диалог
              <br />
              <small className="text-muted-foreground">Size: default</small>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader className="dialog-header-sticky">
              <DialogTitle>Простое модальное окно</DialogTitle>
              <DialogDescription>
                Это простое модальное окно без прокрутки
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="simple-name">Название</Label>
                <Input id="simple-name" placeholder="Введите название" />
              </div>
              <div>
                <Label htmlFor="simple-desc">Описание</Label>
                <Textarea id="simple-desc" placeholder="Введите описание" />
              </div>
              <Button className="w-full">Сохранить</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Большой диалог с прокруткой */}
        <Dialog open={largeDialogOpen} onOpenChange={setLargeDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-20">
              Большой диалог
              <br />
              <small className="text-muted-foreground">
                Size: xl, scrollable
              </small>
            </Button>
          </DialogTrigger>
          <DialogContent size="xl" scrollable>
            <DialogHeader className="dialog-header-sticky">
              <DialogTitle>Большое модальное окно с прокруткой</DialogTitle>
              <DialogDescription>
                Это модальное окно содержит много полей для тестирования
                прокрутки
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {generateLongContent()}
              <div className="flex justify-end space-x-2 pt-4 dialog-footer-sticky">
                <Button
                  variant="outline"
                  onClick={() => setLargeDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button onClick={() => setLargeDialogOpen(false)}>
                  Сохранить
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold mb-2">
          Инструкции по тестированию:
        </h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>
            Проверьте, что модальные окна появляются плавно по центру экрана
          </li>
          <li>
            Убедитесь, что формы не выходят за границы экрана сверху и снизу
          </li>
          <li>Проверьте работу прокрутки в длинных формах</li>
          <li>
            Протестируйте на разных размерах экрана (мобильный, планшет,
            десктоп)
          </li>
          <li>
            Убедитесь, что анимация появления/исчезания работает корректно
          </li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100">
          Размеры диалогов:
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 mt-1">
          <li>
            <strong>sm:</strong> max-w-sm, max-h-[80vh]
          </li>
          <li>
            <strong>default:</strong> max-w-lg, max-h-[80vh]
          </li>
          <li>
            <strong>lg:</strong> max-w-2xl, max-h-[80vh]
          </li>
          <li>
            <strong>xl:</strong> max-w-4xl, max-h-[80vh], w-[85vw]
          </li>
          <li>
            <strong>full:</strong> max-w-6xl, max-h-[80vh], w-[90vw]
          </li>
        </ul>
      </div>
    </div>
  );
}
