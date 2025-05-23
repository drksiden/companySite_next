import CategorySidebar from '@/components/categories/CategorySidebar'; // Adjusted import path

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-x-8 bg-white dark:bg-gray-950">
      <CategorySidebar />
      <main className="flex-1 min-w-0">{/* Added min-w-0 for flex child overflow handling */}
        {children}
      </main>
    </div>
  );
}
