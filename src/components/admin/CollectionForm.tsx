"use client";

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Collection } from '@/lib/services/collection';
import { Brand } from '@/types/catalog';
import { Category } from '@/types/catalog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(2, 'Название обязательно'),
  slug: z.string().min(2, 'Slug обязателен').regex(/^[a-z0-9\-]+$/, 'Только строчные буквы, цифры и дефисы'),
  description: z.string().optional().nullable(),
  brand_id: z.string().optional().nullable(),
  category_id: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  is_active: z.boolean(),
  sort_order: z.coerce.number().int().min(0),
});

type FormData = z.infer<typeof formSchema>;

interface CollectionFormProps {
  initialData?: Partial<Collection>;
  brands: Brand[];
  categories: Category[];
  onSubmit: (data: FormData) => void;
  isSubmitting?: boolean;
}

export function CollectionForm({ initialData, brands, categories, onSubmit, isSubmitting }: CollectionFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      slug: initialData?.slug ?? '',
      description: initialData?.description ?? '',
      brand_id: initialData?.brand_id ?? null,
      category_id: initialData?.category_id ?? null,
      image_url: initialData?.image_url ?? '',
      is_active: initialData?.is_active ?? true,
      sort_order: initialData?.sort_order ?? 0,
    },
  });

  const handleSubmit: SubmitHandler<FormData> = (values) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Название</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="slug" render={({ field }) => (
          <FormItem>
            <FormLabel>Slug</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Описание</FormLabel>
            <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="brand_id" render={({ field }) => (
          <FormItem>
            <FormLabel>Бренд</FormLabel>
            <Select onValueChange={v => field.onChange(v === 'none' ? null : v)} value={field.value ?? 'none'}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите бренд" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">Без бренда</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="category_id" render={({ field }) => (
          <FormItem>
            <FormLabel>Категория</FormLabel>
            <Select onValueChange={v => field.onChange(v === 'none' ? null : v)} value={field.value ?? 'none'}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">Без категории</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="image_url" render={({ field }) => (
          <FormItem>
            <FormLabel>Изображение (URL)</FormLabel>
            <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="is_active" render={({ field }) => (
          <FormItem>
            <FormLabel>Активна</FormLabel>
            <FormControl><Checkbox checked={!!field.value} onCheckedChange={field.onChange} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="sort_order" render={({ field }) => (
          <FormItem>
            <FormLabel>Порядок сортировки</FormLabel>
            <FormControl><Input type="number" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Сохраняем...' : 'Сохранить'}
        </Button>
      </form>
    </Form>
  );
} 