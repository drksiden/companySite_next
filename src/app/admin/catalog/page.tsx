"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Folder, ShoppingBag, Tag, Palette, Database } from 'lucide-react';
import { ContentLayout } from '@/components/admin-panel/content-layout';

export default function AdminCatalogPage() {
  const catalogSections = [
    { title: 'Categories', description: 'Manage product categories', href: '/admin/catalog/categories', icon: Folder },
    { title: 'Products', description: 'Manage products', href: '/admin/catalog/products', icon: ShoppingBag },
    { title: 'Brands', description: 'Manage product brands', href: '/admin/catalog/brands', icon: Tag },
    { title: 'Collections', description: 'Manage product collections', href: '/admin/catalog/collections', icon: Palette },
    { title: 'Attributes', description: 'Manage product attributes', href: '/admin/catalog/attributes', icon: Database },
  ];

  return (
    <ContentLayout title="Каталог">
      <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {catalogSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link href={section.href} key={section.href}>
              <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CardDescription>{section.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
    </ContentLayout>
    
  );
}