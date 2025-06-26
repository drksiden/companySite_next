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