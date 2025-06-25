'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { supabase } from '@/lib/supabaseClient';
import { Cart, CartItem, CartContextType } from '@/lib/types/cart'; // Импортируем ваши типы

const CartContext = createContext<CartContextType | null>(null);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const { data: session, status } = useSession();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId] = useState(() => {
    // Генерируем уникальный ID сессии для гостей
    if (typeof window !== 'undefined') {
      let stored = localStorage.getItem('cart_session_id');
      if (!stored) {
        stored = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('cart_session_id', stored);
      }
      return stored;
    }
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  });

  // Получение данных о товаре/варианте
  const getProductData = useCallback(async (variantId: string) => {
    try {
      // Сначала пытаемся найти как вариант продукта
      const { data: variantData, error: variantError } = await supabase
        .from('product_variants')
        .select(`
          id,
          title,
          price,
          product_id,
          products:product_id (
            id,
            title,
            thumbnail
          )
        `)
        .eq('id', variantId)
        .single();

      if (variantData && !variantError) {
        return {
          variant_id: variantData.id,
          product_id: variantData.product_id,
          price: variantData.price || 0,
          title: variantData.products?.title 
            ? `${variantData.products.title} - ${variantData.title}` 
            : variantData.title || 'Неизвестный товар',
          thumbnail: variantData.products?.thumbnail || null
        };
      }

      // Если не нашли как вариант, ищем как основной продукт
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('id, name, price, image_urls')
        .eq('id', variantId)
        .single();

      if (productData && !productError) {
        return {
          variant_id: productData.id,
          product_id: productData.id,
          price: productData.price || 0,
          title: productData.name || 'Неизвестный товар',
          thumbnail: Array.isArray(productData.image_urls) && productData.image_urls.length > 0 
            ? productData.image_urls[0] 
            : null
        };
      }

      throw new Error('Product not found');
    } catch (error) {
      console.error('Error fetching product data:', error);
      throw error;
    }
  }, []);

  // Создание новой корзины
  const createCart = useCallback(async (): Promise<Cart> => {
    try {
      const cartData = {
        items: [],
        total: 0,
        ...(session?.user ? { user_id: session.user.id } : { session_id: sessionId })
      };

      const { data, error } = await supabase
        .from('carts')
        .insert([cartData])
        .select()
        .single();

      if (error) throw error;

      const newCart = data as Cart;
      setCart(newCart);
      
      // Сохраняем ID корзины в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart_id', newCart.id);
      }

      return newCart;
    } catch (error) {
      console.error('Error creating cart:', error);
      throw error;
    }
  }, [session?.user, sessionId]);

  // Загрузка корзины
  const loadCart = useCallback(async (): Promise<Cart | null> => {
    try {
      let query = supabase.from('carts').select('*');

      if (session?.user) {
        // Для авторизованных пользователей
        query = query.eq('user_id', session.user.id);
      } else {
        // Для гостей - ищем по session_id или cart_id из localStorage
        const savedCartId = typeof window !== 'undefined' ? localStorage.getItem('cart_id') : null;
        
        if (savedCartId) {
          query = query.eq('id', savedCartId);
        } else {
          query = query.eq('session_id', sessionId);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const foundCart = data[0] as Cart;
        setCart(foundCart);
        
        // Обновляем localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('cart_id', foundCart.id);
        }
        
        return foundCart;
      }

      return null;
    } catch (error) {
      console.error('Error loading cart:', error);
      return null;
    }
  }, [session?.user, sessionId]);

  // Синхронизация корзины при входе/выходе
  const syncCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const existingCart = await loadCart();
      
      if (!existingCart) {
        // Если корзины нет, создаем новую
        await createCart();
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
      toast.error('Не удалось синхронизировать корзину');
    } finally {
      setIsLoading(false);
    }
  }, [loadCart, createCart]);

  // Обновление корзины в базе данных
  const updateCartInDB = useCallback(async (updatedItems: CartItem[]) => {
    if (!cart) return;

    try {
      const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const { data, error } = await supabase
        .from('carts')
        .update({ 
          items: updatedItems, 
          total,
          updated_at: new Date().toISOString()
        })
        .eq('id', cart.id)
        .select()
        .single();

      if (error) throw error;

      setCart(data as Cart);
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  }, [cart]);

  // Добавление товара в корзину
  const addItem = useCallback(async (variantId: string, quantity: number = 1) => {
    try {
      // Получаем данные о товаре
      const productData = await getProductData(variantId);
      
      let currentCart = cart;
      
      // Если корзины нет, создаем
      if (!currentCart) {
        currentCart = await createCart();
      }

      const existingItemIndex = currentCart.items.findIndex(
        item => item.variant_id === variantId
      );

      let updatedItems: CartItem[];

      if (existingItemIndex > -1) {
        // Увеличиваем количество существующего товара
        updatedItems = [...currentCart.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
      } else {
        // Добавляем новый товар
        const newItem: CartItem = {
          id: crypto.randomUUID(),
          variant_id: productData.variant_id,
          product_id: productData.product_id,
          quantity,
          price: productData.price,
          title: productData.title,
          thumbnail: productData.thumbnail
        };
        updatedItems = [...currentCart.items, newItem];
      }

      await updateCartInDB(updatedItems);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  }, [cart, createCart, getProductData, updateCartInDB]);

  // Обновление количества товара
  const updateItemQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (!cart) return;

    try {
      const updatedItems = cart.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ).filter(item => item.quantity > 0); // Удаляем товары с количеством 0

      await updateCartInDB(updatedItems);
    } catch (error) {
      console.error('Error updating item quantity:', error);
      throw error;
    }
  }, [cart, updateCartInDB]);

  // Удаление товара из корзины
  const removeItem = useCallback(async (itemId: string) => {
    if (!cart) return;

    try {
      const updatedItems = cart.items.filter(item => item.id !== itemId);
      await updateCartInDB(updatedItems);
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  }, [cart, updateCartInDB]);

  // Очистка корзины
  const clearCart = useCallback(async () => {
    if (!cart) return;

    try {
      await updateCartInDB([]);
      toast.success('Корзина очищена');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Не удалось очистить корзину');
    }
  }, [cart, updateCartInDB]);

  // Инициализация корзины при загрузке
  useEffect(() => {
    if (status !== 'loading') {
      syncCart();
    }
  }, [status, syncCart]);

  // Синхронизация при изменении сессии
  useEffect(() => {
    if (status === 'authenticated' && session?.user && cart?.session_id) {
      // Пользователь вошел в систему, нужно привязать корзину к пользователю
      const migrateCart = async () => {
        try {
          await supabase
            .from('carts')
            .update({ 
              user_id: session.user.id, 
              session_id: null 
            })
            .eq('id', cart.id);
          
          await syncCart();
        } catch (error) {
          console.error('Error migrating cart:', error);
        }
      };
      
      migrateCart();
    }
  }, [status, session?.user, cart?.session_id, syncCart]);

  // Вычисляемые значения
  const totalItems = useMemo(() => 
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0
  , [cart?.items]);

  const totalPrice = useMemo(() => 
    cart?.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0
  , [cart?.items]);

  const value = useMemo(() => ({
    cart,
    isLoading,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
    syncCart
  }), [
    cart,
    isLoading,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
    syncCart
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};