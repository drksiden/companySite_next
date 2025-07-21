// src/types/catalog.ts

export type ProductStatus = 'draft' | 'active' | 'archived' | 'out_of_stock';
export type AttributeType = 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'date' | 'file' | 'color';
export type UserRole = 'customer' | 'manager' | 'admin' | 'super_admin';

// ==============================================
// ОСНОВНЫЕ ИНТЕРФЕЙСЫ КАТАЛОГА
// ==============================================

export interface Currency {
  id: string;
  code: string; // KZT, USD, EUR, RUB
  name: string;
  symbol: string; // ₸, $, €, ₽
  exchange_rate: number;
  is_base: boolean;
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: string;
  code: string; // шт, кг, м, л
  name: string;
  created_at: string;
}

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

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  level: number;
  image_url?: string;
  icon_name?: string;
  is_active: boolean;
  sort_order: number;
  path: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  created_at: string;
  updated_at: string;
  
  // Связанные данные
  parent?: Category;
  children?: Category[];
  children_count?: number;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  brand_id?: string;
  category_id?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  
  // Связанные данные
  brand?: Brand;
  subcategory_id?: string;
}

export interface AttributeGroup {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  created_at: string;
}

export interface Attribute {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: AttributeType;
  group_id?: string;
  is_required: boolean;
  is_filterable: boolean;
  is_comparable: boolean;
  is_visible_on_front: boolean;
  options?: string[]; // для select/multiselect
  unit?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  
  // Связанные данные
  group?: AttributeGroup;
}

export interface CategoryAttribute {
  id: string;
  category_id: string;
  attribute_id: string;
  is_required: boolean;
  sort_order: number;
  
  // Связанные данные
  attribute?: Attribute;
}

export interface ProductAttributeValue {
  id: string;
  product_id: string;
  attribute_id: string;
  value_text?: string;
  value_number?: number;
  value_boolean?: boolean;
  value_date?: string;
  value_json?: any;
  created_at: string;
  updated_at: string;
  
  // Связанные данные
  attribute?: Attribute;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku?: string;
  barcode?: string;
  price_adjustment: number;
  inventory_quantity: number;
  attributes: Record<string, any>; // цвет, размер и т.д.
  images?: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  barcode?: string;
  short_description?: string;
  description?: string;
  technical_description?: string;
  
  // Категоризация
  category_id: string;
  brand_id?: string;
  collection_id?: string;
  
  // Ценообразование
  base_price?: number;
  sale_price?: number;
  cost_price?: number;
  currency_id?: string;
  
  // Складские данные
  track_inventory: boolean;
  inventory_quantity: number;
  min_stock_level: number;
  allow_backorder: boolean;
  
  // Физические характеристики
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  unit_id?: string;
  
  // Изображения и файлы
  images: string[];
  thumbnail?: string;
  documents?: ProductDocument[];
  
  // Технические характеристики
  specifications: Record<string, any>;
  
  // Статус и видимость
  status: ProductStatus;
  is_featured: boolean;
  is_digital: boolean;
  
  // SEO
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  
  // Сортировка и аналитика
  sort_order: number;
  view_count: number;
  sales_count: number;
  
  // Технические поля
  created_at: string;
  updated_at: string;
  published_at?: string;
  
  // Связанные данные
  category?: Category;
  brand?: Brand;
  collection?: Collection;
  currency?: Currency;
  unit?: Unit;
  variants?: ProductVariant[];
  attribute_values?: ProductAttributeValue[];
  
  // Вычисляемые поля
  final_price?: number; // base_price или sale_price
  is_on_sale?: boolean;
  discount_percentage?: number;
  formatted_price?: string;
}

export interface ProductDocument {
  name: string;
  url: string;
  type?: string; // pdf, doc, jpg
  size?: number;
}

// ==============================================
// ПОЛЬЗОВАТЕЛИ И АВТОРИЗАЦИЯ
// ==============================================

export interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  permissions: string[];
  company_name?: string;
  company_id?: string;
  position?: string;
  address?: any;
  timezone: string;
  locale: string;
  last_login_at?: string;
  login_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ==============================================
// API ИНТЕРФЕЙСЫ
// ==============================================

export interface SearchProductsParams {
  search_query?: string;
  category_ids?: string[];
  brand_ids?: string[];
  min_price?: number;
  max_price?: number;
  in_stock_only?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchProductsResult {
  id: string;
  name: string;
  slug: string;
  short_description?: string;
  base_price?: number;
  thumbnail?: string;
  brand_name?: string;
  category_name?: string;
  inventory_quantity: number;
  rank?: number;
}

export interface CategoryFilter {
  attribute_id: string;
  attribute_name: string;
  attribute_type: AttributeType;
  values: any[];
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
}

// ==============================================
// УТИЛИТАРНЫЕ ТИПЫ
// ==============================================

export type ProductWithRelations = Product & {
  category: Category;
  brand?: Brand;
  collection?: Collection;
  variants: ProductVariant[];
  attribute_values: (ProductAttributeValue & { attribute: Attribute })[];
};

export type CategoryWithChildren = Category & {
  children: CategoryWithChildren[];
  products_count?: number;
};

export type BrandWithStats = Brand & {
  products_count: number;
  categories: Category[];
};

// ==============================================
// АДМИНСКИЕ ИНТЕРФЕЙСЫ
// ==============================================

export interface ProductFormData {
  id: string | null;
  name: string;
  slug: string;
  sku?: string | null;
  barcode?: string | null;
  short_description?: string | null;
  description?: string | null;
  technical_description?: string | null;
  category_id: string;
  brand_id?: string | null;
  collection_id?: string | null;
  base_price?: number | null;
  sale_price?: number | null;
  cost_price?: number | null;
  currency_id?: string;
  track_inventory: boolean;
  inventory_quantity: number;
  min_stock_level: number;
  allow_backorder: boolean;
  weight?: number | null;
  dimensions?: {
    length?: number | null;
    width?: number | null;
    height?: number | null;
  };
  unit_id?: string;
  images?: string[];
  thumbnail?: string | null;
  documents?: ProductDocument[];
  specifications?: Record<string, any>;
  status: ProductStatus;
  is_featured: boolean;
  is_digital: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  sort_order: number;
  view_count?: number;
  sales_count?: number;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  image_url?: string;
  icon_name?: string;
  is_active: boolean;
  sort_order: number;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

export interface BrandFormData {
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
}

// ==============================================
// КОНТЕКСТЫ И ПРОВАЙДЕРЫ
// ==============================================

export interface CatalogContextType {
  // Состояние
  categories: Category[];
  brands: Brand[];
  collections: Collection[];
  loading: boolean;
  error?: string;
  
  // Методы
  searchProducts: (params: SearchProductsParams) => Promise<SearchProductsResult[]>;
  getProduct: (slug: string) => Promise<ProductWithRelations | null>;
  getCategory: (slug: string) => Promise<CategoryWithChildren | null>;
  getCategoryTree: () => Promise<CategoryTree[]>;
  getCategoryFilters: (categoryId: string) => Promise<CategoryFilter[]>;
  
  // Кэш
  clearCache: () => void;
  refreshData: () => Promise<void>;
}

// ==============================================
// CLOUDFLARE R2 / ФАЙЛЫ
// ==============================================

export interface FileUploadResponse {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export interface UploadedFile {
  key: string;
  url: string;
  filename: string;
  size: number;
  contentType: string;
  uploadedAt: string;
}

export interface ImageUploadOptions {
  maxSize?: number; // в байтах
  allowedTypes?: string[]; // ['image/jpeg', 'image/png']
  generateThumbnail?: boolean;
  watermark?: boolean;
}

// ==============================================
// ФИЛЬТРЫ И СОРТИРОВКА
// ==============================================

export interface ProductFilters {
  categories?: string[];
  brands?: string[];
  collections?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  attributes?: Record<string, any>;
  inStockOnly?: boolean;
  featured?: boolean;
  search?: string;
}

export type ProductSortBy = 
  | 'name_asc' 
  | 'name_desc' 
  | 'price_asc' 
  | 'price_desc' 
  | 'created_asc' 
  | 'created_desc' 
  | 'popularity' 
  | 'featured';

export interface ProductListParams extends ProductFilters {
  sortBy?: ProductSortBy;
  page?: number;
  limit?: number;
}

export interface ProductListResponse {
  products: SearchProductsResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    categories: Array<{ id: string; name: string; count: number }>;
    brands: Array<{ id: string; name: string; count: number }>;
    priceRange: { min: number; max: number };
    attributes: CategoryFilter[];
  };
}

// ==============================================
// АДМИНИСТРАТИВНЫЕ ФУНКЦИИ
// ==============================================

export interface AdminStats {
  products: {
    total: number;
    active: number;
    draft: number;
    outOfStock: number;
  };
  categories: {
    total: number;
    active: number;
  };
  brands: {
    total: number;
    active: number;
  };
  inventory: {
    lowStock: number;
    totalValue: number;
  };
}

export interface BulkOperation {
  action: 'activate' | 'deactivate' | 'delete' | 'update_category' | 'update_brand' | 'update_price';
  productIds: string[];
  data?: any; // дополнительные данные для операции
}

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  errors: Array<{
    productId: string;
    error: string;
  }>;
}

// ==============================================
// СОБЫТИЯ И ЛОГИРОВАНИЕ
// ==============================================

export interface ProductEvent {
  id: string;
  product_id: string;
  event_type: 'view' | 'purchase' | 'add_to_cart' | 'add_to_wishlist';
  user_id?: string;
  session_id?: string;
  metadata?: any;
  created_at: string;
}

export interface InventoryLog {
  id: string;
  product_id: string;
  variant_id?: string;
  change_type: 'increase' | 'decrease' | 'set';
  quantity_before: number;
  quantity_after: number;
  reason: string;
  user_id?: string;
  created_at: string;
}

// ==============================================
// ЭКСПОРТ/ИМПОРТ
// ==============================================

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'json';
  filters?: ProductFilters;
  fields: string[];
  includeImages?: boolean;
  includeSpecs?: boolean;
}

export interface ImportResult {
  success: boolean;
  processed: number;
  created: number;
  updated: number;
  errors: Array<{
    row: number;
    error: string;
    data?: any;
  }>;
}

// ==============================================
// УВЕДОМЛЕНИЯ И ПОДПИСКИ
// ==============================================

export interface PriceAlert {
  id: string;
  user_id: string;
  product_id: string;
  target_price: number;
  is_active: boolean;
  created_at: string;
  triggered_at?: string;
}

export interface StockAlert {
  id: string;
  product_id: string;
  threshold: number;
  email_addresses: string[];
  is_active: boolean;
  last_triggered?: string;
}

// ==============================================
// SEO И МЕТАДАННЫЕ
// ==============================================

export interface SeoData {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl?: string;
  structuredData?: any;
}

export interface Breadcrumb {
  label: string;
  href: string;
  isActive?: boolean;
}

// ==============================================
// КОРЗИНА И ИЗБРАННОЕ (для интеграции)
// ==============================================

export interface CartItem {
  id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  price: number;
  added_at: string;
  
  // Связанные данные
  product?: Product;
  variant?: ProductVariant;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  added_at: string;
  
  // Связанные данные
  product?: Product;
}

// ==============================================
// АНАЛИТИКА И ОТЧЕТЫ
// ==============================================

export interface ProductAnalytics {
  product_id: string;
  period: 'day' | 'week' | 'month' | 'year';
  views: number;
  unique_views: number;
  cart_adds: number;
  purchases: number;
  conversion_rate: number;
  revenue: number;
  date: string;
}

export interface CategoryAnalytics {
  category_id: string;
  products_count: number;
  total_views: number;
  total_sales: number;
  average_price: number;
  top_products: Array<{
    product_id: string;
    name: string;
    views: number;
    sales: number;
  }>;
}

// ==============================================
// КАСТОМНЫЕ ХУКИ И УТИЛИТЫ
// ==============================================

export interface UseProductsOptions {
  filters?: ProductFilters;
  sortBy?: ProductSortBy;
  enabled?: boolean;
  refetchInterval?: number;
}

export interface UseProductOptions {
  slug: string;
  includeRelated?: boolean;
  includeReviews?: boolean;
  enabled?: boolean;
}

export interface UseCategoriesOptions {
  parentId?: string;
  level?: number;
  includeProducts?: boolean;
  enabled?: boolean;
}

// ==============================================
// API КЛИЕНТ ИНТЕРФЕЙСЫ
// ==============================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
    [key: string]: any;
  };
}

export interface ApiClient {
  // Продукты
  getProducts: (params?: ProductListParams) => Promise<ApiResponse<ProductListResponse>>;
  getProduct: (slug: string) => Promise<ApiResponse<ProductWithRelations>>;
  searchProducts: (params: SearchProductsParams) => Promise<ApiResponse<SearchProductsResult[]>>;
  
  // Категории
  getCategories: (parentId?: string) => Promise<ApiResponse<Category[]>>;
  getCategory: (slug: string) => Promise<ApiResponse<CategoryWithChildren>>;
  getCategoryTree: () => Promise<ApiResponse<CategoryTree[]>>;
  getCategoryFilters: (categoryId: string) => Promise<ApiResponse<CategoryFilter[]>>;
  
  // Бренды
  getBrands: () => Promise<ApiResponse<Brand[]>>;
  getBrand: (slug: string) => Promise<ApiResponse<BrandWithStats>>;
  
  // Коллекции
  getCollections: (brandId?: string) => Promise<ApiResponse<Collection[]>>;
  getCollection: (slug: string) => Promise<ApiResponse<Collection>>;
  
  // Файлы
  uploadFile: (file: File, options?: ImageUploadOptions) => Promise<FileUploadResponse>;
  deleteFile: (key: string) => Promise<{ success: boolean }>;
  
  // Админские функции
  getAdminStats: () => Promise<ApiResponse<AdminStats>>;
  bulkUpdateProducts: (operation: BulkOperation) => Promise<ApiResponse<BulkOperationResult>>;
  exportProducts: (options: ExportOptions) => Promise<ApiResponse<string>>; // URL файла
  importProducts: (file: File) => Promise<ApiResponse<ImportResult>>;
}

// ==============================================
// КОМПОНЕНТЫ И UI
// ==============================================

export interface ProductCardProps {
  product: Product | SearchProductsResult;
  variant?: 'grid' | 'list' | 'compact';
  showQuickView?: boolean;
  showCompare?: boolean;
  showWishlist?: boolean;
  className?: string;
}

export interface CategoryCardProps {
  category: Category;
  showProductCount?: boolean;
  variant?: 'card' | 'tile' | 'banner';
  className?: string;
}

export interface ProductFiltersProps {
  filters: CategoryFilter[];
  activeFilters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  className?: string;
}

export interface ProductGalleryProps {
  images: string[];
  alt: string;
  priority?: boolean;
  className?: string;
}

export interface ProductSpecsProps {
  specifications: Record<string, any>;
  attributes?: ProductAttributeValue[];
  variant?: 'table' | 'grid' | 'accordion';
  className?: string;
}

// ==============================================
// КОНФИГУРАЦИЯ И НАСТРОЙКИ
// ==============================================

export interface CatalogConfig {
  // Изображения
  images: {
    baseUrl: string;
    thumbnailSizes: number[];
    quality: number;
    placeholder: string;
  };
  
  // Пагинация
  pagination: {
    defaultLimit: number;
    maxLimit: number;
  };
  
  // Поиск
  search: {
    minQueryLength: number;
    maxResults: number;
    enableSuggestions: boolean;
  };
  
  // Валюта
  currency: {
    default: string;
    format: Intl.NumberFormatOptions;
  };
  
  // SEO
  seo: {
    titleTemplate: string;
    defaultDescription: string;
    keywords: string[];
  };
  
  // Функции
  features: {
    wishlist: boolean;
    compare: boolean;
    reviews: boolean;
    variants: boolean;
    bundles: boolean;
  };
}