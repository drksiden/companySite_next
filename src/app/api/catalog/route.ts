import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET /api/catalog/brands
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');

  try {
    switch (type) {
      case 'brands':
        if (id) {
          const { data, error } = await supabase
            .from('brands')
            .select('*')
            .eq('id', id)
            .single();
          if (error) throw error;
          return NextResponse.json(data);
        }
        const { data: brands, error: brandsError } = await supabase
          .from('brands')
          .select('*')
          .order('name');
        if (brandsError) throw brandsError;
        return NextResponse.json(brands);

      case 'categories':
        if (id) {
          const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('id', id)
            .single();
          if (error) throw error;
          return NextResponse.json(data);
        }
        const { data: categories, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        if (categoriesError) throw categoriesError;
        return NextResponse.json(categories);

      case 'subcategories':
        const categoryId = searchParams.get('categoryId');
        if (id) {
          const { data, error } = await supabase
            .from('subcategories')
            .select('*')
            .eq('id', id)
            .single();
          if (error) throw error;
          return NextResponse.json(data);
        }
        let query = supabase
          .from('subcategories')
          .select('*')
          .order('name');
        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }
        const { data: subcategories, error: subcategoriesError } = await query;
        if (subcategoriesError) throw subcategoriesError;
        return NextResponse.json(subcategories);

      case 'collections':
        const subcategoryId = searchParams.get('subcategoryId');
        const brandId = searchParams.get('brandId');
        if (id) {
          const { data, error } = await supabase
            .from('collections')
            .select('*')
            .eq('id', id)
            .single();
          if (error) throw error;
          return NextResponse.json(data);
        }
        let collectionsQuery = supabase
          .from('collections')
          .select('*')
          .order('name');
        if (subcategoryId) {
          collectionsQuery = collectionsQuery.eq('subcategory_id', subcategoryId);
        }
        if (brandId) {
          collectionsQuery = collectionsQuery.eq('brand_id', brandId);
        }
        const { data: collections, error: collectionsError } = await collectionsQuery;
        if (collectionsError) throw collectionsError;
        return NextResponse.json(collections);

      case 'products':
        if (id) {
          const { data: product, error: productError } = await supabase
            .from('products')
            .select(`
              *,
              brand:brands(*),
              collection:collections(*),
              subcategory:subcategories(*),
              variants:product_variants(*)
            `)
            .eq('id', id)
            .single();
          if (productError) throw productError;
          return NextResponse.json(product);
        }

        const filters = {
          brandId: searchParams.get('brandId'),
          categoryId: searchParams.get('categoryId'),
          subcategoryId: searchParams.get('subcategoryId'),
          collectionId: searchParams.get('collectionId'),
        };

        let productsQuery = supabase
          .from('products')
          .select(`
            *,
            brand:brands(*),
            collection:collections(*),
            subcategory:subcategories(*),
            variants:product_variants(*)
          `)
          .order('title');

        if (filters.brandId) {
          productsQuery = productsQuery.eq('brand_id', filters.brandId);
        }
        if (filters.subcategoryId) {
          productsQuery = productsQuery.eq('subcategory_id', filters.subcategoryId);
        }
        if (filters.collectionId) {
          productsQuery = productsQuery.eq('collection_id', filters.collectionId);
        }

        const { data: products, error: productsError } = await productsQuery;
        if (productsError) throw productsError;
        return NextResponse.json(products);

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Catalog API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 