'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/providers/cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Trash2, ShoppingCart, ArrowRight, MinusCircle, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

// Utility function (can be moved to a shared file later)
const formatPrice = (amount?: number | null, currencyCode: string = 'KZT'): string => {
  if (typeof amount !== 'number' || amount === null) {
    return 'Цена не указана'; // Or handle as 'Price on request'
  }
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  }).format(amount / 100); // Assuming amount is in cents
};

export default function CartPage() {
  const {
    cart,
    isLoading: isCartLoading, // Global cart loading
    totalItems,
    updateItemQuantity,
    removeItem,
  } = useCart();

  // Local loading states for specific items/actions
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  const handleQuantityChange = async (itemId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) {
      handleRemoveItem(itemId); // Or just prevent going below 1
      return;
    }
    setUpdatingItemId(itemId);
    try {
      await updateItemQuantity(itemId, newQuantity);
      // toast.success('Количество обновлено'); // Optional: CartProvider might already show a toast
    } catch (error) {
      // toast.error('Не удалось обновить количество'); // CartProvider handles errors
    } finally {
      setUpdatingItemId(null);
    }
  };
  
  const handleDirectQuantityInput = async (itemId: string, newQuantityStr: string) => {
    const newQuantity = parseInt(newQuantityStr, 10);
    if (isNaN(newQuantity) || newQuantity < 1) {
        // If invalid or less than 1, treat as an attempt to remove or set to 1.
        // For simplicity, we'll just prevent invalid input visually or rely on blur/enter.
        // Or, if newQuantity is 0, call removeItem.
        // For now, let's assume users use buttons or type valid numbers.
        // A more robust solution would handle this better, e.g., by setting quantity to 1 if invalid.
        // toast.info("Количество должно быть не менее 1");
        return; // Or set to 1
    }
    setUpdatingItemId(itemId);
    try {
      await updateItemQuantity(itemId, newQuantity);
    } finally {
      setUpdatingItemId(null);
    }
  };


  const handleRemoveItem = async (itemId: string) => {
    setRemovingItemId(itemId);
    try {
      await removeItem(itemId);
      // toast.success('Товар удален из корзины'); // CartProvider handles this
    } catch (error) {
      // toast.error('Не удалось удалить товар'); // CartProvider handles errors
    } finally {
      setRemovingItemId(null);
    }
  };

  if (isCartLoading && !cart) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">Загрузка корзины...</p>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0 || totalItems === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-lg shadow">
        <ShoppingCart className="w-20 h-20 text-gray-400 dark:text-gray-500 mb-6" />
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">Ваша корзина пуста</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Похоже, вы еще ничего не добавили. Начните покупки, чтобы увидеть товары здесь.</p>
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/catalog">
            <ArrowRight className="w-5 h-5 mr-2" />
            Продолжить покупки
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 font-sans">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Ваша корзина</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {cart.items.map((item) => (
            <Card key={item.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-800">
              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <Image
                    src={item.thumbnail || '/placeholder-image.png'} // Ensure you have a placeholder
                    alt={item.title || 'Product image'}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>

                <div className="flex-grow">
                  <Link href={`/product/${item.variant?.product?.handle || ''}`} passHref legacyBehavior>
                    <a className="text-lg font-semibold text-primary hover:underline dark:text-blue-400 dark:hover:text-blue-300 line-clamp-2">
                      {item.title}
                    </a>
                  </Link>
                  {item.variant?.title && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.variant.title}</p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                    Цена за шт.: {formatPrice(item.unit_price, item.currency_code)}
                  </p>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 sm:h-9 sm:w-9 border-gray-300 dark:border-gray-600"
                      onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                      disabled={updatingItemId === item.id || removingItemId === item.id || item.quantity <= 1}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleDirectQuantityInput(item.id, e.target.value)}
                      onBlur={(e) => { // Finalize on blur if value is potentially invalid or 0
                          const val = parseInt(e.target.value, 10);
                          if (isNaN(val) || val < 1) handleRemoveItem(item.id);
                      }}
                      className="w-16 h-9 text-center border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary"
                      min="1"
                      disabled={updatingItemId === item.id || removingItemId === item.id}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 sm:h-9 sm:w-9 border-gray-300 dark:border-gray-600"
                      onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                      disabled={updatingItemId === item.id || removingItemId === item.id}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-md font-semibold text-gray-800 dark:text-gray-100 w-full text-left sm:text-right">
                    Сумма: {formatPrice(item.subtotal, item.currency_code)}
                  </p>
                   <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 px-2 self-start sm:self-end" // Changed px-0 sm:px-2 to px-2
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={removingItemId === item.id || updatingItemId === item.id}
                  >
                    {removingItemId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-1" /> // Changed mr-1 sm:mr-2 to mr-1
                    )}
                    Удалить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="shadow-lg bg-white dark:bg-gray-800 sticky top-24">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Сумма заказа</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-md text-gray-700 dark:text-gray-300">
                <span>Промежуточный итог:</span>
                <span>{formatPrice(cart.subtotal, cart.currency_code)}</span>
              </div>
              {/* Future: Discounts, Shipping, Taxes */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                  <span>Итого:</span>
                  <span>{formatPrice(cart.total, cart.currency_code)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 mt-2">
              <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3">
                <Link href="/checkout">
                  Перейти к оформлению
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full py-3">
                <Link href="/catalog">
                  Продолжить покупки
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
