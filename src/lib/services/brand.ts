import { supabase } from '@/lib/supabaseClient';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website?: string;
  country?: string;
  is_active: boolean;
  sort_order: number;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export const brandService = {
  async getBrand(id: string): Promise<Brand | null> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async listBrands(): Promise<Brand[]> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createBrand(brand: Omit<Brand, 'id' | 'created_at' | 'updated_at'>): Promise<Brand> {
    const { data, error } = await supabase
      .from('brands')
      .insert([brand])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateBrand(id: string, brand: Partial<Omit<Brand, 'id' | 'created_at' | 'updated_at'>>): Promise<Brand> {
    const { data, error } = await supabase
      .from('brands')
      .update(brand)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteBrand(id: string): Promise<void> {
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
}; 