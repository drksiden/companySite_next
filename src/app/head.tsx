
import { COMPANY_NAME_SHORT } from '@/data/constants';

export default function Head() {
  return (
    <>
      <title>{COMPANY_NAME_SHORT}</title>
      <meta
        name="description"
        content="Ваш надежный системный интегратор в области безопасности и автоматизации в Казахстане. Комплексные решения, монтаж, обслуживание, официальные дилеры."
      />
      <link rel="canonical" href="https://asia-ntb.kz/" />
      <link rel="icon" type="image/svg+xml" sizes="32x32" href="/images/logos/asia-ntb/Asia-NTB-logo-eng-light.svg" />
      <meta property="og:title" content="Системная интеграция и безопасность в Казахстане" />
      <meta
        property="og:description"
        content="Комплексные решения по безопасности, автоматизации и сетевому оборудованию. Официальные дилеры ведущих производителей."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://asia-ntb.kz/" />
      <meta property="og:image" content="/images/logos/asia-ntb/Asia-NTB-logo-rus-dark.svg" />
    </>
  );
}
