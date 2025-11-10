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
import CategoryInfo from "./CategoryInfo";

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

// Extended category information (description, image, price list, etc.)
// This is stored locally, not in the database
const categoryInfoMap: Record<
  string,
  {
    description?: string;
    image?: string;
    priceListUrl?: string;
    manufacturer?: {
      name: string;
      logo?: string;
      badge?: string;
      website?: string;
    };
    features?: string[];
  }
> = {
  "security-fire-alarms": {
    description:
      "Комплексные системы охранно-пожарной сигнализации для защиты объектов различного назначения. От радиоканальных систем «Астра» до адресных решений для защиты вашего объекта. Полный спектр оборудования НПО «ТЕКО» в Казахстане.",
    image: "/images/teko/teko-main-visual.png",
    priceListUrl: "https://r2.asia-ntb.kz/documents/pricelists/%D0%9F%D1%80%D0%B0%D0%B9%D1%81-%D0%BB%D0%B8%D1%81%D1%82%20%D0%A2%D0%95%D0%9A%D0%9E%2C%20%D0%A0%D0%A0%D0%A6%2C%20%D1%81%20%D0%9D%D0%94%D0%A1.xls",
    manufacturer: {
      name: 'НПО "ТЕКО"',
      logo: "/images/logos/teko-logo.svg",
      badge: "Официальный дилер",
      website: "https://teko.biz",
    },
    features: [
      "Радиоканальные системы «Астра»",
      "Адресные проводные и беспроводные извещатели",
      "Интеграция с системами дымоудаления",
      "Масштабируемые решения для любых объектов",
      "Профессиональная техническая поддержка",
    ],
  },
  surveillance: {
    description:
      "Системы видеонаблюдения для мониторинга и обеспечения безопасности. Аналоговые, IP и гибридные решения с поддержкой высокого разрешения и аналитики. Полный комплекс оборудования для видеоконтроля объектов любой сложности.",
    // image: "/images/categories/surveillance.jpg",
    priceListUrl: "/price-lists/surveillance.pdf",
    features: [
      "IP-камеры высокого разрешения",
      "Аналоговые и гибридные системы",
      "Системы видеоаналитики",
      "Видеорегистраторы и серверы",
      "Комплекты для объектов различного масштаба",
    ],
  },
  "network-equipment": {
    description:
      "Сетевое оборудование и структурированные кабельные системы для построения надежных IT-инфраструктур. Коммутаторы, маршрутизаторы, патч-панели и аксессуары от ведущих производителей.",
    // image: "/images/categories/network-equipment.jpg",
    priceListUrl: "/price-lists/network-equipment.pdf",
    features: [
      "Коммутаторы и маршрутизаторы",
      "Патч-панели и коммутационные панели",
      "Аксессуары для монтажа",
      "Серверные стойки и шкафы",
      "Комплектующие для СКС",
    ],
  },
  intercoms: {
    description:
      "Системы домофонии и связи для контроля доступа и коммуникации. Аудио и видеодомофоны, системы IP-телефонии для офисов и жилых комплексов. Современные решения для обеспечения безопасности и комфорта.",
    // image: "/images/categories/intercoms.jpg",
    priceListUrl: "/price-lists/intercoms.pdf",
    features: [
      "Видеодомофоны с поддержкой IP",
      "Аудиодомофоны",
      "Системы IP-телефонии",
      "Контроллеры и коммутаторы",
      "Аксессуары и комплектующие",
    ],
  },
  "power-supplies": {
    description:
      "Источники питания и резервного питания для систем безопасности и автоматизации. Блоки питания, ИБП, аккумуляторы различных типов и емкостей. Обеспечение бесперебойной работы критически важных систем.",
    // image: "/images/categories/power-supplies.jpg",
    priceListUrl: "/price-lists/power-supplies.pdf",
    features: [
      "Блоки питания различной мощности",
      "Источники бесперебойного питания (ИБП)",
      "Аккумуляторы и батареи",
      "Зарядные устройства",
      "Контроллеры заряда",
    ],
  },
  "notification-systems": {
    description:
      "Системы оповещения и трансляции для экстренных ситуаций и фонового вещания. Громкоговорители, усилители, системы речевого оповещения. Соответствие требованиям пожарной безопасности и нормативным документам.",
    // image: "/images/categories/notification-systems.jpg",
    priceListUrl: "/price-lists/notification-systems.pdf",
    features: [
      "Системы речевого оповещения (СОУЭ)",
      "Громкоговорители и колонки",
      "Усилители мощности",
      "Контроллеры оповещения",
      "Аксессуары для монтажа",
    ],
  },
  "access-control": {
    description:
      "Системы контроля и управления доступом (СКУД) для автоматизации пропускного режима. Считыватели, контроллеры, карты доступа и программное обеспечение. Современные решения для контроля доступа на объекты.",
    // image: "/images/categories/access-control.jpg",
    priceListUrl: "/price-lists/access-control.pdf",
    features: [
      "Считыватели карт и биометрии",
      "Контроллеры доступа",
      "Замки и электромеханические устройства",
      "Карты доступа и брелоки",
      "Программное обеспечение",
    ],
  },
  "cable-management": {
    description:
      "Кабеленесущие системы для организации и защиты кабельной инфраструктуры. Кабель-каналы, лотки, короба, стойки и аксессуары для монтажа. Профессиональные решения для упорядочивания кабельных систем.",
    // image: "/images/categories/cable-management.jpg",
    priceListUrl: "/price-lists/cable-management.pdf",
    features: [
      "Кабель-каналы и короба",
      "Кабельные лотки и перфорированные системы",
      "Серверные стойки и шкафы",
      "Аксессуары для крепления",
      "Маркировка и организация кабелей",
    ],
  },
  cables: {
    description:
      "Кабельная продукция для систем безопасности, связи и автоматизации. Силовые, сигнальные, витые пары, коаксиальные и оптоволоконные кабели. Широкий ассортимент кабельной продукции для различных применений.",
    // image: "/images/categories/cables.jpg",
    priceListUrl: "/price-lists/cables.pdf",
    features: [
      "Силовые кабели",
      "Сигнальные и контрольные кабели",
      "Витая пара (UTP, STP)",
      "Коаксиальные кабели",
      "Оптоволоконные кабели",
    ],
  },
};

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
  
  // Categories are already slugs, so we pass them as-is
  // listProducts will handle the conversion internally
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

async function CatalogContent({ searchParams }: CatalogShellProps) {
  const { products, categories, brands, topLevelCategories } = await fetchData({
    query: searchParams?.query,
    category: searchParams?.category,
    brand: searchParams?.brand,
  });

  // Определяем выбранную основную категорию (только если выбрана одна категория без других фильтров)
  const selectedCategorySlug = searchParams?.category?.split(",")[0];
  const hasSingleCategory = 
    selectedCategorySlug && 
    !searchParams?.query && 
    !searchParams?.brand &&
    searchParams?.category?.split(",").length === 1;
  
  const selectedCategory = hasSingleCategory && selectedCategorySlug
    ? topLevelCategories.find((cat) => cat.slug === selectedCategorySlug)
    : null;

  return (
    <>
      {/* Top-Level Category Selection */}
      <section className="mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {topLevelCategories.map((category) => (
            <Card
              key={category.slug}
              className="group relative p-2 sm:p-3 flex flex-col items-center justify-center gap-3 border hover:border-primary hover:shadow transition-all duration-200 cursor-pointer min-h-[120px]"
            >
              <Link href={`/catalog?category=${category.slug}`} className="flex flex-col items-center w-full h-full">
                <div
                  className={`rounded-full flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 text-2xl sm:text-3xl shadow ${category.color} group-hover:bg-opacity-50 group-hover:scale-105 transition-transform`}
                >
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

      {/* Category Information Section - клиентский компонент для мгновенного отображения */}
      {selectedCategory && (
        <CategoryInfo 
          categorySlug={selectedCategory.slug} 
          categoryName={selectedCategory.name}
        />
      )}

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
          <CatalogProducts
            initialProducts={products}
            searchParams={searchParams}
          />
        </div>
      </div>
    </>
  );
}

export default async function CatalogShell({
  searchParams,
}: CatalogShellProps) {
  return (
    <div className="container mx-auto px-4 py-8" id="catalog-top">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          Каталог товаров
        </h1>
      </div>
      
      <Suspense fallback={
        <>
          {/* Top-Level Categories Skeleton */}
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
