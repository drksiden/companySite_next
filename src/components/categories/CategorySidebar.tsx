'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { sdk } from '@/lib/sdk'; // Assuming sdk is configured for client-side use or this component is primarily for structure
import { HttpTypes } from "@medusajs/types";
import RecursiveCategoryList from './RecursiveCategoryList'; // Adjust path as necessary
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

async function fetchAllCategoriesTree(): Promise<HttpTypes.StoreProductCategory[]> {
  try {
    const { product_categories } = await sdk.store.category.list(
      {
        // parent_category_id: null, // Fetch top-level categories
        fields: 'id,name,handle,parent_category_id,category_children.id,category_children.name,category_children.handle,category_children.parent_category_id,category_children.mpath', // Request children fields
        include_descendants_tree: true, // Crucial for getting the whole tree
        limit: 500, // Adjust limit as needed, consider pagination for very large sets
        is_active: true,
      },
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    // Filter for top-level categories only, as include_descendants_tree provides the nested structure
    return product_categories.filter(category => !category.parent_category_id);
  } catch (error) {
    console.error("Failed to fetch category tree:", error);
    throw error; // Re-throw to be caught by the component
  }
}

const CategorySidebar: React.FC = () => {
  const [categories, setCategories] = useState<HttpTypes.StoreProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const [activeCategoryHandle, setActiveCategoryHandle] = useState<string | undefined>(undefined);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const tree = await fetchAllCategoriesTree();
        setCategories(tree);
        setError(null);
      } catch (e) {
        setError("Не удалось загрузить категории.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (pathname) {
      const pathParts = pathname.split('/');
      // Assuming URL structure like /catalog/category-handle or /catalog/parent/child-handle
      const handle = pathParts[pathParts.length -1];
      if (pathParts[1] === 'catalog' && handle) {
        setActiveCategoryHandle(handle);
      } else {
        setActiveCategoryHandle(undefined);
      }
    }
  }, [pathname]);
  
  const initExpandedState = useCallback((cats: HttpTypes.StoreProductCategory[], currentHandle?: string, currentPath: string = '/catalog'): Record<string, boolean> => {
    let expanded: Record<string, boolean> = {};
    if (!currentHandle) return expanded;

    for (const category of cats) {
      if (category.id) {
        const categoryFullPath = `${currentPath}/${category.handle}`;
        if (currentHandle === category.handle || pathname?.startsWith(categoryFullPath)) {
          expanded[category.id] = true;
          if (category.category_children && category.category_children.length > 0) {
            const childrenExpanded = initExpandedState(category.category_children, currentHandle, categoryFullPath);
            expanded = { ...expanded, ...childrenExpanded };
          }
        }
      }
    }
    return expanded;
  }, [pathname]);

  useEffect(() => {
    if (categories.length > 0 && activeCategoryHandle) {
      setExpandedCategories(initExpandedState(categories, activeCategoryHandle));
    }
  }, [categories, activeCategoryHandle, initExpandedState]);

  const handleToggleExpand = (categoryId: string) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  if (loading) {
    return (
      <aside className="w-64 md:w-72 lg:w-80 p-4 border-r border-gray-200 dark:border-gray-800 min-h-screen">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Категории</h3>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="mb-2">
            <Skeleton className="h-6 w-3/4 mb-1" />
            <Skeleton className="h-4 w-1/2 ml-4" />
          </div>
        ))}
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="w-64 md:w-72 lg:w-80 p-4 border-r border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Категории</h3>
        <p className="text-red-500">{error}</p>
      </aside>
    );
  }

  if (categories.length === 0) {
    return (
       <aside className="w-64 md:w-72 lg:w-80 p-4 border-r border-gray-200 dark:border-gray-800 min-h-screen">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Категории</h3>
        <p className="text-gray-500 dark:text-gray-400">Категории не найдены.</p>
      </aside>
    );
  }

  return (
    <aside className="w-64 md:w-72 lg:w-80 p-4 border-r border-gray-200 dark:border-gray-800 min-h-screen bg-white dark:bg-gray-950">
      <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Категории</h3>
      <RecursiveCategoryList
        categories={categories}
        currentPathPrefix="/catalog"
        level={0}
        activeCategoryHandle={activeCategoryHandle}
        expandedCategories={expandedCategories}
        onToggleExpand={handleToggleExpand}
      />
    </aside>
  );
};

export default CategorySidebar;
