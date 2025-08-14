"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";

export default function AddTestDataPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const addTestData = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();

      // Создаем тестовую валюту
      const { data: currency } = await supabase
        .from('currencies')
        .upsert({ code: 'KZT', symbol: '₸', name: 'Казахстанский тенге' })
        .select()
        .single();

      // Создаем тестовые бренды
      const { data: brands } = await supabase
        .from('brands')
        .upsert([
          { name: 'Samsung', slug: 'samsung', description: 'Южнокорейская компания' },
          { name: 'Apple', slug: 'apple', description: 'Американская компания' },
          { name: 'Xiaomi', slug: 'xiaomi', description: 'Китайская компания' },
        ])
        .select();

      // Создаем тестовые категории
      const { data: categories } = await supabase
        .from('categories')
        .upsert([
          { name: 'Смартфоны', slug: 'smartphones', description: 'Мобильные телефоны' },
          { name: 'Ноутбуки', slug: 'laptops', description: 'Портативные компьютеры' },
          { name: 'Планшеты', slug: 'tablets', description: 'Планшетные компьютеры' },
        ])
        .select();

      if (!brands || !categories || !currency) {
        throw new Error('Не удалось создать базовые данные');
      }

      // Создаем тестовые товары
      const testProducts = [
        {
          name: 'Samsung Galaxy S24',
          slug: 'samsung-galaxy-s24',
          sku: 'SAM-S24-256',
          short_description: 'Флагманский смартфон с AI функциями',
          description: 'Последний флагман от Samsung с передовыми AI функциями и камерой 200МП',
          base_price: 450000,
          sale_price: 399000,
          currency_id: currency.id,
          category_id: categories.find(c => c.slug === 'smartphones')?.id,
          brand_id: brands.find(b => b.slug === 'samsung')?.id,
          inventory_quantity: 15,
          is_featured: true,
          status: 'active',
          track_inventory: true,
          allow_backorder: false,
          min_stock_level: 5,
          sort_order: 1,
          view_count: 0,
          sales_count: 0,
          specifications: {
            'Экран': '6.2" Dynamic AMOLED 2X',
            'Процессор': 'Snapdragon 8 Gen 3',
            'ОЗУ': '8 ГБ',
            'Накопитель': '256 ГБ',
            'Камера': '200 МП + 12 МП + 10 МП',
            'Батарея': '4000 мАч'
          }
        },
        {
          name: 'iPhone 15 Pro',
          slug: 'iphone-15-pro',
          sku: 'APL-IP15P-256',
          short_description: 'Премиальный iPhone с титановым корпусом',
          description: 'iPhone 15 Pro с революционным чипом A17 Pro и титановым дизайном',
          base_price: 650000,
          currency_id: currency.id,
          category_id: categories.find(c => c.slug === 'smartphones')?.id,
          brand_id: brands.find(b => b.slug === 'apple')?.id,
          inventory_quantity: 8,
          is_featured: true,
          status: 'active',
          track_inventory: true,
          allow_backorder: false,
          min_stock_level: 3,
          sort_order: 2,
          view_count: 0,
          sales_count: 0,
          specifications: {
            'Экран': '6.1" Super Retina XDR',
            'Процессор': 'A17 Pro',
            'ОЗУ': '8 ГБ',
            'Накопитель': '256 ГБ',
            'Камера': '48 МП + 12 МП + 12 МП',
            'Батарея': 'До 23 часов видео'
          }
        },
        {
          name: 'Xiaomi 14 Ultra',
          slug: 'xiaomi-14-ultra',
          sku: 'XIA-14U-512',
          short_description: 'Камерофон с Leica объективами',
          description: 'Топовый смартфон Xiaomi с профессиональной камерой Leica',
          base_price: 380000,
          sale_price: 350000,
          currency_id: currency.id,
          category_id: categories.find(c => c.slug === 'smartphones')?.id,
          brand_id: brands.find(b => b.slug === 'xiaomi')?.id,
          inventory_quantity: 0,
          is_featured: false,
          status: 'active',
          track_inventory: true,
          allow_backorder: true,
          min_stock_level: 2,
          sort_order: 3,
          view_count: 0,
          sales_count: 0,
          specifications: {
            'Экран': '6.73" AMOLED',
            'Процессор': 'Snapdragon 8 Gen 3',
            'ОЗУ': '16 ГБ',
            'Накопитель': '512 ГБ',
            'Камера': '50 МП Leica + 50 МП + 50 МП',
            'Батарея': '5300 мАч'
          }
        },
        {
          name: 'MacBook Air M3',
          slug: 'macbook-air-m3',
          sku: 'APL-MBA-M3-256',
          short_description: 'Ультрабук на чипе M3',
          description: 'Легкий и мощный ноутбук Apple с чипом M3 и 18 часами автономности',
          base_price: 580000,
          currency_id: currency.id,
          category_id: categories.find(c => c.slug === 'laptops')?.id,
          brand_id: brands.find(b => b.slug === 'apple')?.id,
          inventory_quantity: 5,
          is_featured: true,
          status: 'active',
          track_inventory: true,
          allow_backorder: false,
          min_stock_level: 2,
          sort_order: 4,
          view_count: 0,
          sales_count: 0,
          specifications: {
            'Экран': '13.6" Liquid Retina',
            'Процессор': 'Apple M3',
            'ОЗУ': '8 ГБ',
            'Накопитель': '256 ГБ SSD',
            'Графика': '8-ядерный GPU',
            'Вес': '1.24 кг'
          }
        },
        {
          name: 'iPad Pro 12.9',
          slug: 'ipad-pro-129',
          sku: 'APL-IPP-129-256',
          short_description: 'Профессиональный планшет',
          description: 'Мощный планшет для профессионалов с экраном Liquid Retina XDR',
          base_price: 520000,
          currency_id: currency.id,
          category_id: categories.find(c => c.slug === 'tablets')?.id,
          brand_id: brands.find(b => b.slug === 'apple')?.id,
          inventory_quantity: 3,
          is_featured: false,
          status: 'active',
          track_inventory: true,
          allow_backorder: false,
          min_stock_level: 1,
          sort_order: 5,
          view_count: 0,
          sales_count: 0,
          specifications: {
            'Экран': '12.9" Liquid Retina XDR',
            'Процессор': 'Apple M2',
            'ОЗУ': '8 ГБ',
            'Накопитель': '256 ГБ',
            'Камера': '12 МП + 10 МП',
            'Вес': '682 г'
          }
        }
      ];

      const { error: productsError } = await supabase
        .from('products')
        .upsert(testProducts);

      if (productsError) {
        throw productsError;
      }

      setMessage({ type: 'success', text: 'Тестовые данные успешно добавлены!' });
    } catch (error: any) {
      console.error('Ошибка при добавлении тестовых данных:', error);
      setMessage({
        type: 'error',
        text: `Ошибка: ${error.message || 'Неизвестная ошибка'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Добавление тестовых данных</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Эта страница добавит тестовые товары, категории и бренды в каталог для демонстрации.
          </p>

          <div className="space-y-2">
            <h3 className="font-semibold">Будет создано:</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>3 категории (Смартфоны, Ноутбуки, Планшеты)</li>
              <li>3 бренда (Samsung, Apple, Xiaomi)</li>
              <li>5 товаров с разными статусами наличия</li>
              <li>Валюта (KZT)</li>
            </ul>
          </div>

          {message && (
            <Alert className={message.type === 'error' ? 'border-red-200' : 'border-green-200'}>
              {message.type === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={addTestData}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Добавление...' : 'Добавить тестовые данные'}
          </Button>

          <p className="text-xs text-muted-foreground">
            После добавления данных перейдите в <a href="/catalog" className="underline">каталог</a> для просмотра результата.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
