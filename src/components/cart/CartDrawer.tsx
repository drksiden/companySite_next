'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/providers/cart';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  ShoppingBag,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  Package,
  ArrowRight,
  X,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

interface CartDrawerProps {
  children: React.ReactNode;
}

const CartDrawerItem = ({ item, onUpdateQuantity, onRemove }: {
  item: any;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(true);
    try {
      await onUpdateQuantity(item.id, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await onRemove(item.id);
      toast.success('Товар удален из корзины');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`flex gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${
        isUpdating ? 'opacity-50' : ''
      }`}
    >
      {/* Изображение товара */}
      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={item.title}
            width={64}
            height={64}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <Package className="w-6 h-6 text-muted-foreground" />
        )}
      </div>

      {/* Информация о товаре */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm leading-tight line-clamp-2 mb-1">
          {item.title}
        </h4>
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-primary">
            {(item.price * item.quantity).toLocaleString('ru-RU')} ₸
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isUpdating}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>

        {/* Управление количеством */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={isUpdating || item.quantity <= 1}
            className="h-6 w-6 p-0"
          >
            <Minus className="w-3 h-3" />
          </Button>
          
          <span className="w-8 text-center text-sm font-medium">
            {item.quantity}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={isUpdating}
            className="h-6 w-6 p-0"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export function CartDrawer({ children }: CartDrawerProps) {
  const { cart, totalItems, totalPrice, updateItemQuantity, removeItem, isLoading } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const deliveryPrice = totalPrice > 50000 ? 0 : 2000;
  const finalPrice = totalPrice + deliveryPrice;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      
      <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-xl font-bold">Корзина</SheetTitle>
              {totalItems > 0 && (
                <Badge variant="secondary">
                  {totalItems}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SheetDescription>
            {totalItems > 0 
              ? `${totalItems} ${totalItems === 1 ? 'товар' : totalItems < 5 ? 'товара' : 'товаров'} в корзине`
              : 'Ваша корзина пуста'
            }
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          // Состояние загрузки
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
              <p className="text-muted-foreground">Загрузка корзины...</p>
            </div>
          </div>
        ) : !cart?.items || cart.items.length === 0 ? (
          // Пустая корзина
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Корзина пуста</h3>
              <p className="text-muted-foreground mb-6">
                Добавьте товары из каталога
              </p>
              <Button 
                onClick={() => setIsOpen(false)}
                className="w-full"
                asChild
              >
                <Link href="/catalog">
                  Перейти в каталог
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          // Корзина с товарами
          <>
            {/* Список товаров */}
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-3">
                <AnimatePresence>
                  {cart.items.map((item) => (
                    <CartDrawerItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateItemQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>

            {/* Итоги */}
            <div className="p-6 pt-4 border-t bg-card/50">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Товары:</span>
                  <span>{totalPrice.toLocaleString('ru-RU')} ₸</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Доставка:</span>
                  <span className={deliveryPrice === 0 ? 'text-green-600' : ''}>
                    {deliveryPrice === 0 ? 'Бесплатно' : `${deliveryPrice.toLocaleString('ru-RU')} ₸`}
                  </span>
                </div>

                {deliveryPrice === 0 ? (
                  <div className="text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                    🎉 Бесплатная доставка от 50 000 ₸
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
                    💡 До бесплатной доставки: {(50000 - totalPrice).toLocaleString('ru-RU')} ₸
                  </div>
                )}

                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Итого:</span>
                  <span>{finalPrice.toLocaleString('ru-RU')} ₸</span>
                </div>
              </div>

              {/* Кнопки действий */}
              <div className="space-y-2">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90" 
                  size="lg"
                  asChild
                >
                  <Link href="/checkout" onClick={() => setIsOpen(false)}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Оформить заказ
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  asChild
                >
                  <Link href="/cart" onClick={() => setIsOpen(false)}>
                    Перейти в корзину
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>

              {/* Безопасность */}
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Безопасная оплата
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Быстрая доставка
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// Компонент кнопки корзины с счетчиком для Header
export function CartButton() {
  const { totalItems, isLoading } = useCart();

  return (
    <CartDrawer>
      <Button variant="ghost" size="icon" className="relative">
        <ShoppingCart className="h-5 w-5" />
        <AnimatePresence>
          {totalItems > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
            >
              {totalItems > 99 ? '99+' : totalItems}
            </motion.div>
          )}
        </AnimatePresence>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </Button>
    </CartDrawer>
  );
}