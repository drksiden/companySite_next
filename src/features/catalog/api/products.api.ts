import { supabase } from '@/lib/supabaseClient';
import type {
    ProductWithRelations,
    SearchProductsParams,
    SearchProductsResult,
    ProductListParams,
    ProductListResponse,
    ApiResponse,
} from '@/types/catalog';
import { CatalogApiError, createApiResponse, formatPrice, handleSupabaseError } from './utils';


export const productsApi = {
    /**
     * Получить список продуктов с фильтрацией и пагинацией
     */
    async getProducts(params: ProductListParams = {}): Promise<ApiResponse<ProductListResponse>>
    {
        try
        {
            const {
                page = 1,
                limit = 20,
                sortBy = 'name_asc',
                categories,
                brands,
                collections,
                priceRange,
                inStockOnly,
                featured,
                search
            } = params;

            const offset = (page - 1) * limit;

            // Базовый запрос
            let query = supabase
                .from('products')
                .select(`
          id,
          name,
          slug,
          short_description,
          base_price,
          sale_price,
          thumbnail,
          inventory_quantity,
          is_featured,
          status,
          created_at,
          brand:brands(id, name, slug),
          category:categories(id, name, slug),
          currency:currencies(code, symbol)
        `, { count: 'exact' })
                .eq('status', 'active');

            // Применяем фильтры
            if (categories?.length)
            {
                query = query.in('category_id', categories);
            }

            if (brands?.length)
            {
                query = query.in('brand_id', brands);
            }

            if (collections?.length)
            {
                query = query.in('collection_id', collections);
            }

            if (priceRange)
            {
                if (priceRange.min > 0)
                {
                    query = query.gte('base_price', priceRange.min);
                }
                if (priceRange.max > 0)
                {
                    query = query.lte('base_price', priceRange.max);
                }
            }

            if (inStockOnly)
            {
                query = query.gt('inventory_quantity', 0);
            }

            if (featured)
            {
                query = query.eq('is_featured', true);
            }

            if (search)
            {
                query = query.textSearch('name', search, { type: 'websearch' });
            }

            // Применяем сортировку
            switch (sortBy)
            {
                case 'name_asc':
                    query = query.order('name', { ascending: true });
                    break;
                case 'name_desc':
                    query = query.order('name', { ascending: false });
                    break;
                case 'price_asc':
                    query = query.order('base_price', { ascending: true, nullsFirst: true });
                    break;
                case 'price_desc':
                    query = query.order('base_price', { ascending: false, nullsFirst: true });
                    break;
                case 'created_asc':
                    query = query.order('created_at', { ascending: true });
                    break;
                case 'created_desc':
                    query = query.order('created_at', { ascending: false });
                    break;
                case 'featured':
                    query = query.order('is_featured', { ascending: false }).order('sort_order').order('name');
                    break;
                case 'popularity':
                    query = query.order('view_count', { ascending: false });
                    break;
            }

            // Применяем пагинацию
            query = query.range(offset, offset + limit - 1);

            const { data, error, count } = await query;

            if (error)
            {
                handleSupabaseError(error, 'getProducts');
            }

            const products = (data || []).map(product => ({
                ...product,
                final_price: product.sale_price || product.base_price,
                is_on_sale: !!(product.sale_price && product.sale_price < product.base_price),
                formatted_price: formatPrice(product.sale_price || product.base_price, product.currency?.[0]?.code)
            })) as SearchProductsResult[];

            const totalPages = Math.ceil((count || 0) / limit);

            const response: ProductListResponse = {
                products,
                pagination: {
                    page,
                    limit,
                    total: count || 0,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                },
                filters: {
                    categories: [], // TODO: Implement filter aggregation
                    brands: [],
                    priceRange: { min: 0, max: 0 },
                    attributes: []
                }
            };

            return createApiResponse(response);
        } catch (error)
        {
            throw error instanceof CatalogApiError ? error : new CatalogApiError('Failed to fetch products');
        }
    },

    /**
     * Получить продукт по slug с полной информацией
     */
    async getProduct(slug: string): Promise<ApiResponse<ProductWithRelations>>
    {
        try
        {
            const { data, error } = await supabase
                .from('products')
                .select(`
          *,
          category:categories(*),
          brand:brands(*),
          collection:collections(*),
          currency:currencies(*),
          unit:units(*),
          variants:product_variants(*),
          attribute_values:product_attribute_values(
            *,
            attribute:attributes(*)
          )
        `)
                .eq('slug', slug)
                .eq('status', 'active')
                .single();

            if (error)
            {
                if (error.code === 'PGRST116')
                {
                    throw new CatalogApiError('Product not found', 'NOT_FOUND');
                }
                handleSupabaseError(error, 'getProduct');
            }

            if (!data)
            {
                throw new CatalogApiError('Product not found', 'NOT_FOUND');
            }

            // Обогащаем данные продукта
            const product: ProductWithRelations = {
                ...data,
                final_price: data.sale_price || data.base_price,
                is_on_sale: !!(data.sale_price && data.sale_price < data.base_price),
                discount_percentage: data.sale_price && data.base_price
                    ? Math.round(((data.base_price - data.sale_price) / data.base_price) * 100)
                    : undefined,
                formatted_price: formatPrice(data.sale_price || data.base_price, data.currency?.code)
            };

            return createApiResponse(product);
        } catch (error)
        {
            throw error instanceof CatalogApiError ? error : new CatalogApiError('Failed to fetch product');
        }
    },

    /**
     * Поиск продуктов с полнотекстовым поиском
     */
    async searchProducts(params: SearchProductsParams): Promise<ApiResponse<SearchProductsResult[]>>
    {
        try
        {
            const {
                search_query,
                category_ids,
                brand_ids,
                min_price,
                max_price,
                in_stock_only = false,
                limit = 20,
                offset = 0
            } = params;

            // Используем функцию поиска из базы данных
            const { data, error } = await supabase.rpc('search_products', {
                search_query,
                category_ids,
                brand_ids,
                min_price,
                max_price,
                in_stock_only,
                limit_count: limit,
                offset_count: offset
            });

            if (error)
            {
                handleSupabaseError(error, 'searchProducts');
            }

            return createApiResponse(data || []);
        } catch (error)
        {
            throw error instanceof CatalogApiError ? error : new CatalogApiError('Failed to search products');
        }
    }
};