import { Metadata } from "next";
import { COMPANY_NAME } from "@/data/constants";

export const metadata: Metadata = {
  title: `Услуги - ${COMPANY_NAME}`,
  description: `Полный спектр услуг по системам безопасности и автоматизации от ${COMPANY_NAME}. СКС, СКУД, СОУЭ, охранная и пожарная сигнализация, видеонаблюдение, проектирование и монтаж в Алматы.`,
  keywords: [
    "СКС",
    "СКУД",
    "СОУЭ",
    "структурированные кабельные системы",
    "системы контроля доступа",
    "системы оповещения эвакуации",
    "охранная сигнализация",
    "пожарная сигнализация",
    "видеонаблюдение",
    "автоматизация",
    "проектирование",
    "монтаж",
    "безопасность",
    "Алматы",
    "Казахстан"
  ].join(", "),
  openGraph: {
    title: `Услуги - ${COMPANY_NAME}`,
    description: `Комплексные решения в области систем безопасности, автоматизации и инженерных коммуникаций. СКС, СКУД, СОУЭ и другие услуги от ${COMPANY_NAME}.`,
    type: "website",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: `Услуги - ${COMPANY_NAME}`,
    description: `Полный спектр услуг по системам безопасности и автоматизации от ${COMPANY_NAME}.`,
  },
  alternates: {
    canonical: "/services",
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
