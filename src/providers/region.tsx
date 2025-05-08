import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { medusaClient } from '@/lib/medusaClient';

interface Region {
  id: string;
  name: string;
  currency_code: string;
  countries: Array<{
    id: string;
    iso_2: string;
    iso_3: string;
    num_code: string;
    name: string;
  }>;
}

interface RegionContextType {
  region: Region | null;
  setRegion: (region: Region) => void;
  isLoading: boolean;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegion] = useState<Region | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const { regions } = await medusaClient.regions.list();
        // По умолчанию выбираем первый регион
        if (regions.length > 0) {
          setRegion(regions[0]);
        }
      } catch (error) {
        console.error('Error fetching regions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegions();
  }, []);

  return (
    <RegionContext.Provider value={{ region, setRegion, isLoading }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
} 