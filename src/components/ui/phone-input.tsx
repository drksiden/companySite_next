"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PhoneInputProps extends Omit<React.ComponentProps<typeof Input>, "type" | "value" | "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
  defaultCountry?: "KZ" | "RU";
}

// Форматирование телефона в формат +7 (XXX) XXX-XX-XX
function formatPhoneNumber(value: string): string {
  // Удаляем все нецифровые символы кроме +
  const cleaned = value.replace(/[^\d+]/g, "");
  
  // Если начинается не с +7, добавляем +7
  if (!cleaned.startsWith("+7") && !cleaned.startsWith("7")) {
    if (cleaned.startsWith("8")) {
      // Заменяем 8 на +7
      const digits = cleaned.slice(1);
      return formatPhoneDigits("7" + digits);
    }
    // Если нет +7 или 7, добавляем +7
    return formatPhoneDigits("7" + cleaned);
  }
  
  // Убираем + для форматирования
  const digits = cleaned.replace(/^\+?7/, "7");
  return formatPhoneDigits(digits);
}

function formatPhoneDigits(digits: string): string {
  // Ограничиваем до 11 цифр (7 + 10 цифр)
  const limited = digits.slice(0, 11);
  
  if (limited.length === 0) return "";
  if (limited.length <= 1) return `+${limited}`;
  if (limited.length <= 4) return `+7 (${limited.slice(1)}`;
  if (limited.length <= 7) return `+7 (${limited.slice(1, 4)}) ${limited.slice(4)}`;
  if (limited.length <= 9) return `+7 (${limited.slice(1, 4)}) ${limited.slice(4, 7)}-${limited.slice(7)}`;
  return `+7 (${limited.slice(1, 4)}) ${limited.slice(4, 7)}-${limited.slice(7, 9)}-${limited.slice(9, 11)}`;
}

// Извлечение только цифр из форматированного номера
function extractDigits(value: string): string {
  const digits = value.replace(/\D/g, "");
  // Если начинается с 8, заменяем на 7
  if (digits.startsWith("8")) {
    return "7" + digits.slice(1);
  }
  // Если не начинается с 7, добавляем 7
  if (!digits.startsWith("7") && digits.length > 0) {
    return "7" + digits;
  }
  return digits;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value = "", onChange, defaultCountry = "KZ", ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(() => formatPhoneNumber(value));

    React.useEffect(() => {
      if (value !== extractDigits(displayValue)) {
        setDisplayValue(formatPhoneNumber(value));
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const formatted = formatPhoneNumber(inputValue);
      setDisplayValue(formatted);
      
      // Извлекаем только цифры для onChange
      const digits = extractDigits(formatted);
      onChange?.(digits.length > 0 ? `+${digits}` : "");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Разрешаем удаление, навигацию и специальные клавиши
      if (
        e.key === "Backspace" ||
        e.key === "Delete" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "Tab" ||
        e.key === "Home" ||
        e.key === "End" ||
        (e.ctrlKey && (e.key === "a" || e.key === "c" || e.key === "v" || e.key === "x"))
      ) {
        return;
      }
      
      // Разрешаем только цифры
      if (!/^\d$/.test(e.key)) {
        e.preventDefault();
      }
    };

    return (
      <Input
        ref={ref}
        type="tel"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="+7 (707) 123-45-67"
        maxLength={18} // +7 (XXX) XXX-XX-XX
        className={cn(className)}
        {...props}
      />
    );
  }
);

PhoneInput.displayName = "PhoneInput";

