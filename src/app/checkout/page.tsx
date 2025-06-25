// src/app/checkout/page.tsx - страница оформления заказа
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useCart } from '@/providers/cart';
import { useSession } from 'next-auth/react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  ShoppingCart,
  User,
  MapPin,
  CreditCard,
  Package,
  AlertCircle,
  CheckCircle,
  Loader2,
  Phone,
  Mail,
  Building
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import type { CreateOrderData, Order } from '@/types/cart';

// Схема валидации формы заказа
const orderSchema = z.object({
  // Информация о клиенте
  firstName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  lastName: z.string().min(2, 'Фамилия должна содержать минимум 2 символа'),
  email: z.string().email('Введите корректный email'),
  phone: z.string().min(10, 'Введите корректный номер телефона'),
  company: z.string().optional(),

  // Адрес доставки
  address: z.string().min(5, 'Введите корректный адрес'),
  city: z.string().min(2, 'Введите название города'),
  postalCode: z.string().optional(),
  country: z.string().min(1, 'Выберите страну'),

  // Дополнительные поля
  notes: z.string().optional(),
  preferredDeliveryTime: z.string().optional(),
  
  // Соглашения
  agreeToTerms: z.boolean().refine(val => val === true, 'Необходимо согласиться с условиями'),
  subscribeToNews: z.boolean().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

const CheckoutPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { cart, isLoading: cartLoading, validateCart, createOrder, isEmpty } = useCart();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [orderCreated, setOrderCreated] = useState<Order | null>(null);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      firstName: session?.user?.name?.split(' ')[0] || '',
      lastName: session?.user?.name?.split(' ')[1] || '',
      email: session?.user?.email || '',
      phone: '',
      company: '',
      address: '',
      city: 'Алматы',
      postalCode: '',
      country: 'Казахстан',
      notes: '',
      preferredDeliveryTime: '',
      agreeToTerms: false,
      subscribeToNews: false,
    },
  });

  // Перенаправляем на корзину если она пуста
  useEffect(() => {
    if (!cartLoading && isEmpty) {
      router.push('/cart');
    }
  }, [cartLoading, isEmpty, router]);

  // Валидация корзины при загрузке
  useEffect(() => {
    const checkCart = async () => {
      if (cart && cart.items.length > 0) {
        const validation = await validateCart();
        if (!validation.isValid) {
          setValidationErrors(validation.errors);
        }
      }
    };
    
    checkCart();
  }, [cart, validateCart]);

  const onSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true);
    setValidationErrors([]);

    try {
      // Финальная валидация корзины
      const validation = await validateCart();
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        toast.error('Обнаружены ошибки в корзине');
        return;
      }

      // Подготовка данных заказа
      const orderData: CreateOrderData = {
        customerInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          company: data.company,
        },
        shippingAddress: {
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          country: data.country,
        },
        notes: data.notes,
        preferredDeliveryTime: data.preferredDeliveryTime,
      };

      // Создание заказа
      const order = await createOrder(orderData);
      setOrderCreated(order);

      // Перенаправление на страницу успеха
      router.push(`/order-success/${order.id}`);

    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Не удалось создать заказ. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Загрузка...</span>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return null; // Перенаправление происходит в useEffect
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
            { label: 'Оформление заказа', href: '/checkout' },
          ]}
          className="mb-8"
        />

        {/* Заголовок */}
        <div className="flex items-center gap-3 mb-8">
          <CreditCard className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Оформление заказа</h1>
        </div>

        {/* Ошибки валидации корзины */}
        {validationErrors.length > 0 && (
          <Card className="mb-8 border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive mb-2">
                    Обнаружены проблемы с заказом
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="text-destructive">{error}</li>
                    ))}
                  </ul>
                  <Button variant="outline" size="sm" className="mt-4" asChild>
                    <Link href="/cart">Вернуться к корзине</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Форма заказа */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Контактная информация */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Контактная информация
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Имя *</FormLabel>
                            <FormControl>
                              <Input placeholder="Иван" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Фамилия *</FormLabel>
                            <FormControl>
                              <Input placeholder="Иванов" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              Email *
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="ivan@example.com" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              Телефон *
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="+7 (700) 123-45-67" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            Компания (необязательно)
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="ТОО 'Рога и копыта'" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Адрес доставки */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Адрес доставки
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Адрес *</FormLabel>
                          <FormControl>
                            <Input placeholder="ул. Абая, д. 123, кв. 45" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Город *</FormLabel>
                            <FormControl>
                              <Input placeholder="Алматы" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Индекс</FormLabel>
                            <FormControl>
                              <Input placeholder="050000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Страна *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Выберите страну" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Казахстан">Казахстан</SelectItem>
                                <SelectItem value="Россия">Россия</SelectItem>
                                <SelectItem value="Кыргызстан">Кыргызстан</SelectItem>
                                <SelectItem value="Узбекистан">Узбекистан</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Дополнительная информация */}
                <Card>
                  <CardHeader>
                    <CardTitle>Дополнительная информация</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="preferredDeliveryTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Предпочтительное время доставки</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите время" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="9-12">9:00 - 12:00</SelectItem>
                              <SelectItem value="12-15">12:00 - 15:00</SelectItem>
                              <SelectItem value="15-18">15:00 - 18:00</SelectItem>
                              <SelectItem value="18-21">18:00 - 21:00</SelectItem>
                              <SelectItem value="any">Любое время</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Комментарий к заказу</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Дополнительные пожелания к доставке..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Соглашения */}
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <FormField
                      control={form.control}
                      name="agreeToTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal">
                              Я согласен с{' '}
                              <Link href="/terms" className="text-primary hover:underline">
                                условиями обслуживания
                              </Link>{' '}
                              и{' '}
                              <Link href="/privacy" className="text-primary hover:underline">
                                политикой конфиденциальности
                              </Link>
                              *
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subscribeToNews"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal">
                              Я хочу получать новости и специальные предложения
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Кнопка оформления заказа */}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="flex-1 py-6 text-lg font-medium"
                    disabled={isSubmitting || validationErrors.length > 0}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Оформление заказа...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Оформить заказ
                      </>
                    )}
                  </Button>
                  
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/cart">Вернуться к корзине</Link>
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Сводка заказа */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Ваш заказ
                    {cart && (
                      <Badge variant="secondary">
                        {cart.itemsCount}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Список товаров */}
                  {cart?.items.map((item) => (
                    <div key={item.id} className="flex gap-3 py-2">
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
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} × {item.price.toLocaleString('ru-RU')} ₸
                        </p>
                        <p className="text-sm font-semibold">
                          {(item.price * item.quantity).toLocaleString('ru-RU')} ₸
                        </p>
                      </div>
                    </div>
                  ))}

                  <Separator />

                  {/* Итоги */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Товары:</span>
                      <span>{cart?.subtotal.toLocaleString('ru-RU')} ₸</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Доставка:</span>
                      <span className={cart?.shipping === 0 ? 'text-green-600' : ''}>
                        {cart?.shipping === 0 ? 'Бесплатно' : `${cart?.shipping.toLocaleString('ru-RU')} ₸`}
                      </span>
                    </div>
                    {cart && cart.tax > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Налог:</span>
                        <span>{cart.tax.toLocaleString('ru-RU')} ₸</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Итого:</span>
                      <span>{cart?.total.toLocaleString('ru-RU')} ₸</span>
                    </div>
                  </div>

                  {/* Информация о доставке */}
                  {cart && cart.shipping === 0 && (
                    <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Бесплатная доставка!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;