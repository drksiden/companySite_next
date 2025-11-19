/**
 * Утилиты для работы с историей просмотров товаров
 */

const VIEW_HISTORY_KEY = 'product-view-history';
const MAX_HISTORY_ITEMS = 20;

export interface ViewHistoryItem {
  id: string;
  slug: string;
  name: string;
  thumbnail?: string;
  price: number;
  viewedAt: number;
}

/**
 * Добавить товар в историю просмотров
 */
export function addToViewHistory(item: Omit<ViewHistoryItem, 'viewedAt'>): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getViewHistory();
    
    // Удаляем товар, если он уже есть в истории
    const filtered = history.filter(h => h.id !== item.id);
    
    // Добавляем в начало
    const newHistory: ViewHistoryItem[] = [
      {
        ...item,
        viewedAt: Date.now(),
      },
      ...filtered,
    ].slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(VIEW_HISTORY_KEY, JSON.stringify(newHistory));
    
    // Отправляем событие для обновления UI
    window.dispatchEvent(new CustomEvent('view-history-updated'));
  } catch (error) {
    console.error('Error saving view history:', error);
  }
}

/**
 * Получить историю просмотров
 */
export function getViewHistory(): ViewHistoryItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(VIEW_HISTORY_KEY);
    if (!stored) return [];
    
    const history = JSON.parse(stored) as ViewHistoryItem[];
    return history.sort((a, b) => b.viewedAt - a.viewedAt);
  } catch (error) {
    console.error('Error reading view history:', error);
    return [];
  }
}

/**
 * Очистить историю просмотров
 */
export function clearViewHistory(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(VIEW_HISTORY_KEY);
    window.dispatchEvent(new CustomEvent('view-history-updated'));
  } catch (error) {
    console.error('Error clearing view history:', error);
  }
}

/**
 * Удалить товар из истории
 */
export function removeFromViewHistory(productId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getViewHistory();
    const filtered = history.filter(h => h.id !== productId);
    localStorage.setItem(VIEW_HISTORY_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('view-history-updated'));
  } catch (error) {
    console.error('Error removing from view history:', error);
  }
}

