"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageOff, ShoppingBag } from "lucide-react";
import { Product } from "@/types/supabase"; // Import Supabase Product type

interface ProductCardListProps {
  products: Product[]; // Use Supabase Product type
}

import { formatPrice } from "@/lib/utils";

export function ProductCardList({ products }: ProductCardListProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  if (!products || products.length === 0) {
    // Optionally, render a message or a placeholder
    // return <p className="text-center text-gray-500">Товары не найдены.</p>;
    return null;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
    >
      <AnimatePresence>
        {products.map((product) => {
          const imageUrl = product.image_urls?.[0];
          const productName = product.name;
          const productHandle = product.handle; // Assuming 'handle' is used for links
          const displayPrice = product.price;
          const currencyCode = product.currency_code || "KZT";

          // Simplified stock logic
          const inStock =
            typeof product.stock_quantity === "number"
              ? product.stock_quantity > 0
              : true; // Default to true if stock_quantity is not a number

          return (
            <motion.div
              key={product.id} // Assuming product.id is the unique key
              variants={itemVariants}
              layout
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <Card className="h-full flex flex-col overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="p-0">
                  <Link href={`/product/${productHandle}`} className="block">
                    <div className="relative w-full h-48 bg-muted">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={productName || "Изображение товара"}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-contain p-4" // Changed to object-contain for better general use
                          priority={false} // Adjust priority as needed, e.g., for first few items
                          // Consider a more specific placeholder if possible
                          placeholder="blur"
                          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                          <ImageOff className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                        </div>
                      )}
                    </div>
                  </Link>
                  {/* Removed discount badge as it relied on variant pricing logic */}
                  {!inStock && (
                    <Badge
                      variant="destructive"
                      className="absolute top-2 right-2"
                    >
                      Нет в наличии
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="p-6 flex-grow flex flex-col">
                  <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-2 hover:text-primary transition-colors">
                    {" "}
                    {/* Adjusted mb */}
                    <Link href={`/product/${productHandle}`}>
                      {productName || "Без названия"}
                    </Link>
                  </h3>
                  {product.brands &&
                    product.brands.length > 0 &&
                    product.brands[0].name && (
                      <div className="mb-2 text-xs text-muted-foreground">
                        {" "}
                        {/* Adjusted margin and styling */}
                        {product.brands[0].handle ? (
                          <Link
                            href={`/brand/${product.brands[0].handle}`}
                            className="hover:text-primary hover:underline"
                          >
                            {product.brands[0].name}
                          </Link>
                        ) : (
                          product.brands[0].name
                        )}
                      </div>
                    )}
                  <div className="mt-auto">
                    <p className="text-xl font-bold text-primary">
                      {formatPrice(displayPrice, currencyCode)}
                    </p>
                    {/* Removed original price display as it relied on variant pricing logic */}
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button
                    asChild
                    className="w-full"
                    variant={inStock ? "default" : "outline"}
                    disabled={!inStock}
                  >
                    <Link href={`/product/${productHandle}`}>
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      {inStock ? "Подробнее" : "Нет в наличии"}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
