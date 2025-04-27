import Head from 'next/head';
import Image from 'next/image';
import { Hero } from '@/components/Hero';
import { PartnersCarousel } from '@/components/PartnersCarousel';
import { TekoSection } from '@/components/TekoSection';
import { FlexemSection } from '@/components/FlexemSection';
import { AntSection } from '@/components/AntSection';
import { PromoCard } from '@/components/PromoCard';
import { Services } from '@/components/Services';
import { getProducts } from '@/lib/medusa';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SectionWrapper } from '@/components/SectionWrapper';

async function fetchFeaturedProducts() {
  const products = await getProducts();
  return products.slice(0, 4); // Ограничим до 4 товаров
}

export default async function HomePage() {
  const products = await fetchFeaturedProducts();
  const COMPANY_NAME_SHORT = 'Your Company'; // Замените на ваше значение

  return (
    <>
      <Head>
        <title>{COMPANY_NAME_SHORT}</title>
        <meta
          name="description"
          content="Ваш надежный системный интегратор в области безопасности и автоматизации в Казахстане. Комплексные решения, монтаж, обслуживание, официальные дилеры."
        />
        <link rel="canonical" href="https://ваш-домен.kz/" />
        <meta property="og:title" content="Системная интеграция и безопасность в Казахстане" />
        <meta
          property="og:description"
          content="Комплексные решения по безопасности, автоматизации и сетевому оборудованию. Официальные дилеры ведущих производителей."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ваш-домен.kz/" />
        <meta property="og:image" content="https://ваш-домен.kz/images/og-image.jpg" />
      </Head>
      <Hero />
      <SectionWrapper className="w-full">
        <PartnersCarousel />
      </SectionWrapper>
      <SectionWrapper className="w-full">
        <TekoSection />
      </SectionWrapper>
      <SectionWrapper className="w-full">
        <FlexemSection />
      </SectionWrapper>
      <SectionWrapper className="w-full">
        <AntSection />
      </SectionWrapper>
      <SectionWrapper className="w-full">
        <PromoCard />
      </SectionWrapper>
      <SectionWrapper className="w-full">
        <Services />
      </SectionWrapper>
      <SectionWrapper className="w-full">
        <div className="container mx-auto py-12 px-4">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div key={product.id}>
                <Card className="h-full flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg">{product.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    {product.thumbnail && (
                      <Image
                        src={product.thumbnail}
                        alt={product.title}
                        width={200}
                        height={200}
                        className="w-full h-48 object-cover rounded-md"
                        priority={index === 0} // Приоритет для первого изображения
                      />
                    )}
                    <p className="text-muted-foreground mt-2">{product.description?.slice(0, 100)}...</p>
                  </CardContent>
                  <CardFooter>
                    <Button asChild>
                      <Link href={`/catalog/product/${product.handle}`}>View Product</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}