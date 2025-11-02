import { useQuery } from "@tanstack/react-query";

// Query Keys
export const newsKeys = {
  all: ["news"] as const,
  list: (filters?: { search?: string; category?: string; limit?: number }) =>
    [...newsKeys.all, "list", filters] as const,
  article: (id: string) => [...newsKeys.all, "article", id] as const,
};

interface NewsItem {
  id: string;
  title: string;
  description: string;
  content?: string | null;
  date: string;
  category: string;
  images: string[] | null;
  tags: string[] | null;
  author?: string | null;
  documents?: string[] | null;
  is_active: boolean;
}

// Hook для получения списка новостей через API
export function useNews(filters?: {
  search?: string;
  category?: string;
  is_active?: boolean;
  limit?: number;
}) {
  return useQuery({
    queryKey: newsKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.search) params.set("search", filters.search);
      if (filters?.category && filters.category !== "Все") {
        params.set("category", filters.category);
      }
      if (filters?.is_active !== undefined) {
        params.set("is_active", String(filters.is_active));
      }

      const response = await fetch(`/api/admin/news?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch news");
      }
      
      let data = await response.json();
      
      // Если есть лимит, применяем его на клиенте (API может не поддерживать)
      if (filters?.limit && Array.isArray(data)) {
        data = data.slice(0, filters.limit);
      }

      return (data as NewsItem[]) || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook для получения одной новости через API
export function useNewsArticle(id: string) {
  return useQuery({
    queryKey: newsKeys.article(id),
    queryFn: async () => {
      const response = await fetch(`/api/admin/news/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch news article");
      }
      const data = await response.json();
      return data as NewsItem | null;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

