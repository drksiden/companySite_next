"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ChevronDown, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/catalog";

interface CategoryNavigationProps {
  categories: Category[];
  currentCategoryId?: string;
  className?: string;
  variant?: "sidebar" | "horizontal" | "grid";
}

interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

function buildCategoryTree(categories: Category[]): CategoryWithChildren[] {
  const categoryMap = new Map<string, CategoryWithChildren>();
  const rootCategories: CategoryWithChildren[] = [];

  // Создаем мапу всех категорий
  categories.forEach((category) => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  // Строим дерево
  categories.forEach((category) => {
    const categoryNode = categoryMap.get(category.id)!;

    if (category.parent_id) {
      const parent = categoryMap.get(category.parent_id);
      if (parent) {
        parent.children!.push(categoryNode);
      }
    } else {
      rootCategories.push(categoryNode);
    }
  });

  return rootCategories;
}

function CategoryItem({
  category,
  isActive,
  level = 0,
  variant = "sidebar",
}: {
  category: CategoryWithChildren;
  isActive: boolean;
  level?: number;
  variant?: "sidebar" | "horizontal" | "grid";
}) {
  const [isOpen, setIsOpen] = useState(isActive || level === 0);
  const hasChildren = category.children && category.children.length > 0;

  if (variant === "grid") {
    return (
      <Link
        href={`/catalog?categories=${category.id}`}
        className="group block p-4 border rounded-lg hover:shadow-md transition-all"
      >
        <div className="space-y-3">
          {category.image_url && (
            <div className="relative aspect-square bg-muted rounded-md overflow-hidden">
              <Image
                src={category.image_url}
                alt={category.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
          )}
          <div>
            <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "horizontal") {
    return (
      <div className="relative">
        <Link
          href={`/catalog?categories=${category.id}`}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md transition-colors hover:bg-muted",
            isActive &&
              "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          <span className="font-medium">{category.name}</span>
          {hasChildren && <ChevronDown className="w-4 h-4" />}
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", level > 0 && "ml-4")}>
      <div className="flex items-center">
        {hasChildren ? (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 hover:bg-transparent"
              >
                <ChevronRight
                  className={cn(
                    "w-4 h-4 transition-transform",
                    isOpen && "rotate-90",
                  )}
                />
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        ) : (
          <div className="w-6" />
        )}

        <Link
          href={`/catalog?categories=${category.id}`}
          className={cn(
            "flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors hover:bg-muted",
            isActive &&
              "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          {category.icon_name && (
            <div className="w-4 h-4 flex items-center justify-center">
              <Grid className="w-4 h-4" />
            </div>
          )}
          <span className="font-medium">{category.name}</span>
        </Link>
      </div>

      {hasChildren && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent className="space-y-1">
            {category.children!.map((child) => (
              <CategoryItem
                key={child.id}
                category={child}
                isActive={false}
                level={level + 1}
                variant={variant}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

export function CategoryNavigation({
  categories,
  currentCategoryId,
  className,
  variant = "sidebar",
}: CategoryNavigationProps) {
  const categoryTree = buildCategoryTree(categories);

  if (variant === "grid") {
    return (
      <div
        className={cn(
          "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4",
          className,
        )}
      >
        {categoryTree.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            isActive={category.id === currentCategoryId}
            variant="grid"
          />
        ))}
      </div>
    );
  }

  if (variant === "horizontal") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 overflow-x-auto pb-2",
          className,
        )}
      >
        <Link
          href="/catalog"
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md transition-colors hover:bg-muted whitespace-nowrap",
            !currentCategoryId &&
              "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          <span className="font-medium">Все категории</span>
        </Link>
        {categoryTree.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            isActive={category.id === currentCategoryId}
            variant="horizontal"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="space-y-1">
        <Link
          href="/catalog"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-muted",
            !currentCategoryId &&
              "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          <Grid className="w-4 h-4" />
          Все категории
        </Link>
      </div>

      <div className="space-y-1">
        {categoryTree.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            isActive={category.id === currentCategoryId}
            variant="sidebar"
          />
        ))}
      </div>
    </div>
  );
}
