import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CategoryCardList } from '@/components/CategoryCardList'; // Убедитесь, что этот файл существует и путь корректен
import Link from 'next/link'; // Added Link import
import { Metadata } from 'next';
import { COMPANY_NAME_SHORT } from '@/data/constants';
import { supabase } from '@/lib/supabaseClient';
import { Category, Brand } from '@/types/supabase'; // Added Brand import
import { Package } from 'lucide-react';

export const metadata: Metadata = {
  title: `Каталог - ${COMPANY_NAME_SHORT}`,
};

// Устанавливаем ревалидацию на уровне страницы (например, каждый час)
export const revalidate = 3600;

async function getTopLevelCategories(): Promise<HttpTypes.StoreProductCategory[]> {
  try {
    const { product_categories } = await sdk.store.category.list(
      {
        limit: 200, // Загружаем достаточное количество для фильтрации корневых
        // Указываем поля, которые точно нужны.
        // 'parent_category_id' для фильтрации, 'metadata' для изображений.
        // 'handle' для ссылок, 'name', 'description'.
        // 'rank' если вы его используете для сортировки в админке.
        fields: "id,name,handle,description,parent_category_id,metadata,rank",
      }
      // Второй аргумент для кастомных заголовков, если они нужны SDK, а не для Next.js 'revalidate'
    );

    // Фильтруем на стороне сервера для получения только корневых категорий.
    // Storefront API Medusa обычно УЖЕ возвращает только активные категории.
    const topLevel = product_categories.filter(
      (category) => !category.parent_category_id
    );

    // Сортировка по полю rank (если оно существует и используется), затем по имени
    return topLevel.sort((a, b) => {
      const rankA = typeof (a as any).rank === 'number' ? (a as any).rank : Infinity;
      const rankB = typeof (b as any).rank === 'number' ? (b as any).rank : Infinity;
      
      if (rankA !== rankB) {
        return rankA - rankB;
      }
      return a.name.localeCompare(b.name);
    });

  } catch (error) {
    console.error("Ошибка при загрузке категорий верхнего уровня:", error);
    return [];
  }
}

async function getBrands(): Promise<Brand[]> {
  try {
    const { data: brands, error } = await supabase
      .from('brands')
      .select('id, name, handle')
      .order('name', { ascending: true });

    if (error) {
      console.error("Ошибка при загрузке брендов из Supabase:", error.message);
      throw error; // Re-throw to be caught by the outer catch
    }
    return brands || [];
  } catch (error) {
    // Catch both Supabase errors and unexpected errors
    console.error("Непредвиденная ошибка при загрузке брендов:", error);
    return [];
  }
}

export default async function CatalogPage() {
  const topLevelCategories = await getTopLevelCategories();
  const allBrands = await getBrands();

  return (
    <div className="py-16 px-6 max-w-7xl mx-auto">
      <Breadcrumbs
        items={[
          { label: 'Каталог', href: '/catalog' }
        ]}
        className="mb-8"
      />
      <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
        Основные категории
      </h2>
      {topLevelCategories.length > 0 ? (
        <CategoryCardList categories={topLevelCategories} />
      ) : (
        <div className="text-center py-16">
          <Package className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <p className="text-xl text-muted-foreground">Основные категории не найдены</p>
          <p className="text-sm text-muted-foreground mt-2">
            Попробуйте обновить страницу позже или свяжитесь с нами.
          </p>
        </div>
      )}

      {allBrands.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            Популярные бренды
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {allBrands.map((brand) => (
              <Link
                key={brand.id}
                href={brand.handle ? `/catalog?brand=${brand.handle}` : `/catalog?brand_id=${brand.id}`}
                className="py-2 px-4 bg-muted hover:bg-secondary text-muted-foreground hover:text-secondary-foreground rounded-md transition-colors"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}