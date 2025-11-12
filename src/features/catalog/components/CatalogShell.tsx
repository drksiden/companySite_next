import FilterSidebar from "./FilterSidebar";
import ResponsiveFilterPanel from "./ResponsiveFilterPanel";
import CatalogProducts from "./CatalogProducts";
import {
  listProducts,
  listCategories,
  listBrands,
} from "@/lib/services/catalog";
import { Suspense } from "react";
import LoadingSkeletons from "./LoadingSkeletons";
import { createServerClient } from "@/lib/supabaseServer";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Shield,
  Cctv,
  Network,
  Phone,
  BatteryFull,
  Radio,
  KeyRound,
  Cable,
  Plug,
} from "lucide-react";

interface CatalogShellProps {
  searchParams?: {
    query?: string;
    category?: string;
    brand?: string;
  };
}

const staticCategories = [
  {
    name: "Охранно-пожарная сигнализация",
    slug: "security-fire-alarms",
    Icon: Shield,
    color: "bg-orange-100 text-orange-600",
  },
  {
    name: "Видеонаблюдение",
    slug: "surveillance",
    Icon: Cctv,
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    name: "Сетевое оборудование СКС",
    slug: "network-equipment",
    Icon: Network,
    color: "bg-green-100 text-green-600",
  },
  {
    name: "Домофония и связь",
    slug: "intercoms",
    Icon: Phone,
    color: "bg-amber-100 text-amber-600",
  },
  {
    name: "Источники питания",
    slug: "power-supplies",
    Icon: BatteryFull,
    color: "bg-purple-100 text-purple-600",
  },
  {
    name: "Оповещение и трансляция",
    slug: "notification-systems",
    Icon: Radio,
    color: "bg-pink-100 text-pink-600",
  },
  {
    name: "СКУД",
    slug: "access-control",
    Icon: KeyRound,
    color: "bg-gray-100 text-gray-600",
  },
  {
    name: "Кабеленесущие системы",
    slug: "cable-management",
    Icon: Cable,
    color: "bg-cyan-100 text-cyan-600",
  },
  {
    name: "Кабельная продукция",
    slug: "cables",
    Icon: Plug,
    color: "bg-fuchsia-100 text-fuchsia-600",
  },
];

async function fetchData({
  query = "",
  brand = "",
}: {
  query?: string;
  brand?: string;
}) {
  const supabase = await createServerClient();

  const params = {
    page: 1,
    limit: 50,
    sort: "name.asc",
    categories: [], // не фильтруем по категориям на главной!
    brands: brand ? brand.split(",").filter(Boolean) : [],
    collections: [],
    search: query || undefined,
  };

  const [productsResult, categories, brands] = await Promise.all([
    listProducts(params),
    listCategories(),
    listBrands(),
  ]);

  const topLevelCategories = staticCategories.map((staticCat) => {
    const dbCat = categories.find(
      (cat) =>
        cat.slug === staticCat.slug && (!cat.parent_id || cat.level === 0),
    );
    return {
      ...staticCat,
      id: dbCat?.id || staticCat.slug,
      product_count: dbCat?.product_count || 0,
    };
  });

  return {
    products: productsResult.data || [],
    categories: categories || [],
    brands: brands || [],
    topLevelCategories,
  };
}

async function CatalogContent({ searchParams }: CatalogShellProps) {
  const { products, categories, brands, topLevelCategories } = await fetchData({
    query: searchParams?.query,
    brand: searchParams?.brand,
  });

  return (
    <>
      {/* Сетка корневых категорий */}
      <section className="mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {topLevelCategories.map((category) => (
            <Card
              key={category.slug}
              className="group relative p-2 sm:p-3 flex flex-col items-center justify-center gap-3 border hover:border-primary hover:shadow transition-all duration-200 cursor-pointer min-h-[120px]"
            >
              <Link href={`/catalog/${category.slug}`} className="flex flex-col items-center w-full h-full">
                <div className={`rounded-full flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 text-2xl sm:text-3xl shadow ${category.color} group-hover:bg-opacity-50 group-hover:scale-105 transition-transform`}>
                  {category.Icon && <category.Icon className="w-7 h-7" />}
                </div>
                <span className="mt-2 text-xs sm:text-sm text-center font-medium text-black dark:text-white group-hover:text-primary transition-colors duration-150 line-clamp-2">
                  {category.name}
                </span>
                {category.product_count > 0 && (
                  <Badge className="mt-1 bg-primary/10 text-primary text-[10px] px-2 py-0 font-medium">
                    {category.product_count}
                  </Badge>
                )}
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-6 bg-[var(--card-border)]" />

      {/* Мобильные фильтры */}
      <div className="lg:hidden mb-4">
        <ResponsiveFilterPanel
          searchParams={searchParams}
          categories={categories}
          brands={brands}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 lg:gap-8">
        {/* Фильтр слева */}
        <div className="hidden lg:block">
          <FilterSidebar
            searchParams={searchParams}
            categories={categories}
            brands={brands}
          />
        </div>
        {/* Товары */}
        <div className="min-w-0">
          <CatalogProducts
            initialProducts={products}
            searchParams={searchParams}
          />
        </div>
      </div>
    </>
  );
}

export default async function CatalogShell({ searchParams }: CatalogShellProps) {
  return (
    <div className="container mx-auto px-4 py-8" id="catalog-top">
      {/* Заголовок */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          Каталог товаров
        </h1>
      </div>

      <Suspense fallback={
        <>
          <section className="mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {[...Array(10)].map((_, i) => (
                <Card key={i} className="p-3 flex flex-col items-center justify-center gap-3 min-h-[120px]">
                  <Skeleton className="h-14 w-14 rounded-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-8" />
                </Card>
              ))}
            </div>
          </section>
          <Separator className="my-6" />
          <LoadingSkeletons count={12} />
        </>
      }>
        <CatalogContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
