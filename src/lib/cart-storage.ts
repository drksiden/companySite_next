// src/lib/cart-storage.ts - утилиты для работы с локальным хранилищем
import type { Cart } from '@/types/cart';

export class CartStorage {
  private static readonly CART_KEY = 'shopping_cart';
  private static readonly CART_ID_KEY = 'cart_id';

  static getCart(): Cart | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const cartData = localStorage.getItem(this.CART_KEY);
      if (!cartData) return null;
      
      const cart = JSON.parse(cartData) as Cart;
      
      // Проверяем валидность данных корзины
      if (!cart.id || !Array.isArray(cart.items)) {
        this.clearCart();
        return null;
      }
      
      return cart;
    } catch (error) {
      console.error('Error reading cart from localStorage:', error);
      this.clearCart();
      return null;
    }
  }

  static saveCart(cart: Cart): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
      localStorage.setItem(this.CART_ID_KEY, cart.id);
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  static clearCart(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(this.CART_KEY);
      localStorage.removeItem(this.CART_ID_KEY);
    } catch (error) {
      console.error('Error clearing cart from localStorage:', error);
    }
  }

  static getCartId(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      return localStorage.getItem(this.CART_ID_KEY);
    } catch (error) {
      console.error('Error reading cart ID from localStorage:', error);
      return null;
    }
  }

  static generateCartId(): string {
    return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// src/lib/cart-utils.ts - утилиты для расчетов корзины
import type { Cart, CartItem } from '@/types/cart';
import { CartStorage } from './cart-storage';

export class CartUtils {
  static calculateSubtotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  static calculateItemsCount(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }

  static calculateShipping(subtotal: number): number {
    // Бесплатная доставка от 50,000 ₸
    return subtotal >= 50000 ? 0 : 2000;
  }

  static calculateTax(subtotal: number): number {
    // НДС 12% в Казахстане (если применимо)
    return 0; // Пока отключаем
  }

  static calculateDiscount(subtotal: number, promoCode?: string): number {
    // Логика применения промокодов
    return 0; // Пока отключаем
  }

  static calculateTotal(subtotal: number, shipping: number, tax: number, discount: number): number {
    return Math.max(0, subtotal + shipping + tax - discount);
  }

  static createEmptyCart(): Cart {
    const now = new Date().toISOString();
    return {
      id: CartStorage.generateCartId(),
      items: [],
      subtotal: 0,
      total: 0,
      itemsCount: 0,
      createdAt: now,
      updatedAt: now,
      shipping: 0,
      tax: 0,
      discount: 0,
    };
  }

  static updateCartTotals(cart: Cart): Cart {
    const subtotal = this.calculateSubtotal(cart.items);
    const shipping = this.calculateShipping(subtotal);
    const tax = this.calculateTax(subtotal);
    const discount = cart.discount || 0;
    const total = this.calculateTotal(subtotal, shipping, tax, discount);
    const itemsCount = this.calculateItemsCount(cart.items);

    return {
      ...cart,
      subtotal,
      shipping,
      tax,
      total,
      itemsCount,
      updatedAt: new Date().toISOString(),
    };
  }

  static validateCartItem(item: CartItem): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!item.id) errors.push('Отсутствует ID товара');
    if (!item.productId) errors.push('Отсутствует ID продукта');
    if (!item.title) errors.push('Отсутствует название товара');
    if (item.quantity <= 0) errors.push('Количество должно быть больше 0');
    if (item.price < 0) errors.push('Цена не может быть отрицательной');
    if (item.maxQuantity && item.quantity > item.maxQuantity) {
      errors.push(`Количество не может превышать ${item.maxQuantity}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static generateItemId(productId: string, variantId?: string): string {
    return variantId ? `${productId}_${variantId}` : productId;
  }
}