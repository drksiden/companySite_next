import { supabase } from '@/lib/supabaseClient';
import type {
    Collection,
    ApiResponse,
} from '@/types/catalog';
import { CatalogApiError, createApiResponse, handleSupabaseError } from './utils';

export const collectionsApi = {
    /**
     * Получить список коллекций
     */
    async getCollections(brandId?: string): Promise<ApiResponse<Collection[]>>
    {
        try
        {
            let query = supabase
                .from('collections')
                .select(`
          *,
          brand:brands(*)
        `)
                .eq('is_active', true)
                .order('sort_order')
                .order('name');

            if (brandId)
            {
                query = query.eq('brand_id', brandId);
            }

            const { data, error } = await query;

            if (error)
            {
                handleSupabaseError(error, 'getCollections');
            }

            return createApiResponse(data || []);
        } catch (error)
        {
            throw error instanceof CatalogApiError ? error : new CatalogApiError('Failed to fetch collections');
        }
    },

    /**
     * Получить коллекцию
     */
    async getCollection(slug: string): Promise<ApiResponse<Collection>>
    {
        try
        {
            const { data, error } = await supabase
                .from('collections')
                .select(`
          *,
          brand:brands(*)
        `)
                .eq('slug', slug)
                .eq('is_active', true)
                .single();

            if (error)
            {
                if (error.code === 'PGRST116')
                {
                    throw new CatalogApiError('Collection not found', 'NOT_FOUND');
                }
                handleSupabaseError(error, 'getCollection');
            }

            return createApiResponse(data);
        } catch (error)
        {
            throw error instanceof CatalogApiError ? error : new CatalogApiError('Failed to fetch collection');
        }
    }
};