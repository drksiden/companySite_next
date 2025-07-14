import { supabase } from '@/lib/supabaseClient';
import type {
    Brand,
    BrandWithStats,
    ApiResponse,
} from '@/types/catalog';
import { CatalogApiError, createApiResponse, handleSupabaseError } from './utils';

export const brandsApi = {
    /**
     * Получить список брендов
     */
    async getBrands(): Promise<ApiResponse<Brand[]>>
    {
        try
        {
            const { data, error } = await supabase
                .from('brands')
                .select('*')
                .eq('is_active', true)
                .order('sort_order')
                .order('name');

            if (error)
            {
                handleSupabaseError(error, 'getBrands');
            }

            return createApiResponse(data || []);
        } catch (error)
        {
            throw error instanceof CatalogApiError ? error : new CatalogApiError('Failed to fetch brands');
        }
    },

    /**
     * Получить бренд со статистикой
     */
    async getBrand(slug: string): Promise<ApiResponse<BrandWithStats>>
    {
        try
        {
            const { data, error } = await supabase
                .from('brands')
                .select(`
          *,
          products_count:products(count),
          categories:products(category:categories(*))
        `)
                .eq('slug', slug)
                .eq('is_active', true)
                .single();

            if (error)
            {
                if (error.code === 'PGRST116')
                {
                    throw new CatalogApiError('Brand not found', 'NOT_FOUND');
                }
                handleSupabaseError(error, 'getBrand');
            }

            // Обработка категорий (убираем дубликаты)
            const uniqueCategories = data.categories
                ?.map((p: any) => p.category)
                .filter((cat: any, index: number, arr: any[]) =>
                    arr.findIndex(c => c.id === cat.id) === index
                ) || [];

            const brandWithStats: BrandWithStats = {
                ...data,
                products_count: data.products_count?.[0]?.count || 0,
                categories: uniqueCategories
            };

            return createApiResponse(brandWithStats);
        } catch (error)
        {
            throw error instanceof CatalogApiError ? error : new CatalogApiError('Failed to fetch brand');
        }
    }
};