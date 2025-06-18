// src/lib/api/catalog.ts

import { supabase } from '@/lib/supabaseClient';
import type {
    Product,
    Category,
    Brand,
    Collection,
    ProductWithRelations,
    CategoryWithChildren,
    CategoryTree,
    SearchProductsParams,
    SearchProductsResult,
    CategoryFilter,
    ProductListParams,
    ProductListResponse,
    ApiResponse,
    BrandWithStats
} from '@/types/catalog';

// ==============================================
// БАЗОВЫЕ ФУНКЦИИ API
// ==============================================

class CatalogApiError extends Error
{
    constructor(message: string, public code?: string, public details?: any)
    {
        super(message);
        this.name = 'CatalogApiError';
    }
}

const handleSupabaseError = (error: any, context: string): never =>
{
    console.error(`Supabase error in ${context}:`, error);
    throw new CatalogApiError(
        error.message || `Error in ${context}`,
        error.code,
        error.details
    );
};

const createApiResponse = <T>(data: T, meta?: any): ApiResponse<T> => ({
    data,
    success: true,
    meta
});

// ==============================================
// ПРОДУКТЫ
// ==============================================

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
                    query = query.order('base_price', { ascending: true, nullsLast: true });
                    break;
                case 'price_desc':
                    query = query.order('base_price', { ascending: false, nullsLast: true });
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
                formatted_price: formatPrice(product.sale_price || product.base_price, product.currency?.code)
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

// ==============================================
// КАТЕГОРИИ
// ==============================================

export const categoriesApi = {
    /**
     * Получить список категорий
     */
    async getCategories(parentId?: string): Promise<ApiResponse<Category[]>>
    {
        try
        {
            let query = supabase
                .from('categories')
                .select('*')
                .eq('is_active', true)
                .order('sort_order')
                .order('name');

            if (parentId)
            {
                query = query.eq('parent_id', parentId);
            } else
            {
                query = query.is('parent_id', null);
            }

            const { data, error } = await query;

            if (error)
            {
                handleSupabaseError(error, 'getCategories');
            }

            return createApiResponse(data || []);
        } catch (error)
        {
            throw error instanceof CatalogApiError ? error : new CatalogApiError('Failed to fetch categories');
        }
    },

    /**
     * Получить категорию с дочерними категориями и товарами
     */
    async getCategory(slug: string): Promise<ApiResponse<CategoryWithChildren>>
    {
        try
        {
            const { data, error } = await supabase
                .from('categories')
                .select(`
          *,
          children:categories!parent_id(
            *,
            products_count:products(count)
          ),
          products_count:products(count)
        `)
                .eq('slug', slug)
                .eq('is_active', true)
                .single();

            if (error)
            {
                if (error.code === 'PGRST116')
                {
                    throw new CatalogApiError('Category not found', 'NOT_FOUND');
                }
                handleSupabaseError(error, 'getCategory');
            }

            return createApiResponse(data);
        } catch (error)
        {
            throw error instanceof CatalogApiError ? error : new CatalogApiError('Failed to fetch category');
        }
    },

    /**
     * Получить дерево категорий
     */
    async getCategoryTree(): Promise<ApiResponse<CategoryTree[]>>
    {
        try
        {
            const { data, error } = await supabase.rpc('get_category_tree');

            if (error)
            {
                handleSupabaseError(error, 'getCategoryTree');
            }

            // Построение дерева из плоского списка
            const tree = buildCategoryTree(data || []);

            return createApiResponse(tree);
        } catch (error)
        {
            throw error instanceof CatalogApiError ? error : new CatalogApiError('Failed to fetch category tree');
        }
    },

    /**
     * Получить фильтры для категории
     */
    async getCategoryFilters(categoryId: string): Promise<ApiResponse<CategoryFilter[]>>
    {
        try
        {
            const { data, error } = await supabase.rpc('get_category_filters', {
                category_id_param: categoryId
            });

            if (error)
            {
                handleSupabaseError(error, 'getCategoryFilters');
            }

            return createApiResponse(data || []);
        } catch (error)
        {
            throw error instanceof CatalogApiError ? error : new CatalogApiError('Failed to fetch category filters');
        }
    }
};

// ==============================================
// БРЕНДЫ
// ==============================================

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

// ==============================================
// КОЛЛЕКЦИИ
// ==============================================

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

// ==============================================
// УТИЛИТАРНЫЕ ФУНКЦИИ
// ==============================================

/**
 * Форматирование цены
 */
const formatPrice = (amount?: number, currencyCode = 'KZT'): string =>
{
    if (typeof amount !== 'number')
    {
        return 'Цена по запросу';
    }

    const formatOptions: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    };

    // Для некоторых валют используем дробные части
    if (['USD', 'EUR'].includes(currencyCode))
    {
        formatOptions.minimumFractionDigits = 2;
        formatOptions.maximumFractionDigits = 2;
    }

    return new Intl.NumberFormat('ru-RU', formatOptions).format(amount);
};

/**
 * Построение дерева категорий из плоского списка
 */
const buildCategoryTree = (categories: Category[]): CategoryTree[] =>
{
    const categoryMap = new Map<string, CategoryTree>();
    const rootCategories: CategoryTree[] = [];

    // Создаем мапу всех категорий
    categories.forEach(category =>
    {
        categoryMap.set(category.id, { ...category, children: [] });
    });

    // Строим дерево
    categories.forEach(category =>
    {
        const categoryNode = categoryMap.get(category.id)!;

        if (category.parent_id)
        {
            const parent = categoryMap.get(category.parent_id);
            if (parent)
            {
                parent.children.push(categoryNode);
            }
        } else
        {
            rootCategories.push(categoryNode);
        }
    });

    return rootCategories;
};

// ==============================================
// ЭКСПОРТ API КЛИЕНТА
// ==============================================

export const catalogApi = {
    products: productsApi,
    categories: categoriesApi,
    brands: brandsApi,
    collections: collectionsApi
};

export default catalogApi;