"use client";

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Brand } from '@/lib/services/brand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  name: z.string().min(2, 'Название обязательно'),
  slug: z.string().min(2, 'Slug обязателен').regex(/^[a-z0-9\-]+$/, 'Только строчные буквы, цифры и дефисы'),
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
}

export function BrandForm({ initialData, onSubmit, isSubmitting }: BrandFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      slug: initialData?.slug ?? '',
      description: initialData?.description ?? '',
      logo_url: initialData?.logo_url ?? '',
      website: initialData?.website ?? '',
      country: initialData?.country ?? '',
      is_active: initialData?.is_active ?? true,
      sort_order: initialData?.sort_order ?? 0,
      meta_title: initialData?.meta_title ?? '',
      meta_description: initialData?.meta_description ?? '',
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
        <FormField control={form.control} name="logo_url" render={({ field }) => (
          <FormItem>
            <FormLabel>Логотип (URL)</FormLabel>
            <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="website" render={({ field }) => (
          <FormItem>
            <FormLabel>Сайт</FormLabel>
            <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="country" render={({ field }) => (
          <FormItem>
            <FormLabel>Страна</FormLabel>
            <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="is_active" render={({ field }) => (
          <FormItem>
            <FormLabel>Активен</FormLabel>
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
        <FormField control={form.control} name="meta_title" render={({ field }) => (
          <FormItem>
            <FormLabel>Meta Title</FormLabel>
            <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="meta_description" render={({ field }) => (
          <FormItem>
            <FormLabel>Meta Description</FormLabel>
            <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
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