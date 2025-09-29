import FilterSidebar from "./FilterSidebar";
import ResponsiveFilterPanel from "./ResponsiveFilterPanel";
import CatalogProducts from "./CatalogProducts";
import {
  CatalogProduct,
  listProducts,
  listCategories,
  listBrands,
  CategoryItem,
  BrandItem,
} from "@/lib/services/catalog";
import { Suspense } from "react";
import LoadingSkeletons from "./LoadingSkeletons";
import { createServerClient } from "@/lib/supabaseServer";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CatalogShellProps {
  searchParams?: {
    query?: string;
    category?: string;
    brand?: string;
  };
}

// Static top-level categories with display names and images
const staticCategories = [
  {
    name: "Охранная сигнализация",
    slug: "security-alarms",
    image: "/images/teko/teko-main-visual.png",
  },
  {
    name: "Пожарная сигнализация",
    slug: "fire-alarms",
    image: "/images/teko/teko-astra-prime.png",
  },
  {
    name: "Видеонаблюдение",
    slug: "surveillance",
    image: "/images/mainCategory/videoHik.jpg",
  },
  {
    name: "Сетевое оборудование СКС",
    slug: "network-equipment",
    image: "/images/mainCategory/netEquip.png",
  },
  {
    name: "Домофония и устройства связи",
    slug: "intercoms",
    image: "/images/mainCategory/domophoniya.png",
  },
  {
    name: "Источники питания",
    slug: "power-supplies",
    image: "/images/mainCategory/ibp.webp",
  },
  {
    name: "Системы оповещения и музыкальной трансляции",
    slug: "notification-systems",
    image: "/images/mainCategory/notificSystems.jpg",
  },
  {
    name: "СКУД",
    slug: "access-control",
    image: "/images/mainCategory/skud.jpg",
  },
  {
    name: "Кабеленесущие системы",
    slug: "cable-management",
    image: "/images/mainCategory/cableManagement.jpg",
  },
  {
    name: "Кабельная продукция",
    slug: "cables",
    image: "/images/mainCategory/cables.png",
  },
];

async function fetchData({
  query = "",
  category = "",
  brand = "",
}: {
  query?: string;
  category?: string;
  brand?: string;
}) {
  const supabase = await createServerClient();
  const params = {
    page: 1,
    limit: 50,
    sort: "name.asc",
    categories: category ? category.split(",").filter(Boolean) : [],
    brands: brand ? brand.split(",").filter(Boolean) : [],
    collections: [],
    search: query || undefined,
  };

  const [productsResult, categories, brands] = await Promise.all([
    listProducts(params),
    listCategories(),
    listBrands(),
  ]);

  // Map static categories to database categories by slug
  const topLevelCategories = staticCategories.map((staticCat) => {
    const dbCat = categories.find(
      (cat) =>
        cat.slug === staticCat.slug && (!cat.parent_id || cat.level === 0),
    );
    return {
      ...staticCat,
      id: dbCat?.id || staticCat.slug, // Fallback to slug if no match
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

export default async function CatalogShell({
  searchParams,
}: CatalogShellProps) {
  const { products, categories, brands, topLevelCategories } = await fetchData({
    query: searchParams?.query,
    category: searchParams?.category,
    brand: searchParams?.brand,
  });

  return (
    <div className="container mx-auto px-4 py-8" id="catalog-top">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          Каталог товаров
        </h1>
      </div>
      {/* Top-Level Category Selection */}
      <section className="mb-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {topLevelCategories.map((category) => (
            <Card
              key={category.id}
              className="group relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <Link href={`/catalog?category=${category.id}`}>
                <div className="relative w-full aspect-[4/3] sm:h-32">
                  <Image
                    src={category.image || "/images/placeholder-category.jpg"}
                    alt={category.name}
                    fill
                    className="object-cover transition-all duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
                    quality={75}
                  />
                  <div className="absolute inset-0 bg-[var(--overlay-bg)] opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                </div>
                <div className="p-2 sm:p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-black dark:text-white group-hover:text-[var(--title-hover-text)] transition-colors duration-200 line-clamp-2">
                      {category.name}
                    </span>
                    {category.product_count > 0 && (
                      <Badge className="bg-[var(--primary-bg)] text-[var(--primary-text)] text-xs">
                        {category.product_count}
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-6 bg-[var(--card-border)]" />

      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <ResponsiveFilterPanel
          searchParams={searchParams}
          categories={categories}
          brands={brands}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 lg:gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <FilterSidebar
            searchParams={searchParams}
            categories={categories}
            brands={brands}
          />
        </div>

        {/* Main Content */}
        <div className="min-w-0">
          <Suspense fallback={<LoadingSkeletons />}>
            <CatalogProducts
              initialProducts={products}
              searchParams={searchParams}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
