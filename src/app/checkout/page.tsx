'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/providers/cart';
import { useRouter } from 'next/navigation';
import { sdk } from '@/lib/sdk';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ArrowRight, ShoppingCart } from 'lucide-react';

// Utility function (can be moved to a shared file later)
const formatPrice = (amount?: number | null, currencyCode: string = 'KZT'): string => {
  if (typeof amount !== 'number' || amount === null) {
    return 'N/A';
  }
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  }).format(amount / 100); // Assuming amount is in cents
};

export default function CheckoutPage() {
  const { cart, isLoading: isCartLoading, totalItems, setCartData } = useCart();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [countryCode, setCountryCode] = useState('KZ'); // Default to Kazakhstan
  const [phone, setPhone] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNextStepMessage, setShowNextStepMessage] = useState(false);

  useEffect(() => {
    if (!isCartLoading && (!cart || totalItems === 0)) {
      toast.error("Ваша корзина пуста. Пожалуйста, добавьте товары перед оформлением заказа.");
      router.replace('/cart');
    }
  }, [isCartLoading, cart, totalItems, router]);

  useEffect(() => {
    if (cart) {
      if (cart.email) setEmail(cart.email);
      if (cart.shipping_address) {
        setFirstName(cart.shipping_address.first_name || '');
        setLastName(cart.shipping_address.last_name || '');
        setAddress1(cart.shipping_address.address_1 || '');
        setAddress2(cart.shipping_address.address_2 || '');
        setCity(cart.shipping_address.city || '');
        setPostalCode(cart.shipping_address.postal_code || '');
        setCountryCode(cart.shipping_address.country_code || 'KZ');
        setPhone(cart.shipping_address.phone || '');
      }
    }
  }, [cart]);

  const handleProceedToShipping = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowNextStepMessage(false);

    if (!email || !firstName || !lastName || !address1 || !city || !postalCode || !countryCode) {
      toast.error("Пожалуйста, заполните все обязательные поля.");
      setIsSubmitting(false);
      return;
    }

    const shippingAddressObject = {
      first_name: firstName,
      last_name: lastName,
      address_1: address1,
      address_2: address2 || undefined, // Medusa expects undefined for empty optional fields
      city: city,
      postal_code: postalCode,
      country_code: countryCode,
      phone: phone || undefined,
    };

    try {
      let currentCart = cart; // Use current cart from provider

      // 1. Update email if it has changed or not set
      if (currentCart && currentCart.email !== email) {
        const { cart: cartWithEmail } = await sdk.store.cart.update(currentCart.id, { email: email });
        currentCart = cartWithEmail; // Update currentCart reference
        setCartData(cartWithEmail); // Update provider state
      }

      // 2. Update shipping address
      if (currentCart) {
        const { cart: updatedCart } = await sdk.store.cart.update(currentCart.id, {
          shipping_address: shippingAddressObject,
        });
        setCartData(updatedCart); // Update provider state
        toast.success("Адрес доставки сохранен!");
        setShowNextStepMessage(true);
        // In a real scenario, you might navigate: router.push('/checkout/shipping-options');
      } else {
        toast.error("Ошибка: корзина не найдена.");
      }
    } catch (error: any) {
      toast.error("Не удалось сохранить адрес.", { description: error.message || "Пожалуйста, попробуйте еще раз."});
      console.error("Checkout error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isCartLoading || (!cart && !isCartLoading && totalItems > 0) ) { // Show loader if cart is expected but not yet loaded
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-xl font-semibold">Загрузка данных для оформления...</p>
      </div>
    );
  }
  
  if (!cart || totalItems === 0) { // This condition might be hit before useEffect redirect kicks in
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
         <ShoppingCart className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-xl font-semibold">Ваша корзина пуста.</p>
        <Button onClick={() => router.push('/cart')} variant="link" className="mt-4">Вернуться в корзину</Button>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 font-sans">
      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-8 lg:mb-12 text-center">Оформление заказа</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Form Section */}
        <form onSubmit={handleProceedToShipping} className="lg:col-span-2 space-y-8">
          <Card className="shadow-md bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Контактная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Электронная почта</Label>
                <Input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-10 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Адрес доставки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Имя</Label>
                  <Input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="h-10 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
                </div>
                <div>
                  <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Фамилия</Label>
                  <Input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="h-10 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
                </div>
              </div>
              <div>
                <Label htmlFor="address1" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Адрес (строка 1)</Label>
                <Input type="text" id="address1" value={address1} onChange={(e) => setAddress1(e.target.value)} required className="h-10 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
              </div>
              <div>
                <Label htmlFor="address2" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Адрес (строка 2) <span className="text-xs text-gray-500 dark:text-gray-400">(необязательно)</span></Label>
                <Input type="text" id="address2" value={address2} onChange={(e) => setAddress2(e.target.value)} className="h-10 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Город</Label>
                  <Input type="text" id="city" value={city} onChange={(e) => setCity(e.target.value)} required className="h-10 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
                </div>
                <div>
                  <Label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Почтовый индекс</Label>
                  <Input type="text" id="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required className="h-10 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="countryCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Код страны</Label>
                  <Input type="text" id="countryCode" value={countryCode} onChange={(e) => setCountryCode(e.target.value.toUpperCase())} required maxLength={2} placeholder="KZ" className="h-10 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
                </div>
                <div>
                  <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Телефон <span className="text-xs text-gray-500 dark:text-gray-400">(необязательно)</span></Label>
                  <Input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-8">
            <Button type="submit" size="lg" className="w-full py-3 text-lg bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting || showNextStepMessage}>
              {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <ArrowRight className="w-5 h-5 mr-2" />}
              {isSubmitting ? "Сохранение..." : "Сохранить и продолжить"}
            </Button>
          </div>

          {showNextStepMessage && (
            <Card className="mt-6 bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700">
              <CardContent className="p-4 text-center">
                <p className="text-green-700 dark:text-green-200 font-semibold">Адрес сохранен. Следующий шаг: Выбор способа доставки (будет реализован позже).</p>
              </CardContent>
            </Card>
          )}
        </form>

        {/* Cart Summary Section */}
        <div className="lg:col-span-1">
          <Card className="shadow-md sticky top-24 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Сумма заказа</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cart.items?.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 pb-2">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-800 dark:text-gray-200 mr-1">{item.quantity} x</span> 
                    <span className="truncate max-w-[150px] sm:max-w-[200px]" title={item.title}>{item.title}</span>
                  </div>
                  <span>{formatPrice(item.subtotal, item.currency_code)}</span>
                </div>
              ))}
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2">
                <span>Итого:</span>
                <span>{formatPrice(cart.total, cart.currency_code)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
