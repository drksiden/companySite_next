import { FC } from "react";
import ServiceAccordionList from "@/components/ServiceAccordionList";
import Head from "next/head";
import { COMPANY_NAME } from "@/data/constants";

const ServicesPage: FC = () => {
  return (
    <>
      <Head>
        <title>Услуги - {COMPANY_NAME}</title>
        <meta
          name="description"
          content={`Полный перечень услуг по системам безопасности и автоматизации от ${COMPANY_NAME}. Охранная и пожарная сигнализация, видеонаблюдение, монтаж, проектирование.`}
        />
      </Head>
      <div className="bg-white dark:bg-gray-950 min-h-screen py-12">
        <ServiceAccordionList />
      </div>
    </>
  );
};

export default ServicesPage;
