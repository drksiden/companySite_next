"use client";

import { useQuery } from "@tanstack/react-query";
import { Download, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Pricelist {
  name: string;
  url: string;
  size?: number;
  lastModified?: string;
}

async function fetchPricelists(): Promise<Pricelist[]> {
  try {
    const response = await fetch('/api/pricelists');
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    return [];
  }
}

export function PricelistDropdown() {
  const { data: pricelists = [], isLoading } = useQuery({
    queryKey: ['pricelists'],
    queryFn: fetchPricelists,
    staleTime: 3600000, // 1 hour
    refetchOnWindowFocus: false,
    retry: 1,
  });

  if (isLoading) {
    return (
      <Button variant="outline" className="gap-2" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="hidden sm:inline">Загрузка...</span>
      </Button>
    );
  }

  if (!pricelists || pricelists.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Скачать прайслист</span>
          <span className="sm:hidden">Прайслист</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {pricelists.map((pricelist, index) => (
          <DropdownMenuItem
            key={index}
            asChild
          >
            <a
              href={pricelist.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer"
            >
              <Download className="mr-2 h-4 w-4" />
              <span className="line-clamp-2">{pricelist.name}</span>
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
