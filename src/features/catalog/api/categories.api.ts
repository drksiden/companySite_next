import { supabase } from '@/lib/supabaseClient';
import type {
    Category,
    CategoryWithChildren,
    CategoryTree,
    CategoryFilter,
    ApiResponse,
} from '@/types/catalog';
import { CatalogApiError, createApiResponse, handleSupabaseError } from './utils';

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