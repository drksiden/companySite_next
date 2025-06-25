// src/app/cart/page.tsx - обновленная страница корзины
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/providers/cart';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CartSummary } from '@/components/cart/CartSummary';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ShoppingBag, 
  Minus, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  ShoppingCart,
  Package,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import type { CartItem } from '@/types/cart';

// Компонент элемента корзины
const CartItemComponent = ({ item }: { item: CartItem }) => {
  const { updateItemQuantity, removeItem } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(item.quantity);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(true);
    setLocalQuantity(newQuantity);
    
    try {
      updateItemQuantity(item.id, newQuantity);
    } catch (error) {
      setLocalQuantity(item.quantity); // Откатываем изменения при ошибке
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setLocalQuantity(value);
    }
  };

  const handleQuantityInputBlur = () => {
    if (localQuantity !== item.quantity) {
      handleQuantityChange(localQuantity);
    }
  };

  const handleRemove = () => {
    setIsUpdating(true);
    try {
      removeItem(item.id);
    } finally {
      setIsUpdating(false);
    }
  };

  const itemTotal = item.price * item.quantity;
  const isLowStock = item.maxQuantity && item.maxQuantity <= 5;
  const isOutOfStock = item.maxQuantity === 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className={`bg-card rounded-xl p-6 border ${isUpdating ? 'opacity-50' : ''}`}
    >
      <div className="flex gap-4">
        {/* Изображение товара */}
        <div className="w-24 h-24 bg-muted rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
          {item.thumbnail ? (
            <Image
              src={item.thumbnail}
              alt={item.title}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-8 h-8 text-muted-foreground" />
          )}
        </div>

        {/* Информация о товаре */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground line-clamp-2 mb-1">
                {item.title}
              </h3>
              
              {/* Дополнительная информация */}
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-2">
                {item.sku && (
                  <span>Артикул: {item.sku}</span>
                )}
                {item.brand && (
                  <span>• {item.brand}</span>
                )}
                {item.category && (
                  <span>• {item.category}</span>
                )}
              </div>

              {/* Статус наличия */}
              {isOutOfStock && (
                <Badge variant="destructive" className="text-xs">
                  Нет в наличии
                </Badge>
              )}
              {isLowStock && !isOutOfStock && (
                <Badge variant="outline" className="text-xs text-orange-600">
                  Мало в наличии ({item.maxQuantity} шт.)
                </Badge>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isUpdating}
              className="text-muted-foreground hover:text-destructive ml-2"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            {/* Цена */}
            <div className="flex flex-col">
              <div className="text-2xl font-bold text-foreground">
                {itemTotal.toLocaleString('ru-RU')} ₸
              </div>
              <div className="text-sm text-muted-foreground">
                {item.price.toLocaleString('ru-RU')} ₸ за штуку
              </div>
            </div>

            {/* Управление количеством */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={isUpdating || item.quantity <= 1}
                className="w-8 h-8 p-0"
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <Input
                type="number"
                min="1"
                max={item.maxQuantity}
                value={localQuantity}
                onChange={handleQuantityInputChange}
                onBlur={handleQuantityInputBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleQuantityInputBlur();
                  }
                }}
                className="w-16 text-center"
                disabled={isUpdating}
              />
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={isUpdating || (item.maxQuantity ? item.quantity >= item.maxQuantity : false)}
                className="w-8 h-8 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Предупреждения */}
          {item.maxQuantity && item.quantity > item.maxQuantity && (
            <div className="mt-2 flex items-center gap-2 text-sm text-orange-600">
              <AlertCircle className="w-4 h-4" />
              Превышено максимальное количество ({item.maxQuantity} шт.)
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Главный компонент страницы корзины
export default function CartPage() {
  const { cart, isLoading, error, clearCart, totalItems } = useCart();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-muted rounded-xl"></div>
                ))}
              </div>
              <div className="h-96 bg-muted rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-16 h-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">Ошибка загрузки корзины</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Попробовать снова
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Каталог', href: '/catalog' },
            { label: 'Корзина', href: '/cart' },
          ]}
          className="mb-8"
        />

        {/* Заголовок */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              Корзина
              {totalItems > 0 && (
                <Badge variant="secondary" className="ml-3">
                  {totalItems} {totalItems === 1 ? 'товар' : totalItems < 5 ? 'товара' : 'товаров'}
                </Badge>
              )}
            </h1>
          </div>

          {/* Кнопка очистки корзины */}
          {cart && cart.items.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                if (confirm('Вы уверены, что хотите очистить корзину?')) {
                  clearCart();
                }
              }}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Очистить корзину
            </Button>
          )}
        </div>

        {/* Контент корзины */}
        {!cart || cart.items.length === 0 ? (
          // Пустая корзина
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-12 pb-8">
                <ShoppingBag className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Ваша корзина пуста
                </h2>
                <p className="text-muted-foreground mb-8">
                  Добавьте товары из каталога, чтобы сделать заказ
                </p>
                <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/catalog">
                    <Package className="w-5 h-5 mr-2" />
                    Перейти в каталог
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          // Корзина с товарами
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Список товаров */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                <AnimatePresence>
                  {cart.items.map((item) => (
                    <CartItemComponent key={item.id} item={item} />
                  ))}
                </AnimatePresence>
              </div>

              {/* Кнопка "Продолжить покупки" */}
              <div className="mt-8">
                <Button variant="outline" size="lg" asChild>
                  <Link href="/catalog">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Продолжить покупки
                  </Link>
                </Button>
              </div>

              {/* Рекомендации (заглушка) */}
              <Card className="mt-8">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Рекомендуем также</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="bg-muted rounded-xl h-32 flex items-center justify-center">
                        <Package className="w-8 h-8 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Здесь будут отображаться рекомендуемые товары на основе содержимого корзины
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Итоги заказа */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <CartSummary />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}