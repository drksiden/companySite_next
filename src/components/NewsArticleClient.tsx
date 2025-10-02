"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  ArrowLeft,
  Share2,
  BookOpen,
  Tag,
  Newspaper,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import { ProductImageGallery } from "./product/ProductImageGallery";
import { toast } from "sonner";

// Интерфейс NewsItem, соответствующий Supabase
interface NewsItem {
  id: string;
  title: string;
  description: string;
  content: string;
  date: string;
  category: string;
  images: string[] | null;
  tags: string[] | null;
  author: string | null;
}

interface RelatedNewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
}

interface NewsArticleClientProps {
  article: NewsItem;
  relatedNews: RelatedNewsItem[];
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
    default:
      return "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300 border-gray-200 dark:border-gray-800";
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};


export default function NewsArticleClient({ article, relatedNews }: NewsArticleClientProps) {
  const autoplayPlugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  const handleShare = async () => {
    const shareData = {
      title: article.title,
      text: article.description,
      url: window.location.href,
    };

    if (navigator.share &&
      navigator.canShare &&
      navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast.error("Не удалось поделиться контентом");
        }
      }
    } else {
      // Fallback: копируем ссылку в буфер обмена
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Ссылка скопирована в буфер обмена!");
      } catch (error) {
        // Fallback для старых браузеров
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand("copy");
          toast.success("Ссылка скопирована в буфер обмена!");
        } catch (err) {
          toast.error("Не удалось скопировать ссылку");
        }

        document.body.removeChild(textArea);
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Article Header */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="mb-8">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 backdrop-blur-sm border border-white/20"
              >
                <Link href="/news">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад к новостям
                </Link>
              </Button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-4 mb-6"
            >
              <Badge className={`${getCategoryColor(article.category)} border backdrop-blur-sm`}>
                {article.category}
              </Badge>
              <div className="flex items-center gap-4 text-sm text-blue-100">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(article.date)}</span>
                </div>
                {article.author && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{article.author}</span>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              {article.title}
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-blue-100 leading-relaxed mb-8"
            >
              {article.description}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-4"
            >
              {article.tags && article.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-1">
                  <Tag className="h-4 w-4 text-blue-300" />
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-white border-white/30 bg-white/5 backdrop-blur-sm"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <Button
                onClick={handleShare}
                variant="outline"
                size="sm"
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Поделиться
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Article Images Carousel */}
      {article.images && article.images.length > 0 && (
  <section className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
    {/* Внешний контейнер для центрирования и адаптивности */}
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Контейнер для ProductImageGallery:
          1. w-full: Полная ширина.
          2. max-h-[75vh]: Ограничиваем максимальную высоту 75% высоты экрана (vh).
          3. aspect-video: Устанавливаем соотношение сторон 16:9 для горизонтального вида.
      */}
      <div className="w-full  mx-auto">
        <ProductImageGallery
          images={article.images}
          productName={article.title}
          // Класс 'h-full' заставит галерею занять всю высоту родителя
          className="h-full" 
        />
      </div>

      {/* Убираем старый индикатор количества, так как он есть в галерее */}
      {/*
      {article.images.length > 1 && (
        <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
          Изображение {1} из {article.images.length}
        </p>
      )}
      */}
    </div>
  </section>
)}
      {/* Article Content */}
      <SectionWrapper>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="py-16"
        >
          <div className="max-w-4xl mx-auto">
            <motion.div variants={itemVariants}>
              <Card className="border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
                <CardContent className="p-8 md:p-12 lg:p-16">
                  <div
                    className="prose prose-lg dark:prose-invert max-w-none 
                    prose-headings:text-gray-900 dark:prose-headings:text-white 
                    prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                    prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                    prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6
                    prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:my-2
                    prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
                    prose-ul:my-6 prose-ul:space-y-2
                    prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                </CardContent>
              </Card>
            </motion.div>

            <Separator className="my-16" />

            {/* Related News */}
            <motion.div variants={itemVariants}>
              <h3 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                Похожие новости
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedNews.map((news) => (
                  <Link key={news.id} href={`/news/${news.id}`}>
                    <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200/50 dark:border-gray-800/50">
                      <CardContent className="p-6">
                        <Badge className={`${getCategoryColor(news.category)} border mb-4`}>
                          {news.category}
                        </Badge>
                        <h4 className="font-semibold text-lg mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 leading-snug">
                          {news.title}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(news.date)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Navigation */}
            <motion.div variants={itemVariants} className="mt-16 text-center">
              <Button asChild size="lg" className="shadow-md hover:shadow-xl transition-all duration-300">
                <Link href="/news">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Вернуться к списку новостей
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </SectionWrapper>
    </div>
  );
}