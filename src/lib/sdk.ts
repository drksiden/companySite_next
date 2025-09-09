import { supabase } from "@/lib/supabaseClient";
import { catalogAPI } from "@/lib/api/catalog";

export interface User {
  id: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role: 'customer' | 'admin' | 'manager' | 'super_admin';
  company_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  currency: string;
  shipping_address: Record<string, any>;
  billing_address: Record<string, any>;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: any;
}

// Main SDK object
export const sdk = {
  // Catalog API
  catalog: catalogAPI,

  // Auth API
  auth: {
    async getCurrentUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw new Error(error.message);
      return user;
    },

    async signIn(email: string, password: string) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error(error.message);
      return data;
    },

    async signUp(email: string, password: string, metadata?: any) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      if (error) throw new Error(error.message);
      return data;
    },

    async signOut() {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
      return true;
    },

    async resetPassword(email: string) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw new Error(error.message);
      return true;
    },
  },

  // User Profile API
  profiles: {
    async getProfile(userId: string) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw new Error(error.message);
      return data as UserProfile;
    },

    async updateProfile(userId: string, updates: Partial<UserProfile>) {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as UserProfile;
    },

    async createProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profile)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as UserProfile;
    },
  },

  // Orders API
  orders: {
    async getOrders(userId?: string, filters?: {
      status?: string;
      limit?: number;
      offset?: number;
    }) {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            products(id, name, images, price)
          )
        `)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 20)) - 1);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data as Order[];
    },

    async getOrder(orderId: string) {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            products(id, name, images, price)
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw new Error(error.message);
      return data as Order;
    },

    async createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Order;
    },

    async updateOrderStatus(orderId: string, status: Order['status']) {
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Order;
    },
  },

  // Wishlist API
  wishlist: {
    async getWishlistItems(userId: string) {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          *,
          products(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data;
    },

    async addToWishlist(userId: string, productId: string) {
      const { data, error } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: userId,
          product_id: productId,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },

    async removeFromWishlist(userId: string, productId: string) {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) throw new Error(error.message);
      return true;
    },
  },

  // Cart API (if you're using database cart)
  cart: {
    async getCartItems(userId: string) {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products(*)
        `)
        .eq('user_id', userId);

      if (error) throw new Error(error.message);
      return data;
    },

    async addToCart(userId: string, productId: string, quantity: number = 1) {
      // Check if item already exists
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (existing) {
        // Update quantity
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw new Error(error.message);
        return data;
      } else {
        // Create new item
        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            user_id: userId,
            product_id: productId,
            quantity,
          })
          .select()
          .single();

        if (error) throw new Error(error.message);
        return data;
      }
    },

    async updateCartItem(itemId: string, quantity: number) {
      if (quantity <= 0) {
        return this.removeFromCart(itemId);
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },

    async removeFromCart(itemId: string) {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw new Error(error.message);
      return true;
    },

    async clearCart(userId: string) {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      if (error) throw new Error(error.message);
      return true;
    },
  },

  // Analytics API (for admin)
  analytics: {
    async getDashboardStats() {
      // This would typically involve multiple queries or a stored procedure
      const [products, users, orders] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
      ]);

      return {
        totalProducts: products.count || 0,
        totalUsers: users.count || 0,
        totalOrders: orders.count || 0,
        // Add more stats as needed
      };
    },

    async getRecentActivity(limit = 10) {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total_amount,
          created_at,
          user_profiles(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw new Error(error.message);
      return data;
    },
  },

  // Utility functions
  utils: {
    async uploadFile(file: File, bucket: string, path?: string) {
      const fileName = path || `${Date.now()}-${file.name}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (error) throw new Error(error.message);

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return {
        path: data.path,
        url: publicUrl,
      };
    },

    async deleteFile(bucket: string, path: string) {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw new Error(error.message);
      return true;
    },

    getPublicUrl(bucket: string, path: string) {
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return publicUrl;
    },
  },
};

// Export individual APIs for convenience
export const { catalog, auth, profiles, orders, wishlist, cart, analytics, utils } = sdk;

// Default export
export default sdk;
