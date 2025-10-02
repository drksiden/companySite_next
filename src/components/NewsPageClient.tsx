"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  ArrowRight,
  Newspaper,
  Search,
  Filter,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { SectionWrapper } from "@/components/SectionWrapper";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef } from "react";
import Autoplay from "embla-carousel-autoplay";

// Интерфейс NewsItem, соответствующий Supabase
interface NewsItem {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  images: string[] | null;
  tags: string[] | null;
}

interface NewsPageClientProps {
  initialNews: NewsItem[];
  categories: string[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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
    case "Партнерство":
      return "bg-pink-500/10 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300 border-pink-200 dark:border-pink-800";
    case "Обучение":
      return "bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
    case "Технологии":
      return "bg-cyan-500/10 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800";
    default:
      return "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300 border-gray-200 dark:border-gray-800";
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  // Добавьте проверку на валидность даты, т.к. Supabase может вернуть просто строку
  if (isNaN(date.getTime())) return dateString; 
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export function NewsPageClient({ initialNews, categories }: NewsPageClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const autoplayPlugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  const filteredNews = initialNews.filter((item) => {
    // Безопасная проверка на null для tags
    const tagsText = item.tags ? item.tags.join(" ").toLowerCase() : "";
    
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tagsText.includes(searchTerm.toLowerCase()); // Добавлено: поиск по тегам

    const matchesCategory =
      selectedCategory === "Все" || item.category === selectedCategory;
      
    return matchesSearch && matchesCategory;
  });

  // Определяем рекомендуемую новость как самую свежую (первую в отфильтрованном списке)
  const featuredNews = filteredNews.length > 0 ? filteredNews[0] : null;
  // Остальные новости для сетки
  const regularNews = filteredNews.slice(featuredNews ? 1 : 0);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 text-sm font-semibold mb-6"
            >
              <Newspaper className="h-4 w-4" />
              Новости и события
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent"
            >
              Новости компании
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed"
            >
              Актуальная информация о новых продуктах, достижениях и событиях в
              области пожарной безопасности
            </motion.p>
          </motion.div>
        </div>
      </section>

      <SectionWrapper>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="py-16"
        >
          {/* Filters */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row gap-4 mb-12"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
              <Input
                placeholder="Поиск новостей..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base border-gray-300 dark:border-gray-700 focus-visible:ring-blue-500"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full md:w-56 h-12 border-gray-300 dark:border-gray-700">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {/* Использование категорий, переданных через пропсы */}
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Featured News */}
          {featuredNews && (
            <motion.div variants={itemVariants} className="mb-16">
              <Card className="group relative overflow-hidden border border-gray-200/50 dark:border-gray-800/50 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white dark:bg-gray-900">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  {/* Image Carousel */}
                  {featuredNews.images && featuredNews.images.length > 0 && (
                    <div className="relative ">
                      <Carousel
                        plugins={[autoplayPlugin.current]}
                        className="w-full"
                        onMouseEnter={() => autoplayPlugin.current.stop()}
                        onMouseLeave={() => autoplayPlugin.current.play()}
                      >
                        <CarouselContent>
                          {featuredNews.images.map((image, index) => (
                            <CarouselItem key={index}>
                              <div className="relative h-80 lg:h-full w-full min-h-[400px]">
                                <div className="absolute inset-0 z-10" />
                                <Image
                                  src={image}
                                  alt={`${featuredNews.title} - изображение ${index + 1}`}
                                  fill
                                  className="object-contain p-6 group-hover:scale-105 transition-transform duration-700 ease-out"
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

                      {/* Badges on image */}
                      <div className="absolute top-6 left-6 right-6 z-20 flex items-start justify-between gap-2">
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
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-8 lg:p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span>{formatDate(featuredNews.date)}</span>
                    </div>

                    <CardTitle className="text-3xl lg:text-4xl leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 mb-4">
                      {featuredNews.title}
                    </CardTitle>

                    <CardDescription className="text-lg leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                      {featuredNews.description}
                    </CardDescription>

                    {featuredNews.tags && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {featuredNews.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs border-gray-300 dark:border-gray-700"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Button
                      asChild
                      size="lg"
                      className="w-fit bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-xl transition-all duration-300 group/btn"
                    >
                      <Link href={`/news/${featuredNews.id}`}>
                        Читать полностью
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* News Grid */}
          {regularNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              {regularNews.map((news, index) => (
                <motion.div
                  key={news.id}
                  variants={itemVariants}
                  custom={index}
                >
                  <Card className="group h-full overflow-hidden border border-gray-200/50 dark:border-gray-800/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-900">
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-500 pointer-events-none" />

                    {news.images && news.images.length > 0 && (
                      <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                        <Image
                          src={news.images[0]}
                          alt={news.title}
                          fill
                          className="object-contain p-4 group-hover:scale-105 transition-transform duration-700"
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        />
                        <Badge
                          className={`absolute top-4 left-4 ${getCategoryColor(news.category)} border backdrop-blur-sm`}
                        >
                          {news.category}
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="pb-3 relative">
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        {(!news.images || news.images.length === 0) && (
                          <Badge
                            className={`${getCategoryColor(news.category)} border`}
                          >
                            {news.category}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 ml-auto">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(news.date)}</span>
                        </div>
                      </div>

                      <CardTitle className="text-xl leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
                        {news.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col pt-0 relative">
                      <CardDescription className="line-clamp-3 mb-4 flex-1 text-gray-600 dark:text-gray-400">
                        {news.description}
                      </CardDescription>

                      {news.tags && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {news.tags.slice(0, 3).map((tag, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs border-gray-300 dark:border-gray-700"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="group/btn p-0 h-auto font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-transparent self-start"
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
          ) : (
            <motion.div variants={itemVariants} className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
                <Newspaper className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Новости не найдены
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Попробуйте изменить параметры поиска или выбрать другую категорию
              </p>
            </motion.div>
          )}
        </motion.div>
      </SectionWrapper>
    </div>
  );
}