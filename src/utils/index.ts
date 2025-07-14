export const formatPrice = (amount?: number | null, currencyCode: string = 'KZT'): string => {
  if (amount == null) {
    return 'Цена по запросу';
  }
  // Assuming 'amount' is already in the correct denomination
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  }).format(amount);
};