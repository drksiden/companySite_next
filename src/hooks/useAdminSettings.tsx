"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";

interface AdminSettings {
  autoRefresh: boolean;
  refreshInterval: number; // в миллисекундах
  cacheEnabled: boolean;
  cacheDuration: number; // в миллисекундах
  isDevelopment: boolean;
}

interface AdminSettingsContextType {
  settings: AdminSettings;
  updateSettings: (newSettings: Partial<AdminSettings>) => void;
  resetSettings: () => void;
  canAutoRefresh: boolean;
}

const defaultSettings: AdminSettings = {
  autoRefresh: false, // По умолчанию отключено для dev режима
  refreshInterval: 5 * 60 * 1000, // 5 минут
  cacheEnabled: true,
  cacheDuration: 3 * 60 * 1000, // 3 минуты
  isDevelopment: process.env.NODE_ENV === "development",
};

const AdminSettingsContext = createContext<AdminSettingsContextType | null>(null);

export function AdminSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AdminSettings>(() => {
    // Загружаем настройки из localStorage при инициализации
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin-settings");
      if (saved) {
        try {
          const parsedSettings = JSON.parse(saved);
          return {
            ...defaultSettings,
            ...parsedSettings,
            isDevelopment: process.env.NODE_ENV === "development",
          };
        } catch (error) {
          console.warn("Не удалось загрузить настройки админки:", error);
        }
      }
    }
    return defaultSettings;
  });

  // Сохраняем настройки в localStorage при изменении
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("admin-settings", JSON.stringify(settings));
    }
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<AdminSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin-settings");
    }
  }, []);

  // Определяем, можно ли использовать автообновление
  const canAutoRefresh = settings.autoRefresh && !settings.isDevelopment;

  const value: AdminSettingsContextType = {
    settings,
    updateSettings,
    resetSettings,
    canAutoRefresh,
  };

  return (
    <AdminSettingsContext.Provider value={value}>
      {children}
    </AdminSettingsContext.Provider>
  );
}

export function useAdminSettings() {
  const context = useContext(AdminSettingsContext);
  if (!context) {
    throw new Error("useAdminSettings должен использоваться внутри AdminSettingsProvider");
  }
  return context;
}

// Хук для автообновления данных
export function useAutoRefresh(
  callback: () => void,
  dependencies: React.DependencyList = [],
  enabled: boolean = true
) {
  const { canAutoRefresh, settings } = useAdminSettings();

  useEffect(() => {
    if (!canAutoRefresh || !enabled) {
      return;
    }

    const interval = setInterval(() => {
      callback();
    }, settings.refreshInterval);

    return () => clearInterval(interval);
  }, [canAutoRefresh, enabled, settings.refreshInterval, callback, ...dependencies]);
}

// Хук для кэширования данных
export function useDataCache<T>(key: string, initialData: T | null = null) {
  const { settings } = useAdminSettings();
  const [cache, setCache] = useState<Map<string, { data: T; timestamp: number }>>(new Map());

  const getCachedData = useCallback((cacheKey: string): T | null => {
    if (!settings.cacheEnabled) return null;

    const cached = cache.get(cacheKey);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > settings.cacheDuration) {
      // Кэш устарел
      cache.delete(cacheKey);
      setCache(new Map(cache));
      return null;
    }

    return cached.data;
  }, [cache, settings.cacheEnabled, settings.cacheDuration]);

  const setCachedData = useCallback((cacheKey: string, data: T) => {
    if (!settings.cacheEnabled) return;

    setCache(prev => {
      const newCache = new Map(prev);
      newCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
      return newCache;
    });
  }, [settings.cacheEnabled]);

  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  const clearCacheKey = useCallback((cacheKey: string) => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(cacheKey);
      return newCache;
    });
  }, []);

  return {
    getCachedData,
    setCachedData,
    clearCache,
    clearCacheKey,
    isCacheEnabled: settings.cacheEnabled,
  };
}

// Компонент для настроек админки
export function AdminSettingsPanel() {
  const { settings, updateSettings, resetSettings } = useAdminSettings();

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Настройки админки</h3>

      {settings.isDevelopment && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            <strong>Режим разработки:</strong> автообновление отключено для предотвращения
            перезагрузки данных во время работы с базой.
          </p>
        </div>
      )}

      <div className="space-y-3">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.autoRefresh}
            onChange={(e) => updateSettings({ autoRefresh: e.target.checked })}
            className="rounded"
          />
          <span>Автообновление данных</span>
        </label>

        <div>
          <label className="block text-sm font-medium mb-1">
            Интервал обновления (минуты)
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={settings.refreshInterval / (60 * 1000)}
            onChange={(e) =>
              updateSettings({
                refreshInterval: parseInt(e.target.value) * 60 * 1000
              })
            }
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.cacheEnabled}
            onChange={(e) => updateSettings({ cacheEnabled: e.target.checked })}
            className="rounded"
          />
          <span>Кэширование данных</span>
        </label>

        <div>
          <label className="block text-sm font-medium mb-1">
            Время жизни кэша (минуты)
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={settings.cacheDuration / (60 * 1000)}
            onChange={(e) =>
              updateSettings({
                cacheDuration: parseInt(e.target.value) * 60 * 1000
              })
            }
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <button
        onClick={resetSettings}
        className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
      >
        Сбросить настройки
      </button>
    </div>
  );
}
