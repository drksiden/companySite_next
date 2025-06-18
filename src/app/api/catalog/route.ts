// src/app/api/catalog/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { catalogApi } from '@/lib/api/catalog';
import type { ProductListParams, SearchProductsParams } from '@/types/catalog';

// ==============================================
// GET /api/catalog
// ==============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'products';

  try {
    switch (action) {
      case 'products':
        return await handleProductsRequest(searchParams);
      
      case 'product':
        return await handleProductRequest(searchParams);
      
      case 'search':
        return await handleSearchRequest(searchParams);
      
      case 'categories':
        return await handleCategoriesRequest(searchParams);
      
      case 'category':
        return await handleCategoryRequest(searchParams);
      
      case 'category-tree':
        return await handleCategoryTreeRequest();
      
      case 'category-filters':
        return await handleCategoryFiltersRequest(searchParams);
      
      case 'brands':
        return await handleBrandsRequest();
      
      case 'brand':
        return await handleBrandRequest(searchParams);
      
      case 'collections':
        return await handleCollectionsRequest(searchParams);
      
      case 'collection':
        return await handleCollectionRequest(searchParams);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action parameter', success: false },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error(`Catalog API Error [${action}]:`, error);
    
    const isNotFound = error.code === 'NOT_FOUND';
    const statusCode = isNotFound ? 404 : 500;
    
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        success: false,
        code: error.code,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      },
      { status: statusCode }
    );
  }
}

// ==============================================
// ОБРАБОТЧИКИ ЗАПРОСОВ
// ==============================================

/**
 * Обработка запроса списка продуктов
 * GET /api/catalog?action=products&page=1&limit=20&sortBy=name_asc&categories=id1,id2&brands=id3,id4
 */
async function handleProductsRequest(searchParams: URLSearchParams) {
  const params: ProductListParams = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100), // максимум 100
    sortBy: (searchParams.get('sortBy') as any) || 'name_asc',
    search: searchParams.get('search') || undefined,
    categories: searchParams.get('categories')?.split(',').filter(Boolean) || undefined,
    brands: searchParams.get('brands')?.split(',').filter(Boolean) || undefined,
    collections: searchParams.get('collections')?.split(',').filter(Boolean) || undefined,
    inStockOnly: searchParams.get('inStockOnly') === 'true',
    featured: searchParams.get('featured') === 'true',
  };

  // Обработка ценового диапазона
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  if (minPrice || maxPrice) {
    params.priceRange = {
      min: minPrice ? parseFloat(minPrice) : 0,
      max: maxPrice ? parseFloat(maxPrice) : 0
    };
  }

  const response = await catalogApi.products.getProducts(params);
  return NextResponse.json(response);
}

/**
 * Обработка запроса одного продукта
 * GET /api/catalog?action=product&slug=product-slug
 */
async function handleProductRequest(searchParams: URLSearchParams) {
  const slug = searchParams.get('slug');
  
  if (!slug) {
    return NextResponse.json(
      { error: 'Product slug is required', success: false },
      { status: 400 }
    );
  }

  const response = await catalogApi.products.getProduct(slug);
  return NextResponse.json(response);
}

/**
 * Обработка поискового запроса
 * GET /api/catalog?action=search&q=search-term&categories=id1,id2&limit=10
 */
async function handleSearchRequest(searchParams: URLSearchParams) {
  const params: SearchProductsParams = {
    search_query: searchParams.get('q') || undefined,
    category_ids: searchParams.get('categories')?.split(',').filter(Boolean) || undefined,
    brand_ids: searchParams.get('brands')?.split(',').filter(Boolean) || undefined,
    in_stock_only: searchParams.get('inStockOnly') === 'true',
    limit: Math.min(parseInt(searchParams.get('limit') || '20'), 50), // максимум 50 для поиска
    offset: parseInt(searchParams.get('offset') || '0')
  };

  // Обработка ценового диапазона
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  if (minPrice) params.min_price = parseFloat(minPrice);
  if (maxPrice) params.max_price = parseFloat(maxPrice);

  const response = await catalogApi.products.searchProducts(params);
  return NextResponse.json(response);
}

/**
 * Обработка запроса списка категорий
 * GET /api/catalog?action=categories&parentId=uuid
 */
async function handleCategoriesRequest(searchParams: URLSearchParams) {
  const parentId = searchParams.get('parentId') || undefined;
  const response = await catalogApi.categories.getCategories(parentId);
  return NextResponse.json(response);
}

/**
 * Обработка запроса одной категории
 * GET /api/catalog?action=category&slug=category-slug
 */
async function handleCategoryRequest(searchParams: URLSearchParams) {
  const slug = searchParams.get('slug');
  
  if (!slug) {
    return NextResponse.json(
      { error: 'Category slug is required', success: false },
      { status: 400 }
    );
  }

  const response = await catalogApi.categories.getCategory(slug);
  return NextResponse.json(response);
}

/**
 * Обработка запроса дерева категорий
 * GET /api/catalog?action=category-tree
 */
async function handleCategoryTreeRequest() {
  const response = await catalogApi.categories.getCategoryTree();
  return NextResponse.json(response);
}

/**
 * Обработка запроса фильтров категории
 * GET /api/catalog?action=category-filters&categoryId=uuid
 */
async function handleCategoryFiltersRequest(searchParams: URLSearchParams) {
  const categoryId = searchParams.get('categoryId');
  
  if (!categoryId) {
    return NextResponse.json(
      { error: 'Category ID is required', success: false },
      { status: 400 }
    );
  }

  const response = await catalogApi.categories.getCategoryFilters(categoryId);
  return NextResponse.json(response);
}

/**
 * Обработка запроса списка брендов
 * GET /api/catalog?action=brands
 */
async function handleBrandsRequest() {
  const response = await catalogApi.brands.getBrands();
  return NextResponse.json(response);
}

/**
 * Обработка запроса одного бренда
 * GET /api/catalog?action=brand&slug=brand-slug
 */
async function handleBrandRequest(searchParams: URLSearchParams) {
  const slug = searchParams.get('slug');
  
  if (!slug) {
    return NextResponse.json(
      { error: 'Brand slug is required', success: false },
      { status: 400 }
    );
  }

  const response = await catalogApi.brands.getBrand(slug);
  return NextResponse.json(response);
}

/**
 * Обработка запроса списка коллекций
 * GET /api/catalog?action=collections&brandId=uuid
 */
async function handleCollectionsRequest(searchParams: URLSearchParams) {
  const brandId = searchParams.get('brandId') || undefined;
  const response = await catalogApi.collections.getCollections(brandId);
  return NextResponse.json(response);
}

/**
 * Обработка запроса одной коллекции
 * GET /api/catalog?action=collection&slug=collection-slug
 */
async function handleCollectionRequest(searchParams: URLSearchParams) {
  const slug = searchParams.get('slug');
  
  if (!slug) {
    return NextResponse.json(
      { error: 'Collection slug is required', success: false },
      { status: 400 }
    );
  }

  const response = await catalogApi.collections.getCollection(slug);
  return NextResponse.json(response);
}

// ==============================================
// ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ (POST, PUT, DELETE)
// ==============================================

/**
 * POST /api/catalog - Создание сущностей (только для админов)
 */
export async function POST(request: NextRequest) {
  // TODO: Добавить проверку прав доступа
  // TODO: Реализовать создание продуктов, категорий, брендов
  
  return NextResponse.json(
    { error: 'Method not implemented', success: false },
    { status: 501 }
  );
}

/**
 * PUT /api/catalog - Обновление сущностей (только для админов)
 */
export async function PUT(request: NextRequest) {
  // TODO: Добавить проверку прав доступа
  // TODO: Реализовать обновление продуктов, категорий, брендов
  
  return NextResponse.json(
    { error: 'Method not implemented', success: false },
    { status: 501 }
  );
}

/**
 * DELETE /api/catalog - Удаление сущностей (только для админов)
 */
export async function DELETE(request: NextRequest) {
  // TODO: Добавить проверку прав доступа
  // TODO: Реализовать удаление продуктов, категорий, брендов
  
  return NextResponse.json(
    { error: 'Method not implemented', success: false },
    { status: 501 }
  );
}

// ==============================================
// УТИЛИТЫ ДЛЯ ВАЛИДАЦИИ И ОБРАБОТКИ
// ==============================================

/**
 * Валидация UUID
 */
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Валидация slug
 */
function isValidSlug(str: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(str);
}

/**
 * Очистка и валидация параметров пагинации
 */
function sanitizePaginationParams(page?: string, limit?: string) {
  const pageNum = Math.max(1, parseInt(page || '1') || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit || '20') || 20));
  
  return { page: pageNum, limit: limitNum };
}

/**
 * Очистка массива ID
 */
function sanitizeIdArray(idsString?: string): string[] | undefined {
  if (!idsString) return undefined;
  
  return idsString
    .split(',')
    .map(id => id.trim())
    .filter(id => id && isValidUUID(id));
}