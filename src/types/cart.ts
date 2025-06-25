// src/types/cart.ts - ПОЛНАЯ замена существующего файла
export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  title: string;
  thumbnail?: string | null;
  sku?: string;
  // Дополнительные поля для отображения
  brand?: string;
  category?: string;
  maxQuantity?: number; // Максимальное доступное количество
}

export interface Cart {
  id: string; // UUID для идентификации корзины
  items: CartItem[];
  subtotal: number;
  total: number;
  itemsCount: number;
  createdAt: string;
  updatedAt: string;
  // Дополнительные поля для расчетов
  shipping?: number;
  tax?: number;
  discount?: number;
}

export interface CartContextType {
  // Состояние корзины
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  
  // Основные действия
  addItem: (productId: string, variantId?: string, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Вычисляемые значения
  totalItems: number;
  totalPrice: number;
  isEmpty: boolean;
  
  // Дополнительные функции
  getItem: (productId: string, variantId?: string) => CartItem | undefined;
  hasItem: (productId: string, variantId?: string) => boolean;
  
  // Функции для оформления заказа
  validateCart: () => Promise<{ isValid: boolean; errors: string[] }>;
  createOrder: (orderData: CreateOrderData) => Promise<Order>;
}

// Типы для заказов
export interface CreateOrderData {
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company?: string;
  };
  shippingAddress: {
    address: string;
    city: string;
    postalCode?: string;
    country: string;
  };
  billingAddress?: {
    address: string;
    city: string;
    postalCode?: string;
    country: string;
  };
  notes?: string;
  preferredDeliveryTime?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  customerInfo: CreateOrderData['customerInfo'];
  shippingAddress: CreateOrderData['shippingAddress'];
  billingAddress?: CreateOrderData['billingAddress'];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}