'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/providers/cart';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
  Truck,
  Shield,
  CreditCard,
  Gift,
  Percent
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

// Компонент элемента корзины
const CartItem = ({ item, onUpdateQuantity, onRemove }: {
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-2xl p-6 border border-gray-100 ${isUpdating ? 'opacity-50' : ''}`}
    >
      <div className="flex gap-4">
        {/* Изображение товара */}
        <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
          {item.thumbnail ? (
            <Image
              src={item.thumbnail}
              alt={item.title}
              width={96}
              height={96}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <Package className="w-8 h-8 text-gray-400" />
          )}
        </div>

        {/* Информация о товаре */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
              {item.title}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isUpdating}
              className="text-gray-400 hover:text-red-500 ml-2"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            {/* Цена */}
            <div className="flex flex-col">
              <div className="text-2xl font-bold text-gray-900">
                {(item.price * item.quantity).toLocaleString('ru-RU')} ₸
              </div>
              <div className="text-sm text-gray-500">
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
              
              <span className="w-12 text-center font-medium">
                {item.quantity}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={isUpdating}
                className="w-8 h-8 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Компонент итогов корзины
const CartSummary = ({ totalPrice, totalItems }: { totalPrice: number; totalItems: number }) => {
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const deliveryPrice = totalPrice > 50000 ? 0 : 2000; // Бесплатная доставка от 50к
  const finalPrice = totalPrice + deliveryPrice;

  const applyPromoCode = async () => {
    setIsApplyingPromo(true);
    // Имитация применения промокода
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Промокод применен!');
    setIsApplyingPromo(false);
  };

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          Итоги заказа
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Количество товаров */}
        <div className="flex justify-between">
          <span className="text-gray-600">Товаров в корзине:</span>
          <span className="font-medium">{totalItems} шт</span>
        </div>

        {/* Стоимость товаров */}
        <div className="flex justify-between">
          <span className="text-gray-600">Стоимость товаров:</span>
          <span className="font-medium">{totalPrice.toLocaleString('ru-RU')} ₸</span>
        </div>

        {/* Доставка */}
        <div className="flex justify-between">
          <span className="text-gray-600">Доставка:</span>
          <span className={`font-medium ${deliveryPrice === 0 ? 'text-green-600' : ''}`}>
            {deliveryPrice === 0 ? 'Бесплатно' : `${deliveryPrice.toLocaleString('ru-RU')} ₸`}
          </span>
        </div>

        {deliveryPrice === 0 && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
            <Gift className="w-4 h-4" />
            Бесплатная доставка от 50 000 ₸
          </div>
        )}

        <Separator />

        {/* Промокод */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Промокод
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="Введите промокод"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={applyPromoCode}
              disabled={!promoCode || isApplyingPromo}
              className="px-3"
            >
              <Percent className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Итого */}
        <div className="flex justify-between text-xl font-bold">
          <span>Итого:</span>
          <span>{finalPrice.toLocaleString('ru-RU')} ₸</span>
        </div>

        {/* Кнопки действий */}
        <div className="space-y-3 pt-4">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium">
            <CreditCard className="w-5 h-5 mr-2" />
            Оформить заказ
          </Button>
          
          <Button variant="outline" className="w-full" asChild>
            <Link href="/catalog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Продолжить покупки
            </Link>
          </Button>
        </div>

        {/* Гарантии */}
        <div className="pt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield className="w-4 h-4 text-green-500" />
            Безопасная оплата
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Truck className="w-4 h-4 text-blue-500" />
            Быстрая доставка
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Главный компонент страницы корзины
export default function CartPage() {
  const { cart, isLoading, removeItem, updateItemQuantity, totalItems } = useCart();

  const totalPrice = cart?.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Корзина
            {totalItems > 0 && (
              <Badge variant="secondary" className="ml-3">
                {totalItems} {totalItems === 1 ? 'товар' : totalItems < 5 ? 'товара' : 'товаров'}
              </Badge>
            )}
          </h1>
        </div>

        {/* Контент корзины */}
        {!cart?.items || cart.items.length === 0 ? (
          // Пустая корзина
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-white rounded-3xl p-12 max-w-md mx-auto">
              <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ваша корзина пуста
              </h2>
              <p className="text-gray-600 mb-8">
                Добавьте товары из каталога, чтобы сделать заказ
              </p>
              <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/catalog">
                  <Package className="w-5 h-5 mr-2" />
                  Перейти в каталог
                </Link>
              </Button>
            </div>
          </motion.div>
        ) : (
          // Корзина с товарами
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Список товаров */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                <AnimatePresence>
                  {cart.items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateItemQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Рекомендации */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="text-lg">Рекомендуем также</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="bg-gray-100 rounded-xl h-32 flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Итоги заказа */}
            <div className="lg:col-span-1">
              <CartSummary totalPrice={totalPrice} totalItems={totalItems} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}