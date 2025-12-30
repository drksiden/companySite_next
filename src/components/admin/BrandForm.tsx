"use client";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Brand } from "@/lib/services/admin/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(2, "Название обязательно"),
  slug: z
    .string()
    .min(2, "Slug обязателен")
    .regex(/^[a-z0-9\-]+$/, "Только строчные буквы, цифры и дефисы"),
  description: z.string().optional().nullable(),
  logo_url: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  is_active: z.boolean(),
  sort_order: z.coerce.number().int().min(0),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

interface BrandFormProps {
  initialData?: Partial<Brand>;
  onSubmit: (data: FormData) => void;
  isSubmitting?: boolean;
  onClose?: () => void;
}

export function BrandForm({
  initialData,
  onSubmit,
  isSubmitting,
  onClose,
}: BrandFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      description: initialData?.description ?? "",
      logo_url: initialData?.logo_url ?? "",
      website: initialData?.website ?? "",
      country: initialData?.country ?? "",
      is_active: initialData?.is_active ?? true,
      sort_order: initialData?.sort_order ?? 0,
      meta_title: initialData?.meta_title ?? "",
      meta_description: initialData?.meta_description ?? "",
    },
  });

  const handleSubmit: SubmitHandler<FormData> = (values) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="h-full flex flex-col"
      >
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
          {/* Основная информация */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="font-medium text-sm">Название бренда</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Введите название бренда"
                    className="h-10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="font-medium text-sm">Slug (URL)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="example-brand"
                    className="h-10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="font-medium text-sm">Описание</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    value={field.value ?? ""} 
                    placeholder="Краткое описание бренда"
                    className="h-10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Внешние ссылки */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground px-1">
                Внешние ссылки
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-sm">URL логотипа</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        value={field.value ?? ""} 
                        placeholder="https://example.com/logo.png"
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-sm">Официальный сайт</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        value={field.value ?? ""} 
                        placeholder="https://example.com"
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="font-medium text-sm">Страна происхождения</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      value={field.value ?? ""} 
                      placeholder="Россия, США, Германия и т.д."
                      className="h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Настройки отображения */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground px-1">
                Настройки отображения
              </h3>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-0.5"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-medium text-sm">
                        Бренд активен и отображается на сайте
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sort_order"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-sm">Порядок сортировки</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        placeholder="0"
                        className="h-10"
                        min="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* SEO настройки */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground px-1">
                SEO настройки
              </h3>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="meta_title"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-sm">Meta Title</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        value={field.value ?? ""} 
                        placeholder="Уникальный заголовок для поисковиков"
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meta_description"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-sm">Meta Description</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        value={field.value ?? ""} 
                        placeholder="Краткое описание для поисковиков (до 160 символов)"
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex-shrink-0 px-8 pb-8 pt-6 border-t bg-background">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11"
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="flex-1 h-11"
            >
              {isSubmitting ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}