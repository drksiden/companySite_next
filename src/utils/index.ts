export const formatPrice = (
  amount?: number | null,
  currencyCode: string = "KZT",
): string => {
  if (amount == null) {
    return "Цена по запросу";
  }

  // Простое форматирование для тенге
  if (currencyCode.toUpperCase() === "KZT") {
    return `${amount.toLocaleString("kk-KZ")} ₸`;
  }

  // Для других валют используем стандартное форматирование
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
  }).format(amount);
};
