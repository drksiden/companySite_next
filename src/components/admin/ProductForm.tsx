"use client";
import { useState } from 'react';
import { ProductFormData } from '@/types/catalog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  initialData?: ProductFormData;
}

export function ProductForm({ onSubmit, initialData }: ProductFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      slug,
      description,
      category_id: categoryId,
      inventory_quantity: 0,
      track_inventory: false,
      allow_backorder: false,
      images: [],
      status: 'draft',
      specifications: {},
      is_featured: false,
      // Add other fields as needed
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="categoryId">Category ID</Label>
        <Input
          id="categoryId"
          type="text"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        />
      </div>
      <Button type="submit">Submit</Button>
    </form>
  );
}