"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import type {
  SearchProductsResult,
  Category,
  Brand,
  Collection,
  ProductFilters,
  ProductSortBy,
  ProductListResponse,
} from "@/types/catalog";

// Типы для состояния каталога
interface CatalogState {
  // Данные
  products: SearchProductsResult[];
  categories: Category[];
  brands: Brand[];
  collections: Collection[];

  // Пагинация
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  // Фильтры и сортировка
  filters: ProductFilters;
  sortBy: ProductSortBy;

  // UI состояние
  isLoading: boolean;
  error: string | null;
  viewMode: "grid" | "list";
  showFilters: boolean;

  // Избранное и корзина (временно)
  wishlist: Set<string>;
  cart: Map<string, number>;

  // Производительность
  lastFetch: number;
  prefetchedPages: Set<number>;
}

// Типы действий
type CatalogAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_PRODUCTS"; payload: ProductListResponse }
  | { type: "SET_CATEGORIES"; payload: Category[] }
  | { type: "SET_BRANDS"; payload: Brand[] }
  | { type: "SET_COLLECTIONS"; payload: Collection[] }
  | { type: "SET_FILTERS"; payload: Partial<ProductFilters> }
  | { type: "CLEAR_FILTERS" }
  | { type: "SET_SORT"; payload: ProductSortBy }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_VIEW_MODE"; payload: "grid" | "list" }
  | { type: "TOGGLE_FILTERS" }
  | { type: "ADD_TO_WISHLIST"; payload: string }
  | { type: "REMOVE_FROM_WISHLIST"; payload: string }
  | { type: "ADD_TO_CART"; payload: { productId: string; quantity: number } }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "CLEAR_CART" }
  | { type: "PREFETCH_PAGE"; payload: number }
  | { type: "RESET" };

// Начальное состояние
const initialState: CatalogState = {
  products: [],
  categories: [],
  brands: [],
  collections: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  filters: {
    search: undefined,
    categories: [],
    brands: [],
    collections: [],
    inStockOnly: false,
    featured: false,
    priceRange: { min: 0, max: 0 },
  },
  sortBy: "name_asc",
  isLoading: false,
  error: null,
  viewMode: "grid",
  showFilters: false,
  wishlist: new Set(),
  cart: new Map(),
  lastFetch: 0,
  prefetchedPages: new Set(),
};

// Функция для преобразования фильтров в правильную структуру
function transformFilters(filters: any): ProductFilters {
  if (!filters) return {};

  const transformed: ProductFilters = {};

  if (filters.search) transformed.search = filters.search;
  if (filters.inStockOnly) transformed.inStockOnly = filters.inStockOnly;
  if (filters.featured) transformed.featured = filters.featured;

  // Преобразуем categories если они в неправильном формате
  if (filters.categories) {
    if (Array.isArray(filters.categories)) {
      if (
        filters.categories.length > 0 &&
        typeof filters.categories[0] === "object"
      ) {
        transformed.categories = filters.categories.map(
          (cat: any) => cat.id || cat,
        );
      } else {
        transformed.categories = filters.categories;
      }
    }
  }

  // Преобразуем brands если они в неправильном формате
  if (filters.brands) {
    if (Array.isArray(filters.brands)) {
      if (filters.brands.length > 0 && typeof filters.brands[0] === "object") {
        transformed.brands = filters.brands.map(
          (brand: any) => brand.id || brand,
        );
      } else {
        transformed.brands = filters.brands;
      }
    }
  }

  // Преобразуем collections
  if (filters.collections) {
    if (Array.isArray(filters.collections)) {
      if (
        filters.collections.length > 0 &&
        typeof filters.collections[0] === "object"
      ) {
        transformed.collections = filters.collections.map(
          (col: any) => col.id || col,
        );
      } else {
        transformed.collections = filters.collections;
      }
    }
  }

  // Обрабатываем priceRange
  if (filters.priceRange) {
    transformed.priceRange = filters.priceRange;
  }

  return transformed;
}

// Reducer
function catalogReducer(
  state: CatalogState,
  action: CatalogAction,
): CatalogState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };

    case "SET_PRODUCTS":
      return {
        ...state,
        products: action.payload.products,
        pagination: action.payload.pagination,
        filters: action.payload.filters
          ? {
              ...state.filters,
              ...transformFilters(action.payload.filters),
            }
          : state.filters,
        isLoading: false,
        error: null,
        lastFetch: Date.now(),
      };

    case "SET_CATEGORIES":
      return { ...state, categories: action.payload };

    case "SET_BRANDS":
      return { ...state, brands: action.payload };

    case "SET_COLLECTIONS":
      return { ...state, collections: action.payload };

    case "SET_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, page: 1 }, // Сброс на первую страницу
      };

    case "CLEAR_FILTERS":
      return {
        ...state,
        filters: initialState.filters,
        pagination: { ...state.pagination, page: 1 },
      };

    case "SET_SORT":
      return {
        ...state,
        sortBy: action.payload,
        pagination: { ...state.pagination, page: 1 },
      };

    case "SET_PAGE":
      return {
        ...state,
        pagination: { ...state.pagination, page: action.payload },
      };

    case "SET_VIEW_MODE":
      return { ...state, viewMode: action.payload };

    case "TOGGLE_FILTERS":
      return { ...state, showFilters: !state.showFilters };

    case "ADD_TO_WISHLIST":
      return {
        ...state,
        wishlist: new Set([...state.wishlist, action.payload]),
      };

    case "REMOVE_FROM_WISHLIST":
      const newWishlist = new Set(state.wishlist);
      newWishlist.delete(action.payload);
      return { ...state, wishlist: newWishlist };

    case "ADD_TO_CART":
      const newCart = new Map(state.cart);
      const currentQty = newCart.get(action.payload.productId) || 0;
      newCart.set(
        action.payload.productId,
        currentQty + action.payload.quantity,
      );
      return { ...state, cart: newCart };

    case "REMOVE_FROM_CART":
      const cartCopy = new Map(state.cart);
      cartCopy.delete(action.payload);
      return { ...state, cart: cartCopy };

    case "CLEAR_CART":
      return { ...state, cart: new Map() };

    case "PREFETCH_PAGE":
      return {
        ...state,
        prefetchedPages: new Set([...state.prefetchedPages, action.payload]),
      };

    case "RESET":
      return { ...initialState };

    default:
      return state;
  }
}

// Контекст
interface CatalogContextType {
  // Состояние
  state: CatalogState;

  // Действия данных
  fetchProducts: (params?: Partial<ProductFilters>) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchBrands: () => Promise<void>;
  fetchCollections: () => Promise<void>;

  // Действия фильтрации
  setFilters: (filters: Partial<ProductFilters>) => void;
  clearFilters: () => void;
  setSort: (sortBy: ProductSortBy) => void;
  setPage: (page: number) => void;

  // UI действия
  setViewMode: (mode: "grid" | "list") => void;
  toggleFilters: () => void;

  // Действия с товарами
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  addToCart: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  getCartQuantity: (productId: string) => number;

  // Утилиты
  getProductById: (id: string) => SearchProductsResult | null;
  getCategoryById: (id: string) => Category | null;
  getBrandById: (id: string) => Brand | null;

  // Производительность
  prefetchPage: (page: number) => Promise<void>;
  reset: () => void;
}

const CatalogContext = createContext<CatalogContextType | null>(null);

// Provider компонент
interface CatalogProviderProps {
  children: React.ReactNode;
  initialData?: {
    products?: ProductListResponse;
    categories?: Category[];
    brands?: Brand[];
    collections?: Collection[];
  };
}

export function CatalogProvider({
  children,
  initialData,
}: CatalogProviderProps) {
  const [state, dispatch] = useReducer(catalogReducer, {
    ...initialState,
    products: initialData?.products?.products || [],
    categories: initialData?.categories || [],
    brands: initialData?.brands || [],
    collections: initialData?.collections || [],
    pagination: initialData?.products?.pagination || initialState.pagination,
  });

  // API функции
  const fetchProducts = useCallback(
    async (params?: Partial<ProductFilters>) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });

        const searchParams = new URLSearchParams();

        // Объединяем текущие фильтры с новыми параметрами
        const finalFilters = { ...state.filters, ...params };

        // Добавляем пагинацию
        searchParams.set("page", state.pagination.page.toString());
        searchParams.set("limit", state.pagination.limit.toString());
        searchParams.set("sortBy", state.sortBy);

        // Добавляем фильтры
        if (finalFilters.search)
          searchParams.set("search", finalFilters.search);
        if (finalFilters.categories && finalFilters.categories.length > 0) {
          searchParams.set("categories", finalFilters.categories.join(","));
        }
        if (finalFilters.brands && finalFilters.brands.length > 0) {
          searchParams.set("brands", finalFilters.brands.join(","));
        }
        if (finalFilters.collections && finalFilters.collections.length > 0) {
          searchParams.set("collections", finalFilters.collections.join(","));
        }
        if (finalFilters.inStockOnly) searchParams.set("inStockOnly", "true");
        if (finalFilters.featured) searchParams.set("featured", "true");
        if (finalFilters.priceRange && finalFilters.priceRange.min > 0) {
          searchParams.set("minPrice", finalFilters.priceRange.min.toString());
        }
        if (finalFilters.priceRange && finalFilters.priceRange.max > 0) {
          searchParams.set("maxPrice", finalFilters.priceRange.max.toString());
        }

        const response = await fetch(
          `/api/catalog/products?${searchParams.toString()}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          dispatch({ type: "SET_PRODUCTS", payload: data.data });
        } else {
          throw new Error(data.error || "Failed to fetch products");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        
        // Логируем ошибку загрузки продуктов
        import('@/lib/logger/client').then(({ clientLogger }) => {
          clientLogger.error('Failed to fetch products', error, {
            filters: state.filters,
            pagination: {
              page: state.pagination.page,
              limit: state.pagination.limit,
            },
            sortBy: state.sortBy,
            errorType: 'catalog-fetch-error',
            component: 'CatalogContext',
          });
        });
      }
    },
    [
      state.filters,
      state.pagination.page,
      state.pagination.limit,
      state.sortBy,
    ],
  );

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/catalog/categories");
      const data = await response.json();

      if (data.success) {
        dispatch({ type: "SET_CATEGORIES", payload: data.data });
      }
    } catch (error) {
      import('@/lib/logger/client').then(({ clientLogger }) => {
        clientLogger.error('Failed to fetch categories', error, {
          errorType: 'catalog-categories-error',
          component: 'CatalogContext',
        });
      });
    }
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      const response = await fetch("/api/catalog/brands");
      const data = await response.json();

      if (data.success) {
        dispatch({ type: "SET_BRANDS", payload: data.data });
      }
    } catch (error) {
      import('@/lib/logger/client').then(({ clientLogger }) => {
        clientLogger.error('Failed to fetch brands', error, {
          errorType: 'catalog-brands-error',
          component: 'CatalogContext',
        });
      });
    }
  }, []);

  const fetchCollections = useCallback(async () => {
    try {
      const response = await fetch("/api/catalog/collections");
      const data = await response.json();

      if (data.success) {
        dispatch({ type: "SET_COLLECTIONS", payload: data.data });
      }
    } catch (error) {
      import('@/lib/logger/client').then(({ clientLogger }) => {
        clientLogger.error('Failed to fetch collections', error, {
          errorType: 'catalog-collections-error',
          component: 'CatalogContext',
        });
      });
    }
  }, []);

  // Действия фильтрации
  const setFilters = useCallback((filters: Partial<ProductFilters>) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: "CLEAR_FILTERS" });
  }, []);

  const setSort = useCallback((sortBy: ProductSortBy) => {
    dispatch({ type: "SET_SORT", payload: sortBy });
  }, []);

  const setPage = useCallback((page: number) => {
    dispatch({ type: "SET_PAGE", payload: page });
  }, []);

  // UI действия
  const setViewMode = useCallback((mode: "grid" | "list") => {
    dispatch({ type: "SET_VIEW_MODE", payload: mode });
    // Сохраняем предпочтение в localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("catalog-view-mode", mode);
    }
  }, []);

  const toggleFilters = useCallback(() => {
    dispatch({ type: "TOGGLE_FILTERS" });
  }, []);

  // Действия с товарами
  const addToWishlist = useCallback(
    (productId: string) => {
      dispatch({ type: "ADD_TO_WISHLIST", payload: productId });

      // Сохраняем в localStorage
      if (typeof window !== "undefined") {
        const wishlist = JSON.stringify([...state.wishlist, productId]);
        localStorage.setItem("catalog-wishlist", wishlist);
      }
    },
    [state.wishlist],
  );

  const removeFromWishlist = useCallback(
    (productId: string) => {
      dispatch({ type: "REMOVE_FROM_WISHLIST", payload: productId });

      // Обновляем localStorage
      if (typeof window !== "undefined") {
        const newWishlist = new Set(state.wishlist);
        newWishlist.delete(productId);
        localStorage.setItem(
          "catalog-wishlist",
          JSON.stringify([...newWishlist]),
        );
      }
    },
    [state.wishlist],
  );

  const isInWishlist = useCallback(
    (productId: string) => {
      return state.wishlist.has(productId);
    },
    [state.wishlist],
  );

  const addToCart = useCallback(
    (productId: string, quantity: number = 1) => {
      dispatch({ type: "ADD_TO_CART", payload: { productId, quantity } });

      // Сохраняем в localStorage
      if (typeof window !== "undefined") {
        const cart = Object.fromEntries(state.cart);
        cart[productId] = (cart[productId] || 0) + quantity;
        localStorage.setItem("catalog-cart", JSON.stringify(cart));
      }
    },
    [state.cart],
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      dispatch({ type: "REMOVE_FROM_CART", payload: productId });

      // Обновляем localStorage
      if (typeof window !== "undefined") {
        const cart = Object.fromEntries(state.cart);
        delete cart[productId];
        localStorage.setItem("catalog-cart", JSON.stringify(cart));
      }
    },
    [state.cart],
  );

  const getCartQuantity = useCallback(
    (productId: string) => {
      return state.cart.get(productId) || 0;
    },
    [state.cart],
  );

  // Утилиты поиска
  const getProductById = useCallback(
    (id: string) => {
      return state.products.find((p) => p.id === id) || null;
    },
    [state.products],
  );

  const getCategoryById = useCallback(
    (id: string) => {
      return state.categories.find((c) => c.id === id) || null;
    },
    [state.categories],
  );

  const getBrandById = useCallback(
    (id: string) => {
      return state.brands.find((b) => b.id === id) || null;
    },
    [state.brands],
  );

  // Предзагрузка страниц
  const prefetchPage = useCallback(
    async (page: number) => {
      if (state.prefetchedPages.has(page) || state.isLoading) return;

      try {
        const searchParams = new URLSearchParams();
        searchParams.set("page", page.toString());
        searchParams.set("limit", state.pagination.limit.toString());
        searchParams.set("sortBy", state.sortBy);

        // Добавляем текущие фильтры
        Object.entries(state.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value) && value.length > 0) {
              searchParams.set(key, value.join(","));
            } else if (typeof value === "boolean" && value) {
              searchParams.set(key, "true");
            } else if (typeof value === "object" && value && "min" in value) {
              // priceRange
              if (value.min > 0)
                searchParams.set("minPrice", value.min.toString());
              if (value.max > 0)
                searchParams.set("maxPrice", value.max.toString());
            } else if (typeof value === "string" && value) {
              searchParams.set(key, value);
            }
          }
        });

        // Делаем запрос в фоне
        await fetch(`/api/catalog/products?${searchParams.toString()}`);

        dispatch({ type: "PREFETCH_PAGE", payload: page });
      } catch (error) {
        console.error("Error prefetching page:", error);
      }
    },
    [
      state.filters,
      state.pagination.limit,
      state.sortBy,
      state.prefetchedPages,
      state.isLoading,
    ],
  );

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  // Восстановление состояния из localStorage при инициализации
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      // Восстанавливаем view mode
      const savedViewMode = localStorage.getItem("catalog-view-mode");
      if (savedViewMode === "grid" || savedViewMode === "list") {
        setViewMode(savedViewMode);
      }

      // Восстанавливаем wishlist
      const savedWishlist = localStorage.getItem("catalog-wishlist");
      if (savedWishlist) {
        const wishlistArray = JSON.parse(savedWishlist);
        if (Array.isArray(wishlistArray)) {
          wishlistArray.forEach((id) => {
            dispatch({ type: "ADD_TO_WISHLIST", payload: id });
          });
        }
      }

      // Восстанавливаем cart
      const savedCart = localStorage.getItem("catalog-cart");
      if (savedCart) {
        const cartObject = JSON.parse(savedCart);
        Object.entries(cartObject).forEach(([productId, quantity]) => {
          if (typeof quantity === "number") {
            dispatch({ type: "ADD_TO_CART", payload: { productId, quantity } });
          }
        });
      }
    } catch (error) {
      console.error("Error restoring catalog state from localStorage:", error);
    }
  }, []);

  // Автоматическая предзагрузка соседних страниц
  useEffect(() => {
    if (!state.pagination.hasNext && !state.pagination.hasPrev) return;

    const currentPage = state.pagination.page;

    // Предзагружаем следующую страницу
    if (state.pagination.hasNext) {
      const nextPage = currentPage + 1;
      if (!state.prefetchedPages.has(nextPage)) {
        setTimeout(() => prefetchPage(nextPage), 1000);
      }
    }

    // Предзагружаем предыдущую страницу
    if (state.pagination.hasPrev) {
      const prevPage = currentPage - 1;
      if (!state.prefetchedPages.has(prevPage)) {
        setTimeout(() => prefetchPage(prevPage), 2000);
      }
    }
  }, [state.pagination, prefetchPage, state.prefetchedPages]);

  // Мемоизированное значение контекста
  const contextValue = useMemo<CatalogContextType>(
    () => ({
      state,

      // Данные
      fetchProducts,
      fetchCategories,
      fetchBrands,
      fetchCollections,

      // Фильтры
      setFilters,
      clearFilters,
      setSort,
      setPage,

      // UI
      setViewMode,
      toggleFilters,

      // Товары
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      addToCart,
      removeFromCart,
      getCartQuantity,

      // Утилиты
      getProductById,
      getCategoryById,
      getBrandById,

      // Производительность
      prefetchPage,
      reset,
    }),
    [
      state,
      fetchProducts,
      fetchCategories,
      fetchBrands,
      fetchCollections,
      setFilters,
      clearFilters,
      setSort,
      setPage,
      setViewMode,
      toggleFilters,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      addToCart,
      removeFromCart,
      getCartQuantity,
      getProductById,
      getCategoryById,
      getBrandById,
      prefetchPage,
      reset,
    ],
  );

  return (
    <CatalogContext.Provider value={contextValue}>
      {children}
    </CatalogContext.Provider>
  );
}

// Hook для использования контекста
export function useCatalog() {
  const context = useContext(CatalogContext);

  if (!context) {
    throw new Error("useCatalog must be used within a CatalogProvider");
  }

  return context;
}

// Селекторы для оптимизации ререндеров
export function useCatalogProducts() {
  const { state } = useCatalog();
  return state.products;
}

export function useCatalogFilters() {
  const { state, setFilters, clearFilters } = useCatalog();
  return {
    filters: state.filters,
    setFilters,
    clearFilters,
  };
}

export function useCatalogPagination() {
  const { state, setPage } = useCatalog();
  return {
    pagination: state.pagination,
    setPage,
  };
}

export function useCatalogUI() {
  const { state, setViewMode, toggleFilters } = useCatalog();
  return {
    viewMode: state.viewMode,
    showFilters: state.showFilters,
    setViewMode,
    toggleFilters,
  };
}

export function useCatalogWishlist() {
  const { state, addToWishlist, removeFromWishlist, isInWishlist } =
    useCatalog();
  return {
    wishlist: state.wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    count: state.wishlist.size,
  };
}

export function useCatalogCart() {
  const { state, addToCart, removeFromCart, getCartQuantity } = useCatalog();
  return {
    cart: state.cart,
    addToCart,
    removeFromCart,
    getCartQuantity,
    totalItems: Array.from(state.cart.values()).reduce(
      (sum, qty) => sum + qty,
      0,
    ),
    totalProducts: state.cart.size,
  };
}

// Готовность к TanStack Query - интерфейс для будущей миграции
export interface TanStackQueryMigration {
  // Query keys
  queryKeys: {
    products: (
      filters: ProductFilters,
      page: number,
      sortBy: ProductSortBy,
    ) => string[];
    categories: () => string[];
    brands: () => string[];
    collections: () => string[];
  };

  // Query functions
  queryFns: {
    fetchProducts: (params: {
      filters: ProductFilters;
      page: number;
      sortBy: ProductSortBy;
    }) => Promise<ProductListResponse>;
    fetchCategories: () => Promise<Category[]>;
    fetchBrands: () => Promise<Brand[]>;
    fetchCollections: () => Promise<Collection[]>;
  };

  // Mutation functions
  mutationFns: {
    addToWishlist: (productId: string) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    addToCart: (params: {
      productId: string;
      quantity: number;
    }) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
  };
}

// Подготовка к миграции на TanStack Query
export const tanStackQueryConfig: TanStackQueryMigration = {
  queryKeys: {
    products: (filters, page, sortBy) => [
      "catalog",
      "products",
      JSON.stringify({ filters, page, sortBy }),
    ],
    categories: () => ["catalog", "categories"],
    brands: () => ["catalog", "brands"],
    collections: () => ["catalog", "collections"],
  },

  queryFns: {
    fetchProducts: async ({ filters, page, sortBy }) => {
      const searchParams = new URLSearchParams();
      searchParams.set("page", page.toString());
      searchParams.set("sortBy", sortBy);

      // Добавляем фильтры в searchParams...
      // (логика такая же как в fetchProducts выше)

      const response = await fetch(
        `/api/catalog/products?${searchParams.toString()}`,
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch products");
      }

      return data.data;
    },

    fetchCategories: async () => {
      const response = await fetch("/api/catalog/categories");
      const data = await response.json();

      if (!data.success) {
        throw new Error("Failed to fetch categories");
      }

      return data.data;
    },

    fetchBrands: async () => {
      const response = await fetch("/api/catalog/brands");
      const data = await response.json();

      if (!data.success) {
        throw new Error("Failed to fetch brands");
      }

      return data.data;
    },

    fetchCollections: async () => {
      const response = await fetch("/api/catalog/collections");
      const data = await response.json();

      if (!data.success) {
        throw new Error("Failed to fetch collections");
      }

      return data.data;
    },
  },

  mutationFns: {
    addToWishlist: async (productId: string) => {
      // В будущем здесь будет API запрос
      console.log("Adding to wishlist:", productId);
    },

    removeFromWishlist: async (productId: string) => {
      // В будущем здесь будет API запрос
      console.log("Removing from wishlist:", productId);
    },

    addToCart: async ({ productId, quantity }) => {
      // В будущем здесь будет API запрос
      console.log("Adding to cart:", { productId, quantity });
    },

    removeFromCart: async (productId: string) => {
      // В будущем здесь будет API запрос
      console.log("Removing from cart:", productId);
    },
  },
};
