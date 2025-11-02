import { supabase } from '@/lib/supabaseClient';

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  brand_id?: string | null;
  category_id?: string | null;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const collectionService = {
  async getCollection(id: string): Promise<Collection | null> {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async listCollections(): Promise<Collection[]> {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createCollection(collection: Omit<Collection, 'id' | 'created_at' | 'updated_at'>): Promise<Collection> {
    const { data, error } = await supabase
      .from('collections')
      .insert([collection])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateCollection(id: string, collection: Partial<Omit<Collection, 'id' | 'created_at' | 'updated_at'>>): Promise<Collection> {
    const { data, error } = await supabase
      .from('collections')
      .update(collection)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteCollection(id: string): Promise<void> {
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
}; 