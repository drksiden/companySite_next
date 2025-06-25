// src/types/cart.ts - обновленная версия

export interface CartItem {
    id: string;
    variant_id: string;
    product_id: string;
    quantity: number;
    price: number;
    title: string;
    thumbnail?: string | null;
    product_name?: string;
    variant_name?: string;
  }
  
  export interface Cart {
    id: string;
    user_id?: string | null;
    session_id?: string | null; // Добавляем session_id
    items: CartItem[];
    total: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface CartContextType {
    cart: Cart | null;
    isLoading: boolean;
    totalItems: number;
    totalPrice: number;
    addItem: (variantId: string, quantity: number) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    syncCart: () => Promise<void>;
  }
  
  // Для совместимости с Supabase Product
  export interface ProductForCart {
    id: string;
    name: string;
    price?: number | null;
    image_urls?: string[] | null;
    thumbnail?: string | null;
  }
  
  // Для совместимости с Supabase ProductVariant
  export interface ProductVariantForCart {
    id: string;
    title: string;
    price: number;
    product_id: string;
    products?: ProductForCart | ProductForCart[]; // Может быть как объект, так и массив
  }