'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HttpTypes } from "@medusajs/types";
import { ChevronRightIcon, ChevronDownIcon } from 'lucide-react'; // Using lucide-react icons

interface RecursiveCategoryListProps {
  categories: HttpTypes.StoreProductCategory[];
  currentPathPrefix: string;
  level: number;
  activeCategoryHandle?: string;
  expandedCategories: Record<string, boolean>;
  onToggleExpand: (categoryId: string) => void;
  parentIsActive?: boolean; // To ensure children of active category are styled if active is leaf
}

const RecursiveCategoryList: React.FC<RecursiveCategoryListProps> = ({
  categories,
  currentPathPrefix,
  level,
  activeCategoryHandle,
  expandedCategories,
  onToggleExpand,
  parentIsActive,
}) => {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <ul className={`list-none ${level > 0 ? 'pl-4' : ''}`}>
      {categories.map((category) => {
        const isExpanded = expandedCategories[category.id!] ?? false;
        const hasChildren = category.category_children && category.category_children.length > 0;
        
        // An item is active if its handle matches activeCategoryHandle
        const isActive = category.handle === activeCategoryHandle;
        // An item is part of the active trail if the activeCategoryHandle starts with its full path handle
        // or if its parent is active and it's a direct child.
        // For simplicity, we'll rely on parentIsActive prop and direct isActive check.
        // A more robust trail highlighting would require mpath comparison.
        const isTrailActive = parentIsActive || isActive;

        return (
          <li key={category.id} className="mb-1">
            <div className={`flex items-center rounded-md ${isActive ? 'bg-blue-100 dark:bg-blue-800' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              {hasChildren && (
                <button
                  onClick={() => onToggleExpand(category.id!)}
                  className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? (
                    <ChevronDownIcon className="h-4 w-4" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4" />
                  )}
                </button>
              )}
              <Link
                href={`${currentPathPrefix}/${category.handle}`}
                className={`block flex-grow p-1.5 text-sm ${isActive ? 'font-semibold text-blue-600 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'} ${!hasChildren ? 'ml-6' : ''}`}
              >
                {category.name}
              </Link>
            </div>
            {hasChildren && isExpanded && (
              <RecursiveCategoryList
                categories={category.category_children}
                currentPathPrefix={`${currentPathPrefix}/${category.handle}`}
                level={level + 1}
                activeCategoryHandle={activeCategoryHandle}
                expandedCategories={expandedCategories}
                onToggleExpand={onToggleExpand}
                parentIsActive={isTrailActive}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default RecursiveCategoryList;
