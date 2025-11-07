"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CategoryInfoData {
  slug: string;
  name: string;
  description?: string;
  image?: string;
  priceListUrl?: string;
  manufacturer?: {
    name: string;
    logo?: string;
    badge?: string; // "Официальный дилер", "Официальный дистрибьютор" и т.д.
    website?: string;
  };
  features?: string[]; // Дополнительные особенности/преимущества
}

// Локальный map с информацией о категориях (синхронизирован с CatalogShell)
const categoryInfoMap: Record<
  string,
  {
    description?: string;
    image?: string;
    priceListUrl?: string;
    manufacturer?: {
      name: string;
      logo?: string;
      badge?: string;
      website?: string;
    };
    features?: string[];
  }
> = {
  "security-fire-alarms": {
    description:
      "Комплексные системы охранно-пожарной сигнализации для защиты объектов различного назначения. От радиоканальных систем «Астра» до адресных решений для защиты вашего объекта. Полный спектр оборудования НПО «ТЕКО» в Казахстане.",
    // image: "/images/categories/security-fire-alarms.jpg",
    priceListUrl: "/price-lists/security-fire-alarms.pdf",
    manufacturer: {
      name: 'НПО "ТЕКО"',
      logo: "/images/logos/teko-logo.svg",
      badge: "Официальный дилер",
      website: "https://teko.biz",
    },
    features: [
      "Радиоканальные системы «Астра»",
      "Адресные проводные и беспроводные извещатели",
      "Интеграция с системами дымоудаления",
      "Масштабируемые решения для любых объектов",
      "Профессиональная техническая поддержка",
    ],
  },
  surveillance: {
    description:
      "Системы видеонаблюдения для мониторинга и обеспечения безопасности. Аналоговые, IP и гибридные решения с поддержкой высокого разрешения и аналитики. Полный комплекс оборудования для видеоконтроля объектов любой сложности.",
    // image: "/images/categories/surveillance.jpg",
    priceListUrl: "/price-lists/surveillance.pdf",
    features: [
      "IP-камеры высокого разрешения",
      "Аналоговые и гибридные системы",
      "Системы видеоаналитики",
      "Видеорегистраторы и серверы",
      "Комплекты для объектов различного масштаба",
    ],
  },
  "network-equipment": {
    description:
      "Сетевое оборудование и структурированные кабельные системы для построения надежных IT-инфраструктур. Коммутаторы, маршрутизаторы, патч-панели и аксессуары от ведущих производителей.",
    // image: "/images/categories/network-equipment.jpg",
    priceListUrl: "/price-lists/network-equipment.pdf",
    features: [
      "Коммутаторы и маршрутизаторы",
      "Патч-панели и коммутационные панели",
      "Аксессуары для монтажа",
      "Серверные стойки и шкафы",
      "Комплектующие для СКС",
    ],
  },
  intercoms: {
    description:
      "Системы домофонии и связи для контроля доступа и коммуникации. Аудио и видеодомофоны, системы IP-телефонии для офисов и жилых комплексов. Современные решения для обеспечения безопасности и комфорта.",
    // image: "/images/categories/intercoms.jpg",
    priceListUrl: "/price-lists/intercoms.pdf",
    features: [
      "Видеодомофоны с поддержкой IP",
      "Аудиодомофоны",
      "Системы IP-телефонии",
      "Контроллеры и коммутаторы",
      "Аксессуары и комплектующие",
    ],
  },
  "power-supplies": {
    description:
      "Источники питания и резервного питания для систем безопасности и автоматизации. Блоки питания, ИБП, аккумуляторы различных типов и емкостей. Обеспечение бесперебойной работы критически важных систем.",
    // image: "/images/categories/power-supplies.jpg",
    priceListUrl: "/price-lists/power-supplies.pdf",
    features: [
      "Блоки питания различной мощности",
      "Источники бесперебойного питания (ИБП)",
      "Аккумуляторы и батареи",
      "Зарядные устройства",
      "Контроллеры заряда",
    ],
  },
  "notification-systems": {
    description:
      "Системы оповещения и трансляции для экстренных ситуаций и фонового вещания. Громкоговорители, усилители, системы речевого оповещения. Соответствие требованиям пожарной безопасности и нормативным документам.",
    // image: "/images/categories/notification-systems.jpg",
    priceListUrl: "/price-lists/notification-systems.pdf",
    features: [
      "Системы речевого оповещения (СОУЭ)",
      "Громкоговорители и оповещатели",
      "Усилители мощности",
      "Контроллеры и блоки управления",
      "Соответствие нормам пожарной безопасности",
    ],
  },
  cables: {
    description:
      "Кабельная продукция для систем безопасности, связи и автоматизации. Силовые, сигнальные, витые пары, коаксиальные и оптоволоконные кабели. Широкий ассортимент кабельной продукции для различных применений.",
    // image: "/images/categories/cables.jpg",
    priceListUrl: "/price-lists/cables.pdf",
    features: [
      "Силовые кабели",
      "Сигнальные и контрольные кабели",
      "Витая пара (UTP, STP)",
      "Коаксиальные кабели",
      "Оптоволоконные кабели",
    ],
  },
};

interface CategoryInfoProps {
  categorySlug: string | null;
  categoryName?: string;
}

export default function CategoryInfo({ categorySlug, categoryName }: CategoryInfoProps) {
  const categoryInfo = useMemo(() => {
    if (!categorySlug) return null;
    
    const info = categoryInfoMap[categorySlug];
    if (!info) return null;
    
    return {
      slug: categorySlug,
      name: categoryName || categorySlug,
      ...info,
    };
  }, [categorySlug, categoryName]);

  if (!categoryInfo) return null;

  return (
    <Card className="mb-8 overflow-hidden border-2 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* Image */}
        {categoryInfo.image && (
          <div className="md:col-span-1">
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted border">
              <Image
                src={categoryInfo.image}
                alt={categoryInfo.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className={categoryInfo.image ? "md:col-span-2" : "md:col-span-3"}>
          <div className="space-y-4">
            {/* Header with badges */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white">
                  {categoryInfo.name}
                </h2>
                
                {/* Manufacturer badge */}
                {categoryInfo.manufacturer?.badge && (
                  <Badge 
                    variant="default" 
                    className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {categoryInfo.manufacturer.badge}
                  </Badge>
                )}
              </div>

              {/* Manufacturer info */}
              {categoryInfo.manufacturer && (
                <div className="flex items-center gap-3 flex-wrap">
                  {categoryInfo.manufacturer.logo && (
                    <div className="relative h-8 w-24">
                      <Image
                        src={categoryInfo.manufacturer.logo}
                        alt={categoryInfo.manufacturer.name}
                        fill
                        className="object-contain"
                        sizes="100px"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Оборудование:</span>
                    {categoryInfo.manufacturer.website ? (
                      <Link
                        href={categoryInfo.manufacturer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        {categoryInfo.manufacturer.name}
                      </Link>
                    ) : (
                      <span className="text-sm font-semibold text-black dark:text-white">
                        {categoryInfo.manufacturer.name}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Description */}
            {categoryInfo.description && (
              <p className="text-muted-foreground leading-relaxed text-base">
                {categoryInfo.description}
              </p>
            )}

            {/* Features */}
            {categoryInfo.features && categoryInfo.features.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-black dark:text-white">
                  Особенности:
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {categoryInfo.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Price List Button */}
            {categoryInfo.priceListUrl && (
              <div className="pt-2">
                <Button asChild variant="default" size="default" className="gap-2">
                  <Link
                    href={categoryInfo.priceListUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <Download className="h-4 w-4" />
                    Скачать прайс-лист
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

