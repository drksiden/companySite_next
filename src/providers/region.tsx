// src/components/providers/RegionProvider.tsx (или ваш путь)
'use client';

import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { HttpTypes } from '@medusajs/types';

// Тип для контекста региона
interface RegionContextType {
  region: HttpTypes.StoreRegion | null;
  setRegion: (region: HttpTypes.StoreRegion | null) => void;
  // Здесь могут быть другие функции, например, для выбора региона
}

const RegionContext = createContext<RegionContextType | null>(null);

interface RegionProviderProps {
  children: ReactNode;
}

export const RegionProvider = ({ children }: RegionProviderProps) => {
  // ЗАГЛУШКА: Используем данные, более близкие к вашему JSON от Medusa
  // В реальном приложении здесь будет useEffect для загрузки регионов 
  // из Medusa (sdk.regions.list()) и установки первого доступного или выбранного пользователем.
  const [region, setRegion] = useState<HttpTypes.StoreRegion | null>({
    id: "reg_01JV0KCGE6A68YG64EJZY98SGB",
    name: "Almaty",
    currency_code: "kzt",
    tax_rate: 0, // Medusa ожидает это поле, обычно 0, если налоги не настроены специфично
    tax_code: null, // Или пустая строка, если это строка
    gift_cards_taxable: false,
    automatic_taxes: false,
    countries: [
      {
        id: "country_kz_placeholder", // Пример ID для страны, в Medusa это будет что-то вроде "country_xxxx"
        iso_2: "kz",
        iso_3: "kaz",
        num_code: 398, // Из вашего JSON
        name: "KAZAKHSTAN", // Из вашего JSON
        display_name: "Kazakhstan", // Из вашего JSON
        region_id: "reg_01JV0KCGE6A68YG64EJZY98SGB", // Ссылка на родительский регион
      }
    ],
    payment_providers: [ // Пример из вашего JSON
      {
        id: "pp_system_default",
        is_enabled: true,
      }
    ],
    fulfillment_providers: [], // Обычно это массив, может быть пустым
    includes_tax: false, // Добавлено, т.к. часто является частью типа
    metadata: null,
    created_at: "2025-05-11T21:18:00.653Z", // Из вашего JSON
    updated_at: "2025-05-11T21:18:00.653Z", // Из вашего JSON
    deleted_at: null,
  } as unknown as HttpTypes.StoreRegion); // Используем as unknown as HttpTypes.StoreRegion для упрощения заглушки,
                                          // так как не все поля HttpTypes.StoreRegion здесь заполнены (например, tax_provider_id)

  const value = useMemo(() => ({
    region,
    setRegion,
  }), [region]);

  return (
    <RegionContext.Provider value={value}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = (): RegionContextType => {
  const context = useContext(RegionContext);
  if (context === null) {
    throw new Error("useRegion должен использоваться внутри RegionProvider");
  }
  return context;
};
