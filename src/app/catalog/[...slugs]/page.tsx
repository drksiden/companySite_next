import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabaseClient";
import { Category, Product } from "@/types/supabase";
import { ProductCardList } from "@/components/ProductCardList"; // Import ProductCardList

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// Separator might not be used directly after refactor, but keep for now
// import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { LayoutGrid } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{
    slugs: string[];
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Updated data structure for the page
interface CategoryPageData {
  currentCategory: Category | null;
  childCategories: Category[];
  products: Product[];
}

interface BreadcrumbInfo {
  name: string;
  href: string;
  handle: string;
}

// Set revalidation interval (e.g., every hour)
export const revalidate = 3600;

async function getCategoryData(handle: string): Promise<CategoryPageData> {
  let currentCategory: Category | null = null;
  let childCategories: Category[] = [];
  let products: Product[] = [];

  try {
    // Fetch current category by handle
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("*")
      .eq("handle", handle)
      .maybeSingle(); // Use maybeSingle to handle null without error

    if (categoryError) {
      console.error(
        `Error fetching category with handle "${handle}":`,
        categoryError.message,
      );
      // Still return a structure that won't break the page, but currentCategory will be null
    }
    currentCategory = categoryData || null;

    if (currentCategory) {
      // Fetch child categories
      const { data: childrenData, error: childrenError } = await supabase
        .from("categories")
        .select("*")
        .eq("parent_id", currentCategory.id)
        .order("rank", { ascending: true, nullsFirst: false })
        .order("name", { ascending: true });

      if (childrenError)
        console.error(
          "Error fetching child categories:",
          childrenError.message,
        );
      else childCategories = childrenData || [];

      // Fetch products for the current category
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select(
          `
        *,
        brand:brands (id, name, handle)
      `,
        )
        .eq("category_id", currentCategory.id)
        // TODO: Add ordering for products if needed, e.g., by name or a rank field
        .order("name", { ascending: true });

      if (productError)
        console.error("Error fetching products:", productError.message);
      else products = productData || [];
    } else {
      // Category not found, so no children or products can be fetched.
      console.warn(
        `Category with handle "${handle}" not found. Cannot fetch children or products.`,
      );
    }

    return { currentCategory, childCategories, products };
  } catch (error) {
    // Catch any unexpected errors during the process
    console.error(
      `Unexpected error in getCategoryData for handle ${handle}:`,
      error,
    );
    return { currentCategory: null, childCategories: [], products: [] };
  }
}

async function getBreadcrumbData(slugs: string[]): Promise<BreadcrumbInfo[]> {
  const breadcrumbs: BreadcrumbInfo[] = [];
  let currentPath = "/catalog";

  for (const slug of slugs) {
    currentPath += `/${slug}`;
    try {
      const { data: category, error } = await supabase
        .from("categories")
        .select("name, handle")
        .eq("handle", slug)
        .single();

      if (error || !category) {
        console.warn(
          `Breadcrumb part not found for slug: ${slug} at path ${currentPath}. Error: ${error?.message}`,
        );
        // Push a placeholder if not found, so the breadcrumb path isn't broken
        // The page logic will later use notFound() if the final category isn't resolved
        breadcrumbs.push({ name: slug, href: currentPath, handle: slug });
      } else {
        breadcrumbs.push({
          name: category.name,
          href: currentPath,
          handle: category.handle,
        });
      }
    } catch (err) {
      // Catch any unexpected errors
      console.error(
        `Unexpected error fetching breadcrumb for slug ${slug}:`,
        err,
      );
      breadcrumbs.push({ name: slug, href: currentPath, handle: slug });
    }
  }
  return breadcrumbs;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slugs } = await params;
  const currentCategoryHandle = slugs[slugs.length - 1];

  const breadcrumbItems = await getBreadcrumbData(slugs);

  // Validate breadcrumbs: if any part before the last one couldn't be resolved (name equals handle),
  // or if the last resolved breadcrumb doesn't match the current handle, then it's a 404.
  const lastResolvedBreadcrumb =
    breadcrumbItems.length > 0
      ? breadcrumbItems[breadcrumbItems.length - 1]
      : null;
  if (
    !lastResolvedBreadcrumb ||
    lastResolvedBreadcrumb.handle !== currentCategoryHandle ||
    breadcrumbItems.slice(0, -1).some((b) => b.name === b.handle)
  ) {
    console.warn(
      "Invalid category path. Slugs:",
      slugs.join("/"),
      "Resolved breadcrumbs:",
      breadcrumbItems.map((b) => b.handle).join("/"),
    );
    notFound();
  }

  const { currentCategory, childCategories, products } = await getCategoryData(
    currentCategoryHandle,
  );

  if (!currentCategory) {
    console.warn(
      `Category data for handle "${currentCategoryHandle}" is null. Triggering 404.`,
    );
    notFound();
  }

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen py-12 font-sans">
      <div className="container mx-auto px-4">
        <Breadcrumb className="mb-8 text-sm md:text-base">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/catalog"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Каталог
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={item.href}>
                <BreadcrumbSeparator className="text-gray-400 dark:text-gray-600" />
                <BreadcrumbItem>
                  {index === breadcrumbItems.length - 1 ? (
                    <BreadcrumbPage className="font-medium text-gray-800 dark:text-gray-200">
                      {currentCategory.name}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        href={item.href}
                        className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {item.name}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <header className="mb-10 md:mb-12 pb-6 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
            {currentCategory.name}
          </h1>
          {currentCategory.description && (
            <p className="mt-3 text-base md:text-lg text-gray-600 dark:text-gray-300">
              {currentCategory.description}
            </p>
          )}
        </header>

        {childCategories && childCategories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8">
              Подкатегории
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {childCategories.map(
                (
                  childCat, // Renamed to avoid conflict with currentCategory
                ) => (
                  <Link
                    key={childCat.id}
                    href={`/catalog/${slugs.join("/")}/${childCat.handle}`}
                    passHref
                    legacyBehavior // Still needed if wrapping an <a> tag
                  >
                    <a className="block group">
                      <Card className="h-full flex flex-col overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-400 dark:hover:border-blue-500 transform hover:-translate-y-1">
                        <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center rounded-t-2xl">
                          {/* TODO: Consider using category image if available, fallback to icon */}
                          <LayoutGrid className="h-14 w-14 text-blue-500 dark:text-blue-400 opacity-75" />
                        </div>
                        <CardHeader className="p-5 flex-grow">
                          <CardTitle className="text-lg font-semibold text-center text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                            {childCat.name}
                          </CardTitle>
                        </CardHeader>
                        {childCat.description && (
                          <CardContent className="p-5 pt-0">
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 text-center">
                              {childCat.description}
                            </p>
                          </CardContent>
                        )}
                      </Card>
                    </a>
                  </Link>
                ),
              )}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8">
            Товары в категории &quot;{currentCategory.name}&quot;
          </h2>
          {products && products.length > 0 ? (
            <ProductCardList products={products} />
          ) : (
            childCategories.length === 0 && ( // Only show "no products" if there are also no subcategories to explore
              <p className="text-center text-gray-600 dark:text-gray-400 text-lg py-4">
                В этой категории пока нет товаров.
              </p>
            )
          )}
          {childCategories.length > 0 && products.length === 0 && (
            <p className="text-center text-gray-600 dark:text-gray-400 text-lg py-4">
              Выберите подкатегорию для просмотра товаров или в этой категории
              нет товаров для прямого отображения.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
