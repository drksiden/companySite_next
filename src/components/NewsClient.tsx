"use client";

import { motion } from "framer-motion";
import { Calendar, ArrowRight, Sparkles, Newspaper } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";

// Используем упрощенный интерфейс для Client Component
interface NewsItemProps {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  images?: string[] | null;
}

interface NewsClientProps {
    featuredNews: NewsItemProps | null;
    regularNews: NewsItemProps[];
}

const containerVariants = {
  // ... (Ваши варианты анимации)
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
} as const;

const imageVariants = {
  hidden: { scale: 1.1, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
} as const;


const getCategoryColor = (category: string) => {
  switch (category) {
    case "Продукция":
      return "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    case "Сертификация":
      return "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    case "Компания":
      return "bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border-purple-200 dark:border-purple-800";
    case "События":
      return "bg-orange-500/10 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 border-orange-200 dark:border-orange-800";
    default:
      return "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300 border-gray-200 dark:border-gray-800";
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export function NewsClient({ featuredNews, regularNews }: NewsClientProps) {
  
  const autoplayPlugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  // Проверяем, есть ли вообще новости
  if (!featuredNews && regularNews.length === 0) {
      return (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
              <p>На данный момент нет опубликованных новостей.</p>
          </div>
      );
  }

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* News Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-12"
        >
          {/* Featured News */}
          {featuredNews && (
            <motion.div variants={itemVariants} className="lg:row-span-2">
              <Card className="group relative h-full overflow-hidden border border-gray-200/50 dark:border-gray-800/50 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white dark:bg-gray-900">
                {/* Image Carousel */}
                {(featuredNews.images && featuredNews.images.length > 0) ? (
                  <motion.div
                    variants={imageVariants}
                    className="relative  dark:from-gray-800 dark:to-gray-900"
                  >
                    <Carousel
                      plugins={[autoplayPlugin.current]}
                      className="w-full"
                      onMouseEnter={() => autoplayPlugin.current.stop()}
                      onMouseLeave={() => autoplayPlugin.current.play()}
                    >
                      <CarouselContent>
                        {featuredNews.images.map((image, index) => (
                          <CarouselItem key={index}>
                            <div className="relative h-72 lg:h-96 w-full">
                              <div className="absolute inset-0  z-10" />
                              <Image
                                src={image}
                                alt={`${featuredNews.title} - изображение ${index + 1}`}
                                fill
                                className="object-contain p-4 group-hover:scale-105 transition-transform duration-700 ease-out"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                priority={index === 0}
                              />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {featuredNews.images.length > 1 && (
                        <>
                          <CarouselPrevious className="left-4 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900" />
                          <CarouselNext className="right-4 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900" />
                        </>
                      )}
                    </Carousel>

                    {/* Badges */}
                    <div className="absolute top-4 left-4 right-4 z-20 flex items-start justify-between gap-2">
                      <Badge
                        className={`${getCategoryColor(featuredNews.category)} border backdrop-blur-sm shadow-lg`}
                      >
                        {featuredNews.category}
                      </Badge>
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Рекомендуемое
                      </Badge>
                    </div>
                  </motion.div>
                ) : (
                    // Заглушка, если нет изображений
                    <div className="relative h-72 lg:h-96 w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Newspaper className="h-16 w-16 text-gray-300 dark:text-gray-600" />
                    </div>
                )}

                <CardHeader className="space-y-4 pt-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span>{formatDate(featuredNews.date)}</span>
                  </div>

                  <CardTitle className="text-2xl lg:text-3xl leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {featuredNews.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6 pb-6">
                  <CardDescription className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
                    {featuredNews.description}
                  </CardDescription>

                  <Button
                    asChild
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-xl transition-all duration-300 group/btn"
                  >
                    <Link href={`/news/${featuredNews.id}`}>
                      Читать полностью
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Regular News */}
          <div className="space-y-4 lg:space-y-6">
            {regularNews.map((news, index) => (
              <motion.div key={news.id} variants={itemVariants} custom={index}>
                <Card className="group relative overflow-hidden border border-gray-200/50 dark:border-gray-800/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-900">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-500 pointer-events-none" />

                  <CardHeader className="pb-3 relative">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <Badge
                        className={`${getCategoryColor(news.category)} border`}
                      >
                        {news.category}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(news.date)}</span>
                      </div>
                    </div>

                    <CardTitle className="text-lg lg:text-xl leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
                      {news.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="relative pt-0">
                    <CardDescription className="line-clamp-2 mb-4 text-gray-600 dark:text-gray-400">
                      {news.description}
                    </CardDescription>

                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="group/btn p-0 h-auto font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-transparent"
                    >
                      <Link href={`/news/${news.id}`} className="inline-flex items-center">
                        Подробнее
                        <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center"
        >
          <Button
            asChild
            variant="outline"
            size="lg"
            className="group border-2 border-gray-300 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <Link href="/news">
              Все новости
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}