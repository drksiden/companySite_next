/**
 * Утилиты для отправки данных электронной коммерции в dataLayer
 * для Яндекс Метрики и Google Analytics
 */

declare global {
  interface Window {
    dataLayer?: any[];
  }
}

// Инициализация dataLayer
function initDataLayer() {
  if (typeof window !== "undefined" && !window.dataLayer) {
    window.dataLayer = [];
  }
}

// Типы событий ecommerce
export interface EcommerceProduct {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  price: number;
  quantity?: number;
  currency?: string;
  sku?: string;
}

export interface EcommerceEvent {
  ecommerce: {
    currencyCode?: string;
    items: EcommerceProduct[];
  };
}

/**
 * Отправка события просмотра товара
 */
export function trackProductView(product: EcommerceProduct) {
  initDataLayer();

  const event = {
    event: "view_item",
    ecommerce: {
      currencyCode: product.currency || "KZT",
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_brand: product.brand,
          item_category: product.category,
          price: product.price,
          quantity: product.quantity || 1,
          item_sku: product.sku,
        },
      ],
    },
  };

  window.dataLayer?.push(event);
}

/**
 * Отправка события добавления товара в корзину
 */
export function trackAddToCart(product: EcommerceProduct) {
  initDataLayer();

  const event = {
    event: "add_to_cart",
    ecommerce: {
      currencyCode: product.currency || "KZT",
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_brand: product.brand,
          item_category: product.category,
          price: product.price,
          quantity: product.quantity || 1,
          item_sku: product.sku,
        },
      ],
    },
  };

  window.dataLayer?.push(event);
}

/**
 * Отправка события удаления товара из корзины
 */
export function trackRemoveFromCart(product: EcommerceProduct) {
  initDataLayer();

  const event = {
    event: "remove_from_cart",
    ecommerce: {
      currencyCode: product.currency || "KZT",
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_brand: product.brand,
          item_category: product.category,
          price: product.price,
          quantity: product.quantity || 1,
          item_sku: product.sku,
        },
      ],
    },
  };

  window.dataLayer?.push(event);
}

/**
 * Отправка события начала оформления заказа
 */
export function trackBeginCheckout(items: EcommerceProduct[], total: number) {
  initDataLayer();

  const event = {
    event: "begin_checkout",
    ecommerce: {
      currencyCode: items[0]?.currency || "KZT",
      value: total,
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        item_brand: item.brand,
        item_category: item.category,
        price: item.price,
        quantity: item.quantity || 1,
        item_sku: item.sku,
      })),
    },
  };

  window.dataLayer?.push(event);
}

/**
 * Отправка события покупки
 */
export function trackPurchase(
  transactionId: string,
  items: EcommerceProduct[],
  total: number,
  currency: string = "KZT"
) {
  initDataLayer();

  const event = {
    event: "purchase",
    ecommerce: {
      transaction_id: transactionId,
      value: total,
      currency: currency,
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        item_brand: item.brand,
        item_category: item.category,
        price: item.price,
        quantity: item.quantity || 1,
        item_sku: item.sku,
      })),
    },
  };

  window.dataLayer?.push(event);
}

