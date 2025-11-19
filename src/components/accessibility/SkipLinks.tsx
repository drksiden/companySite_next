"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Skip Links для улучшения доступности
 * Позволяет пользователям с клавиатурой быстро перейти к основному контенту
 */
export function SkipLinks() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:z-[100] focus-within:top-4 focus-within:left-4">
      <Link
        href="#main-content"
        className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Перейти к основному контенту
      </Link>
      <Link
        href="#main-navigation"
        className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md ml-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Перейти к навигации
      </Link>
    </div>
  );
}

