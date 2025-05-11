import { Catalog } from '@/components/Catalog';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { fetchCategories, fetchProducts, Product, ProductCategory } from '@/lib/medusaClient';
import { Metadata } from 'next';
import { COMPANY_NAME_SHORT } from '@/data/constants';

export async function generateMetadata(): Promise<Metadata> {
  // const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ваш-домен.kz'; // Убедитесь, что URL корректный
  return {
    title: `Каталог продукции`, // Будет скомбинировано с title.template из layout.tsx
    description: 'Ознакомьтесь с нашим каталогом продукции и решений для безопасности и автоматизации в Казахстане.',
    alternates: {
      canonical: `/catalog`,
    },
    openGraph: {
      title: `Каталог продукции - ${COMPANY_NAME_SHORT}`,
      description: 'Широкий выбор оборудования для систем безопасности и автоматизации от ведущих производителей.',
      url: `/catalog`,
    },
  };
}

export default async function CatalogPage() {
  // Рекомендуется позволить ошибкам распространяться для обработки через error.tsx
  // Next.js автоматически обработает ошибки на стороне сервера и отобразит страницу error.tsx
  // Это также обеспечит логирование ошибки.
  // Если вы хотите оставить try-catch, то рекомендуется логировать ошибку (console.error(err))
  // и, возможно, передавать состояние ошибки в компонент Catalog для отображения сообщения пользователю.
  const { product_categories: initialCategories } = await fetchCategories();
  const { products: initialProducts } = await fetchProducts();

  return (
    <div className="py-16 px-6 max-w-7xl mx-auto">
      <Breadcrumbs
        items={[
          { label: 'Каталог', href: '/catalog' }
        ]}
        className="mb-8"
      />
      <Catalog initialProducts={initialProducts} initialCategories={initialCategories} />
    </div>
  );
}