import { createClient } from "@/utils/supabase/client";
import type {
  ProductListParams,
  ProductListResponse,
  SearchProductsResult,
  ApiResponse,
} from "@/types/catalog";

export const productsApi = {
  /**
   * Получить список продуктов с фильтрацией и пагинацией
   */
  async getProducts(
    params: ProductListParams = {},
  ): Promise<ApiResponse<ProductListResponse>> {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = "name_asc",
        categories,
        brands,
        collections,
        priceRange,
        inStockOnly,
        featured,
        search,
      } = params;

      const offset = (page - 1) * limit;
      const supabase = createClient();

      // Базовый запрос
      let query = supabase
        .from("products")
        .select(
          `
          id,
          name,
          slug,
          sku,
          short_description,
          base_price,
          sale_price,
          thumbnail,
          inventory_quantity,
          is_featured,
          status,
          created_at,
          brand:brands(
            id,
            name,
            slug
          ),
          category:categories(
            id,
            name,
            slug
          )
        `,
          { count: "exact" },
        )
        .eq("status", "active");

      // Применяем фильтры
      if (categories?.length) {
        query = query.in("category_id", categories);
      }

      if (brands?.length) {
        query = query.in("brand_id", brands);
      }

      if (collections?.length) {
        query = query.in("collection_id", collections);
      }

      if (priceRange?.min && priceRange.min > 0) {
        query = query.gte("base_price", priceRange.min);
      }

      if (priceRange?.max && priceRange.max > 0) {
        query = query.lte("base_price", priceRange.max);
      }

      if (inStockOnly) {
        query = query.gt("inventory_quantity", 0);
      }

      if (featured) {
        query = query.eq("is_featured", true);
      }

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      // Применяем сортировку
      switch (sortBy) {
        case "name_asc":
          query = query.order("name", { ascending: true });
          break;
        case "name_desc":
          query = query.order("name", { ascending: false });
          break;
        case "price_asc":
          query = query.order("base_price", { ascending: true });
          break;
        case "price_desc":
          query = query.order("base_price", { ascending: false });
          break;
        case "created_desc":
          query = query.order("created_at", { ascending: false });
          break;
        case "created_asc":
          query = query.order("created_at", { ascending: true });
          break;
        case "featured":
          query = query
            .order("is_featured", { ascending: false })
            .order("name");
          break;
        default:
          query = query.order("name", { ascending: true });
      }

      // Применяем пагинацию
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error("Supabase error in getProducts:", error);
        return {
          data: undefined,
          success: false,
          error: error.message || "Failed to fetch products",
        };
      }

      // Обогащаем продукты вычисляемыми полями
      const products: SearchProductsResult[] = (data || []).map((product) => {
        const finalPrice = product.sale_price || product.base_price;
        const isOnSale = !!(
          product.sale_price && product.sale_price < product.base_price
        );
        const discountPercentage = isOnSale
          ? Math.round(
              ((product.base_price - product.sale_price) / product.base_price) *
                100,
            )
          : 0;

        return {
          ...product,
          final_price: finalPrice,
          is_on_sale: isOnSale,
          discount_percentage: discountPercentage,
          formatted_price: `${finalPrice.toLocaleString("ru-RU")} ₸`,
        };
      });

      const totalPages = Math.ceil((count || 0) / limit);

      const response: ProductListResponse = {
        products,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        filters: {
          categories: [],
          brands: [],
          priceRange: priceRange || { min: 0, max: 0 },
          attributes: [],
        },
      };

      return {
        data: response,
        success: true,
      };
    } catch (error) {
      console.error("API error in getProducts:", error);
      return {
        data: undefined,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};
