'use client';
import React from 'react';

import { useState } from 'react';
import { Category } from '@/types/catalog';
import { Button } from '@/components/ui/button';
import {
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  Plus,
  FolderPlus,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CategoryListProps {
  categories: Category[];
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
  onAddSubcategory?: (parentCategory: Category) => void;
  onToggleActive?: (category: Category, isActive: boolean) => void;
  loadingToggledCategoryId?: string | null;
}

// Helper function to build a tree from flat categories array
function buildCategoryTree(categories: Category[]): Category[] {
  const categoryMap = new Map<string, Category>();
  const rootCategories: Category[] = [];

  // First pass: create a map of all categories
  categories.forEach(category => {
    categoryMap.set(category.id, {
      ...category,
      children: []
    });
  });

  // Second pass: build the tree structure
  categories.forEach(category => {
    const categoryWithChildren = categoryMap.get(category.id)!;
    
    if (category.parent_id && categoryMap.has(category.parent_id)) {
      // This is a child category, add it to its parent
      const parent = categoryMap.get(category.parent_id)!;
      if (!parent.children) parent.children = [];
      parent.children.push(categoryWithChildren);
    } else {
      // This is a root category
      rootCategories.push(categoryWithChildren);
    }
  });

  return rootCategories;
}

export function CategoryList({
  categories,
  onEdit,
  onDelete,
  onAddSubcategory,
  onToggleActive,
  loadingToggledCategoryId
}: CategoryListProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  
  // Build category tree
  const categoryTree = buildCategoryTree(categories);

  // Toggle category expansion
  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Recursive component to render category tree
  const CategoryTreeItem = ({ category, level = 0 }: { category: Category; level?: number }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    
    return (
      <>
        <TableRow className={cn(
          level > 0 && "bg-muted/30",
        )}>
          <TableCell className="w-10">
            <input
              type="checkbox"
              className="rounded-sm border-gray-200 shadow-sm data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              checked={selectedCategories.has(category.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedCategories(prev => {
                    const newSet = new Set(prev);
                    newSet.add(category.id);
                    return newSet;
                  });
                } else {
                  setSelectedCategories(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(category.id);
                    return newSet;
                  });
                }
              }}
            />
          </TableCell>
          <TableCell className="font-medium">
            <div className="flex items-center">
              <div style={{ width: `${level * 20}px` }} className="flex-shrink-0" />
              
              {hasChildren ? (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 mr-2"
                  onClick={() => toggleExpand(category.id)}
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              ) : (
                <div className="w-8" />
              )}
              
              <span className={cn(
                "truncate",
                !category.is_active && "text-muted-foreground line-through"
              )}>
                {category.name}
              </span>
              
              {!category.is_active && (
                <Badge variant="outline" className="ml-2">Неактивна</Badge>
              )}
              
              {category.children_count && category.children_count > 0 && !hasChildren && (
                <Badge variant="secondary" className="ml-2">{category.children_count}</Badge>
              )}
            </div>
          </TableCell>
          
          <TableCell className="text-muted-foreground text-sm">
            {category.slug}
          </TableCell>
          
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <span className="sr-only">Открыть меню</span>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                    <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Действия</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(category)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Редактировать</span>
                  </DropdownMenuItem>
                )}
                
                {onAddSubcategory && (
                  <DropdownMenuItem onClick={() => onAddSubcategory(category)}>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    <span>Добавить подкатегорию</span>
                  </DropdownMenuItem>
                )}
                
                {onToggleActive && (
                  <DropdownMenuItem
                    onClick={() => onToggleActive(category, !category.is_active)}
                    disabled={loadingToggledCategoryId === category.id}
                  >
                    {loadingToggledCategoryId === category.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Обновление...</span>
                      </>
                    ) : category.is_active ? (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" />
                        <span>Деактивировать</span>
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Активировать</span>
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete(category)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Удалить</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        
        {/* Render children if expanded */}
        {isExpanded && hasChildren && category.children!.map(child => (
          <CategoryTreeItem key={child.id} category={child} level={level + 1} />
        ))}
      </>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Название</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence mode="wait">
            {categoryTree.length === 0 ? (
              <motion.tr
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <TableCell colSpan={3} className="h-24 text-center">
                  Категории не найдены
                </TableCell>
              </motion.tr>
            ) : (
              categoryTree.map(category => (
                <React.Fragment key={category.id}>
                  <CategoryTreeItem category={category} />
                </React.Fragment>
              ))
            )}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}