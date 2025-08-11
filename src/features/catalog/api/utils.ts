export class CatalogApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any,
  ) {
    super(message);
    this.name = "CatalogApiError";
  }
}

export const handleSupabaseError = (error: any, context: string): never => {
  console.error(`Supabase error in ${context}:`, error);
  throw new CatalogApiError(
    error.message || `Error in ${context}`,
    error.code,
    error.details,
  );
};

export const createApiResponse = <T>(data: T, meta?: any) => ({
  data,
  success: true,
  meta,
});

export const formatPrice = (amount?: number, currencyCode = "KZT"): string => {
  if (typeof amount !== "number") {
    return "Цена по запросу";
  }

  const formatOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  };

  // Для некоторых валют используем дробные части
  if (["USD", "EUR"].includes(currencyCode)) {
    formatOptions.minimumFractionDigits = 2;
    formatOptions.maximumFractionDigits = 2;
  }

  if (formatOptions.currency === "KZT") {
    return `${amount.toLocaleString("kk-KZ")} ₸`;
  }
  return new Intl.NumberFormat("ru-RU", formatOptions).format(amount);
};
