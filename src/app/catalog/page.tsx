import { Metadata } from 'next';
import { COMPANY_NAME_SHORT } from '@/data/constants';
import CatalogClient from '@/features/catalog/components/CatalogClient';
import { catalogApi } from '@/features/catalog/api';
import { ProductListParams } from '@/types/catalog';

export const metadata: Metadata = {
  title: `Каталог - ${COMPANY_NAME_SHORT}`,
};

interface CatalogPageProps {
  searchParams: ProductListParams;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
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
  } = searchParams;

  const [categoriesRes, brandsRes, productsRes] = await Promise.all([
    catalogApi.categories.getCategories(),
    catalogApi.brands.getBrands(),
    catalogApi.products.getProducts({
      page,
      limit,
      sortBy,
      categories,
      brands,
      collections,
      priceRange,
      inStockOnly,
      featured,
      search
    }),
  ]);

  return (
    <CatalogClient
      initialCategories={categoriesRes.data || []}
      initialBrands={brandsRes.data || []}
      initialProducts={productsRes.data || null}
    />
  );
}