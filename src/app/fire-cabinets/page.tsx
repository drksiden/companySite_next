"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  Settings,
  CheckCircle,
  Star,
  Download,
  Eye,
  Wind,
  Lock,
  AlertTriangle,
  Gauge,
  Settings2,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { SectionWrapper } from "@/components/SectionWrapper";
import Link from "next/link";
import Image from "next/image";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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
    },
  },
} as const;

const products = [
  {
    id: "shuv",
    name: "ШУВ",
    fullName: "Шкаф управления вентиляторами",
    description:
      "Автоматизированные шкафы для управления системами дымоудаления и подачи воздуха",
    image: "/images/products/shuv-cabinet.jpg",
    features: [
      "Автоматическое управление вентиляторами",
      "Контроль температурного режима",
      "Система аварийных сигналов",
      "Дистанционное управление",
      "Защита от перегрузки",
    ],
    specifications: {
      "Напряжение питания": "380В, 50Гц",
      "Степень защиты": "IP54",
      "Рабочая температура": "-40°C...+60°C",
      Мощность: "До 30 кВт",
      "Количество выходов": "2-8 каналов",
    },
  },
  {
    id: "shuz",
    name: "ШУЗ",
    fullName: "Шкаф управления задвижками",
    description:
      "Системы автоматического управления противопожарными и дымовыми клапанами",
    image: "/images/products/shuz-cabinet.jpg",
    features: [
      "Управление электроприводами клапанов",
      "Контроль положения задвижек",
      "Система обратной связи",
      "Блокировка при аварии",
      "Ручное дублирование",
    ],
    specifications: {
      "Напряжение питания": "220В, 50Гц",
      "Степень защиты": "IP54",
      "Рабочая температура": "-40°C...+60°C",
      "Количество приводов": "До 16 шт",
      "Тип управления": "24В постоянного тока",
    },
  },
];

const certifications = [
  {
    name: "ГОСТ Р 53325",
    description: "Техника пожарная. Технические средства пожарной автоматики",
  },
  {
    name: "ТР ТС 004/2011",
    description:
      "Технический регламент о безопасности низковольтного оборудования",
  },
  {
    name: "ГОСТ 12.2.007.0",
    description: "Безопасность электротехнических изделий",
  },
];

const advantages = [
  {
    icon: Shield,
    title: "Высокая надежность",
    description:
      "Использование качественных компонентов и проверенных решений обеспечивает бесперебойную работу в критических ситуациях",
  },
  {
    icon: Settings,
    title: "Гибкая настройка",
    description:
      "Возможность адаптации под различные типы систем вентиляции и дымоудаления",
  },
  {
    icon: Eye,
    title: "Полный контроль",
    description:
      "Мониторинг всех параметров работы системы в режиме реального времени",
  },
  {
    icon: Settings2,
    title: "Простое обслуживание",
    description:
      "Удобный доступ ко всем узлам для проведения технического обслуживания",
  },
];

export default function FireCabinetsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-900 via-red-800 to-orange-800 text-white py-24">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <Shield className="h-4 w-4" />
              Пожарная безопасность
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-6xl font-bold mb-6"
            >
              Шкафы управления
              <br />
              <span className="text-orange-300">ШУВ и ШУЗ</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-red-100 max-w-4xl mx-auto mb-8 leading-relaxed"
            >
              Профессиональные системы автоматического управления вентиляторами
              и противопожарными клапанами для обеспечения безопасности зданий
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                className="bg-white text-red-800 hover:bg-red-50"
              >
                <Download className="mr-2 h-5 w-5" />
                Скачать каталог
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-red-800"
              >
                Получить консультацию
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Products Overview */}
      <SectionWrapper>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="py-16"
        >
          <div className="text-center mb-16">
            <motion.h2
              variants={itemVariants}
              className="text-4xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Линейка продукции
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Комплексные решения для автоматизации систем противодымной защиты
              зданий
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                custom={index}
              >
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 h-full">
                  <div className="relative h-64">
                    <Image
                      src={product.image}
                      alt={product.fullName}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <Badge className="bg-red-600 text-white text-lg px-3 py-1 font-bold">
                        {product.name}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-900 dark:text-white">
                      {product.fullName}
                    </CardTitle>
                    <CardDescription className="text-lg">
                      {product.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">
                        Ключевые особенности:
                      </h4>
                      <ul className="space-y-2">
                        {product.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600 dark:text-gray-300">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">
                        Основные характеристики:
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(product.specifications).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-gray-600 dark:text-gray-400">
                                {key}:
                              </span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {value}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </SectionWrapper>

      {/* Advantages Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <div className="text-center mb-16">
              <motion.h2
                variants={itemVariants}
                className="text-4xl font-bold text-gray-900 dark:text-white mb-6"
              >
                Преимущества нашего оборудования
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              >
                Почему выбирают наши шкафы управления для критически важных
                систем безопасности
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {advantages.map((advantage, index) => {
                const IconComponent = advantage.icon;
                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    custom={index}
                  >
                    <Card className="text-center h-full border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                      <CardHeader>
                        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                          <IconComponent className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                        <CardTitle className="text-xl">
                          {advantage.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base leading-relaxed">
                          {advantage.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Technical Details */}
      <SectionWrapper>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="py-16"
        >
          <div className="text-center mb-16">
            <motion.h2
              variants={itemVariants}
              className="text-4xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Техническая информация
            </motion.h2>
          </div>

          <Tabs defaultValue="installation" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-8">
              <TabsTrigger value="installation" className="text-base">
                Монтаж
              </TabsTrigger>
              <TabsTrigger value="operation" className="text-base">
                Эксплуатация
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="text-base">
                Обслуживание
              </TabsTrigger>
            </TabsList>

            <TabsContent value="installation" className="mt-8">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings2 className="h-5 w-5" />
                      Требования к монтажу
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-semibold mb-4">
                          Условия установки:
                        </h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li>• Помещения с температурой от -5°C до +40°C</li>
                          <li>• Относительная влажность не более 80%</li>
                          <li>• Отсутствие агрессивных сред</li>
                          <li>• Надежное заземление</li>
                          <li>• Доступ для обслуживания не менее 0,8 м</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-4">Подключение:</h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li>• Питание 380В/220В ±10%</li>
                          <li>• Защитный автомат с характеристикой С</li>
                          <li>• УЗО с током утечки 30мА</li>
                          <li>• Заземляющий проводник PE</li>
                          <li>• Экранированные кабели для управления</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="operation" className="mt-8">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gauge className="h-5 w-5" />
                      Режимы работы
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-semibold mb-4">
                          Автоматический режим:
                        </h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li>• Запуск по сигналу от СОУЭ</li>
                          <li>• Контроль обратной связи</li>
                          <li>• Автоматическая диагностика</li>
                          <li>• Сигнализация неисправностей</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-4">
                          Ручное управление:
                        </h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li>• Местное управление с панели</li>
                          <li>• Дистанционное управление</li>
                          <li>• Аварийная остановка</li>
                          <li>• Индивидуальное управление приводами</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="maintenance" className="mt-8">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Техническое обслуживание
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-semibold mb-4">Еженедельно:</h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li>• Визуальный осмотр шкафа</li>
                          <li>• Проверка сигнальных ламп</li>
                          <li>• Тест кнопки "ПУСК"</li>
                        </ul>

                        <h4 className="font-semibold mb-4 mt-6">Ежемесячно:</h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li>• Проверка автоматического запуска</li>
                          <li>• Контроль обратной связи</li>
                          <li>• Измерение изоляции</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-4">Ежегодно:</h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li>• Полная проверка системы</li>
                          <li>• Чистка контактов</li>
                          <li>• Замена расходных материалов</li>
                          <li>• Калибровка датчиков</li>
                        </ul>

                        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                                Важно!
                              </p>
                              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                                Обслуживание должно проводиться
                                квалифицированным персоналом
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </SectionWrapper>

      {/* Certifications */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <div className="text-center mb-16">
              <motion.h2
                variants={itemVariants}
                className="text-4xl font-bold text-gray-900 dark:text-white mb-6"
              >
                Сертификации и стандарты
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-lg text-gray-600 dark:text-gray-300"
              >
                Вся наша продукция соответствует действующим стандартам и имеет
                необходимые сертификаты
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {certifications.map((cert, index) => (
                <motion.div key={index} variants={itemVariants} custom={index}>
                  <Card className="text-center h-full">
                    <CardHeader>
                      <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                        <Star className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                      <CardTitle className="text-xl">{cert.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {cert.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.h2
              variants={itemVariants}
              className="text-4xl font-bold mb-6"
            >
              Нужна консультация по выбору оборудования?
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-xl mb-8 text-red-100"
            >
              Наши специалисты помогут подобрать оптимальное решение для вашего
              объекта
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                className="bg-white text-red-600 hover:bg-red-50"
              >
                Связаться с нами
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-red-600"
              >
                <Download className="mr-2 h-5 w-5" />
                Скачать техдокументацию
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
