"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  ArrowLeft,
  BookOpen,
  Tag,
  Newspaper,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SectionWrapper } from "@/components/SectionWrapper";
import Link from "next/link";
import { useRef } from "react";
import { ProductImageGallery } from "./product/ProductImageGallery";
import { toast } from "sonner";
import Autoplay from "embla-carousel-autoplay";
import { HtmlContent } from "@/components/ui/html-content";
import { FileText, Download, ExternalLink } from "lucide-react";
import { ShareButton } from "@/components/share/ShareButton";

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
  documents: string[] | null;
  is_active: boolean;
}

interface RelatedNewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  is_active: boolean;
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
      return "bg-blue-500/20 text-blue-300 border-blue-800";
    case "Сертификация":
      return "bg-emerald-500/20 text-emerald-300 border-emerald-800";
    case "Компания":
      return "bg-purple-500/20 text-purple-300 border-purple-800";
    case "События":
      return "bg-orange-500/20 text-orange-300 border-orange-800";
    case "Партнерство":
      return "bg-pink-500/20 text-pink-300 border-pink-800";
    default:
      return "bg-gray-500/20 text-gray-300 border-gray-800";
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

export default function NewsArticleClient({
  article,
  relatedNews,
}: NewsArticleClientProps) {
  const autoplayPlugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );


  return (
    <div className="min-h-screen">
      {/* Article Header */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-20 overflow-hidden">
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
          >
            <motion.div variants={itemVariants} className="mb-8">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 backdrop-blur-sm border border-white/30 bg-white/5"
              >
                <Link href="..">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад
                </Link>
              </Button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-4 mb-6"
            >
              <Badge
                className={`${getCategoryColor(article.category)} border backdrop-blur-sm font-medium`}
              >
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
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent"
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
                        className="text-white border-white/30 bg-white/5 backdrop-blur-sm font-medium"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <ShareButton
                title={article.title}
                text={article.description}
                variant="outline"
                size="sm"
                className="text-white border-white/30 dark:border-white/30 bg-white/5 dark:bg-white/5 hover:bg-white/10 hover:text-white backdrop-blur-sm font-medium"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Article Images Carousel */}
      {article.images && article.images.length > 0 && (
        <section className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="w-full">
              <ProductImageGallery
                images={article.images}
                productName={article.title}
                maxWidth="4xl"
                className="h-full"
              />
            </div>
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
          className="py-16 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-4xl mx-auto">
            <motion.div variants={itemVariants}>
              <Card className="border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
                <CardContent className="p-8 md:p-12 lg:p-16">
                  {article.content ? (
                    <HtmlContent
                      content={article.content}
                      variant="product"
                      className="text-gray-700 dark:text-gray-300"
                    />
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Содержание новости отсутствует
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Documents Section */}
            {article.documents && article.documents.length > 0 && (
              <>
                <Separator className="my-12" />
                <motion.div variants={itemVariants}>
                  <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                    Документы
                  </h3>
                  <div className="space-y-2">
                    {article.documents.map((doc, index) => {
                      // Документ всегда строка (URL)
                      const docUrl = doc;
                      const docName = doc.split("/").pop() || `Документ ${index + 1}`;
                      const docType = doc.split(".").pop()?.toUpperCase() || "FILE";

                      return (
                        <a
                          key={index}
                          href={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors group"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium text-foreground truncate">
                              {docName}
                            </span>
                            {docType && (
                              <Badge
                                variant="secondary"
                                className="text-xs flex-shrink-0"
                              >
                                {docType}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}

            {relatedNews && relatedNews.length > 0 && (
              <>
                <Separator className="my-16" />

                <motion.div variants={itemVariants}>
                  <h3 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                    Похожие новости
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {relatedNews.map((news) => (
                      <Link key={news.id} href={`/news/${news.id}`}>
                        <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200/50 dark:border-gray-800/50">
                          <CardContent className="p-6">
                            <Badge
                              className={`${getCategoryColor(news.category)} border mb-4 font-medium`}
                            >
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
              </>
            )}
            
            {/* Navigation */}
            {/* <motion.div variants={itemVariants} className="mt-16 text-center">
              <Button
                asChild
                size="lg"
                className="shadow-md hover:shadow-xl transition-all duration-300"
              >
                <Link href="/news">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Вернуться к списку новостей
                </Link>
              </Button>
            </motion.div> */}
          </div>
        </motion.div>
      </SectionWrapper>
    </div>
  );
}