'use client';

import React, { useState } from 'react';
import { useCart } from '@/providers/cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  CreditCard, 
  Gift, 
  Percent,
  Truck,
  Shield,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface CartSummaryProps {
  showCheckoutButton?: boolean;
  className?: string;
}

export function CartSummary({ showCheckoutButton = true, className }: CartSummaryProps) {
  const { cart, totalItems, isLoading, error } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const subtotal = cart?.subtotal || 0;
  const shipping = cart?.shipping || 0;
  const tax = cart?.tax || 0;
  const discount = cart?.discount || 0;
  const total = cart?.total || 0;

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error('Введите промокод');
      return;
    }

    setIsApplyingPromo(true);
    try {
      // Имитация применения промокода
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Реализовать логику промокодов
      toast.success('Промокод применен!');
      setPromoCode('');
    } catch (error) {
      toast.error('Промокод недействителен');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-32"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4" />
            <p>Корзина пуста</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          Итоги заказа
          {totalItems > 0 && (
            <Badge variant="secondary">
              {totalItems}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Количество товаров */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Товаров в корзине:</span>
          <span className="font-medium">
            {totalItems} {totalItems === 1 ? 'товар' : totalItems < 5 ? 'товара' : 'товаров'}
          </span>
        </div>

        {/* Стоимость товаров */}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Стоимость товаров:</span>
          <span className="font-medium">{subtotal.toLocaleString('ru-RU')} ₸</span>
        </div>

        {/* Доставка */}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Доставка:</span>
          <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
            {shipping === 0 ? 'Бесплатно' : `${shipping.toLocaleString('ru-RU')} ₸`}
          </span>
        </div>

        {/* Сообщение о бесплатной доставке */}
        {shipping === 0 ? (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950 p-3 rounded-lg">
            <Gift className="w-4 h-4" />
            Бесплатная доставка от 50 000 ₸
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <Truck className="w-4 h-4" />
            До бесплатной доставки: {(50000 - subtotal).toLocaleString('ru-RU')} ₸
          </div>
        )}

        {/* Налог (если есть) */}
        {tax > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Налог:</span>
            <span className="font-medium">{tax.toLocaleString('ru-RU')} ₸</span>
          </div>
        )}

        {/* Скидка (если есть) */}
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Скидка:</span>
            <span className="font-medium">-{discount.toLocaleString('ru-RU')} ₸</span>
          </div>
        )}

        <Separator />

        {/* Промокод */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Промокод
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="Введите промокод"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-1"
              disabled={isApplyingPromo}
            />
            <Button
              variant="outline"
              onClick={applyPromoCode}
              disabled={!promoCode.trim() || isApplyingPromo}
              className="px-3"
            >
              {isApplyingPromo ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              ) : (
                <Percent className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Итого */}
        <div className="flex justify-between text-xl font-bold">
          <span>Итого:</span>
          <span>{total.toLocaleString('ru-RU')} ₸</span>
        </div>

        {/* Кнопки действий */}
        {showCheckoutButton && (
          <div className="space-y-3 pt-4">
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-medium" 
              asChild
            >
              <Link href="/checkout">
                <CreditCard className="w-5 h-5 mr-2" />
                Оформить заказ
              </Link>
            </Button>
            
            <Button variant="outline" className="w-full" asChild>
              <Link href="/catalog">
                Продолжить покупки
              </Link>
            </Button>
          </div>
        )}

        {/* Гарантии безопасности */}
        <div className="pt-4 space-y-3 border-t">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Гарантии
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-green-500" />
              Безопасная оплата
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Truck className="w-4 h-4 text-blue-500" />
              Быстрая доставка
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Gift className="w-4 h-4 text-purple-500" />
              Гарантия качества
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}