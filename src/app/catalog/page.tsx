import { Metadata } from "next";
import CatalogShell from "@/features/catalog/components/CatalogShell";
import { COMPANY_NAME_SHORT } from "@/data/constants";

const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asia-ntb.kz';

export const metadata: Metadata = {
  title: "Каталог товаров",
  description:
    "Каталог систем безопасности, автоматизации и сетевого оборудования. Охранно-пожарная сигнализация, видеонаблюдение, СКС, СКУД, СОУЭ. Официальные дилеры ведущих производителей в Казахстане.",
  keywords: [
    "каталог",
    "товары",
    "системы безопасности",
    "автоматизация",
    "видеонаблюдение",
    "пожарная сигнализация",
    "СКС",
    "СКУД",
    "СОУЭ",
    "Казахстан",
    COMPANY_NAME_SHORT,
  ],
  alternates: {
    canonical: '/catalog',
  },
  openGraph: {
    title: `Каталог товаров - ${COMPANY_NAME_SHORT}`,
    description: "Каталог систем безопасности, автоматизации и сетевого оборудования. Официальные дилеры ведущих производителей.",
    url: '/catalog',
    siteName: COMPANY_NAME_SHORT,
    type: 'website',
    locale: 'ru_RU',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Каталог товаров - ${COMPANY_NAME_SHORT}`,
    description: "Каталог систем безопасности, автоматизации и сетевого оборудования.",
  },
};

// Force dynamic rendering to prevent hydration issues
export const dynamic = "force-dynamic";

interface CatalogPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="min-h-screen bg-background">
      <CatalogShell searchParams={resolvedSearchParams} />
    </div>
  );
}
