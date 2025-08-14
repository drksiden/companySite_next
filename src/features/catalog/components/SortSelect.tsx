"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const sortOptions = [
  { value: "name.asc", label: "По названию (А-Я)" },
  { value: "name.desc", label: "По названию (Я-А)" },
  { value: "price.asc", label: "По цене (возрастание)" },
  { value: "price.desc", label: "По цене (убывание)" },
  { value: "created.desc", label: "Сначала новые" },
];

export default function SortSelect({ value, onChange, disabled = false }: SortSelectProps) {
  const currentOption = sortOptions.find(option => option.value === value);

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Сортировка">
            {currentOption?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
