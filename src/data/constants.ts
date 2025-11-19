export const COMPANY_NAME = "Азия New Technology Build";
export const COMPANY_NAME_EN = "Asia New Technology Build";
export const COMPANY_NAME_SHORT = "Азия NTB";
export const COMPANY_NAME_SHORT_EN = "Asia NTB";
export const COMPANY_ADDRESS = "г.Алматы, ул.Толе Би, д.280, Этаж №13";
// Контакты Персональные
export const ALEXEY_PHONE = "+7 (707) 382-43-45"; // Номер Алексея
export const ALEXEY_EMAIL = "alekseysmolnikov1986@gmail.com";

export const OLEG_PHONE = "+7 (707) 382-43-45"; // Номер Олега
export const OLEG_EMAIL = "lacosta2000@bk.ru";

// Общие/Городские телефоны (если есть)
export const COMPANY_CITY_PHONE1 = "+7 (727) 301-50-23";
export const COMPANY_CITY_PHONE2 = "+7 (727) 301-50-24";

// Общие Email (если есть)
// export const COMPANY_EMAIL_GENERAL = "info@yourcompany.kz";

export const facebookUrl = "https://facebook.com";
export const instagramUrl = "https://instagram.com";
export const youtubeUrl = "https://youtube.com";

// Структура прайслистов
export interface Pricelist {
  name: string;
  url: string;
}

// Массив прайслистов (можно расширить через переменные окружения)
export const PRICELISTS: Pricelist[] = [
  {
    name: "Прайс-лист ТЕКО, РРЦ, с НДС",
    url: "https://r2.asia-ntb.kz/documents/pricelists/%D0%9F%D1%80%D0%B0%D0%B9%D1%81-%D0%BB%D0%B8%D1%81%D1%82%20%D0%A2%D0%95%D0%9A%D0%9E%2C%20%D0%A0%D0%A0%D0%A6%2C%20%D1%81%20%D0%9D%D0%94%D0%A1.xls",
  },
  // Можно добавить больше прайслистов здесь или через переменные окружения
];