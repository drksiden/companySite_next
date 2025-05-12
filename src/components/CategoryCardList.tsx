'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageOff } from 'lucide-react';
import { HttpTypes } from '@medusajs/types'; // Используем типы из Medusa

type ProductCategoryType = HttpTypes.StoreProductCategory; // Используем напрямую

interface CategoryCardListProps {
  categories: ProductCategoryType[];
  basePath?: string; // Новый опциональный пропс для базового пути
}

export function CategoryCardList({ categories, basePath = '/catalog' }: CategoryCardListProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8" // Можно увеличить gap для лучшего вида
    >
      {categories.map((category) => (
        <motion.div key={category.id} variants={itemVariants}>
          <Card className="h-full flex flex-col overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="p-4">
              <CardTitle className="text-xl font-semibold text-foreground text-center truncate">
                {category.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-grow flex flex-col items-center">
              <div className="relative w-full aspect-[4/3] mb-4 bg-muted rounded-md overflow-hidden group">
                {/* Изображения категорий в Medusa часто хранятся в поле metadata.
                  Например, вы можете договориться о ключе 'thumbnail_url' или 'image_url' в metadata.
                */}
                {(category.metadata?.thumbnail_url || category.metadata?.image_url) ? (
                  <Image
                    src={(category.metadata.thumbnail_url as string) || (category.metadata.image_url as string)}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    priority={categories.indexOf(category) < 3} // Приоритет для первых нескольких изображений
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <ImageOff className="w-16 h-16 text-gray-400 dark:text-gray-600" />
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground text-center line-clamp-3">
                {category.description || `Ознакомьтесь с товарами в категории "${category.name}".`}
              </p>
            </CardContent>
            <CardFooter className="p-4 mt-auto">
              <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href={`${basePath}/${category.handle}`}>
                  {category.category_children && category.category_children.length > 0 ? 'Смотреть подкатегории' : 'Смотреть товары'}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}