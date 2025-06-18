import { supabase } from '@/lib/supabaseClient';
import { Cart, CartItem } from '../types/cart';

export const cartService = {
  async createCart(): Promise<Cart> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('carts')
      .insert([{ 
        user_id: user.id,
        items: [], 
        total: 0 
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getCart(cartId: string): Promise<Cart | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('carts')
      .select('*')
      .eq('id', cartId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  async addItem(cartId: string, item: Omit<CartItem, 'id'>): Promise<Cart> {
    const cart = await this.getCart(cartId);
    if (!cart) throw new Error('Cart not found');

    const existingItemIndex = cart.items.findIndex(
      (i) => i.variant_id === item.variant_id
    );

    let updatedItems: CartItem[];
    if (existingItemIndex > -1) {
      updatedItems = [...cart.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + item.quantity,
      };
    } else {
      updatedItems = [...cart.items, { ...item, id: crypto.randomUUID() }];
    }

    const total = updatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const { data, error } = await supabase
      .from('carts')
      .update({ items: updatedItems, total })
      .eq('id', cartId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateItemQuantity(
    cartId: string,
    itemId: string,
    quantity: number
  ): Promise<Cart> {
    const cart = await this.getCart(cartId);
    if (!cart) throw new Error('Cart not found');

    const updatedItems = cart.items.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );

    const total = updatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const { data, error } = await supabase
      .from('carts')
      .update({ items: updatedItems, total })
      .eq('id', cartId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeItem(cartId: string, itemId: string): Promise<Cart> {
    const cart = await this.getCart(cartId);
    if (!cart) throw new Error('Cart not found');

    const updatedItems = cart.items.filter((item) => item.id !== itemId);
    const total = updatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const { data, error } = await supabase
      .from('carts')
      .update({ items: updatedItems, total })
      .eq('id', cartId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
}; 