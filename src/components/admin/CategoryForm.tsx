'use client';

import { useState, useEffect } from 'react';
import { Category, CategoryFormData } from '@/types/catalog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface CategoryFormProps {
  onSubmit: (data: CategoryFormData) => void;
  initialData?: CategoryFormData;
  categories?: Category[];
  currentCategoryId?: string;
}

// Helper function to build a flat list of categories with indentation
function buildCategoryOptions(
  categories: Category[] = [],
  currentCategoryId?: string,
  level = 0,
  result: { value: string; label: string; disabled: boolean }[] = []
): { value: string; label: string; disabled: boolean }[] {
  categories.forEach(category => {
    // Skip the current category to avoid circular references
    const isCurrentCategory = category.id === currentCategoryId;
    
    result.push({
      value: category.id,
      label: `${' '.repeat(level * 2)}${category.name}`,
      disabled: isCurrentCategory
    });
    
    if (category.children && category.children.length > 0) {
      buildCategoryOptions(category.children, currentCategoryId, level + 1, result);
    }
  });
  
  return result;
}

export function CategoryForm({ 
  onSubmit, 
  initialData, 
  categories = [],
  currentCategoryId
}: CategoryFormProps) {
  // Convert empty icon_name to 'none' for the select component
  const processedInitialData = initialData ? {
    ...initialData,
    icon_name: initialData.icon_name === '' ? 'none' : initialData.icon_name
  } : undefined;

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    parent_id: undefined,
    image_url: '',
    icon_name: 'none', // Default to 'none' instead of empty string
    is_active: true,
    sort_order: 0,
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    ...processedInitialData
  });

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && (!initialData?.slug || formData.name !== initialData.name)) {
      setFormData(prev => ({
        ...prev,
        slug: formData.name
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
      }));
    }
  }, [formData.name, initialData?.slug]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (name: string, value: string) => {
    // If the value is "root" for parent_id, set it to undefined
    if (name === 'parent_id' && value === 'root') {
      setFormData(prev => ({ ...prev, [name]: undefined }));
    }
    // If the value is "none" for icon_name, set it to empty string
    else if (name === 'icon_name' && value === 'none') {
      setFormData(prev => ({ ...prev, [name]: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare the final form data, ensuring icon_name 'none' is converted to empty string
    const finalFormData = {
      ...formData,
      icon_name: formData.icon_name === 'none' ? '' : formData.icon_name
    };
    
    onSubmit(finalFormData);
  };

  // Build category options for parent selection
  const categoryOptions = buildCategoryOptions(categories, currentCategoryId);

  // Common icon options
  const iconOptions = [
    { value: 'none', label: 'Нет иконки' },
    { value: 'shopping-bag', label: 'Корзина' },
    { value: 'tag', label: 'Тег' },
    { value: 'home', label: 'Дом' },
    { value: 'smartphone', label: 'Смартфон' },
    { value: 'laptop', label: 'Ноутбук' },
    { value: 'tv', label: 'ТВ' },
    { value: 'camera', label: 'Камера' },
    { value: 'headphones', label: 'Наушники' },
    { value: 'watch', label: 'Часы' },
    { value: 'shirt', label: 'Одежда' },
    { value: 'gift', label: 'Подарок' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Основное</TabsTrigger>
          <TabsTrigger value="display">Отображение</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>
        
        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="required">Название</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug" className="required">Slug</Label>
              <Input
                id="slug"
                name="slug"
                type="text"
                value={formData.slug}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-muted-foreground">
                Используется в URL: /catalog/<span className="font-mono">{formData.slug}</span>
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="parent_id">Родительская категория</Label>
            <Select
              value={formData.parent_id || ''}
              onValueChange={(value) => handleSelectChange('parent_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите родительскую категорию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">Нет (корневая категория)</SelectItem>
                {categoryOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    disabled={option.disabled}
                    className={cn(
                      option.label.startsWith(' ') && "pl-[calc(0.75rem_+_" + (option.label.length - option.label.trimStart().length) + "ch)]"
                    )}
                  >
                    {option.label.trim()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
        
        {/* Display Tab */}
        <TabsContent value="display" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="image_url">URL изображения</Label>
              <Input
                id="image_url"
                name="image_url"
                type="text"
                value={formData.image_url || ''}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="icon_name">Иконка</Label>
              <Select
                value={formData.icon_name || 'none'}
                onValueChange={(value) => handleSelectChange('icon_name', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите иконку" />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked: boolean) => handleSwitchChange('is_active', checked)}
              />
              <Label htmlFor="is_active">Активна</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sort_order">Порядок сортировки</Label>
              <Input
                id="sort_order"
                name="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={handleChange}
              />
            </div>
          </div>
        </TabsContent>
        
        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="meta_title">Meta Title</Label>
            <Input
              id="meta_title"
              name="meta_title"
              type="text"
              value={formData.meta_title || ''}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="meta_description">Meta Description</Label>
            <Textarea
              id="meta_description"
              name="meta_description"
              value={formData.meta_description || ''}
              onChange={handleChange}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="meta_keywords">Meta Keywords</Label>
            <Input
              id="meta_keywords"
              name="meta_keywords"
              type="text"
              value={formData.meta_keywords || ''}
              onChange={handleChange}
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button type="submit">
          {initialData ? 'Сохранить изменения' : 'Создать категорию'}
        </Button>
      </div>
    </form>
  );
}