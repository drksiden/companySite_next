"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollableAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxHeight?: string;
  scrollbarStyle?: "hidden" | "minimal" | "default";
  showGradients?: boolean;
  className?: string;
}

export function ScrollableArea({
  children,
  maxHeight = "calc(100vh - 140px)",
  scrollbarStyle = "hidden",
  showGradients = true,
  className,
  ...props
}: ScrollableAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showTopGradient, setShowTopGradient] = useState(false);
  const [showBottomGradient, setShowBottomGradient] = useState(false);

  const handleScroll = () => {
    if (!scrollRef.current || !showGradients) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

    setShowTopGradient(scrollTop > 10);
    setShowBottomGradient(scrollTop < scrollHeight - clientHeight - 10);
  };

  useEffect(() => {
    if (!scrollRef.current || !showGradients) return;

    const element = scrollRef.current;
    const { scrollHeight, clientHeight } = element;

    // Показать нижний градиент если контент больше области просмотра
    setShowBottomGradient(scrollHeight > clientHeight);

    // Добавить обработчик прокрутки
    element.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  }, [showGradients, children]);

  const scrollAreaClasses = {
    hidden: "dialog-scroll-area",
    minimal: "dialog-scroll-minimal",
    default: "overflow-y-auto overflow-x-hidden",
  };

  return (
    <div className="relative flex-1 min-h-0">
      {/* Градиентные индикаторы */}
      {showGradients && (
        <>
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-background via-background/80 to-transparent z-10 pointer-events-none transition-opacity duration-300",
              showTopGradient ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background via-background/80 to-transparent z-10 pointer-events-none transition-opacity duration-300",
              showBottomGradient ? "opacity-100" : "opacity-0",
            )}
          />
        </>
      )}

      {/* Область прокрутки */}
      <div
        ref={scrollRef}
        className={cn(
          scrollAreaClasses[scrollbarStyle],
          "flex-1 min-h-0",
          className,
        )}
        style={{ maxHeight }}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

// Компонент-обертка для форм в диалогах
export function DialogScrollableContent({
  children,
  className,
  ...props
}: Omit<ScrollableAreaProps, "maxHeight" | "scrollbarStyle">) {
  return (
    <ScrollableArea
      maxHeight="calc(100vh - 180px)"
      scrollbarStyle="hidden"
      showGradients={true}
      className={cn("px-1", className)}
      {...props}
    >
      {children}
    </ScrollableArea>
  );
}

// Demo компонент для тестирования различных вариантов прокрутки
export function ScrollableAreaDemo({
  children,
}: {
  children: React.ReactNode;
}) {
  const [scrollbarStyle, setScrollbarStyle] = useState<
    "hidden" | "minimal" | "default"
  >("hidden");
  const [showGradients, setShowGradients] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex gap-4 p-4 bg-muted rounded-lg">
        <div className="space-y-2">
          <label className="text-sm font-medium">Стиль скроллбара:</label>
          <select
            value={scrollbarStyle}
            onChange={(e) => setScrollbarStyle(e.target.value as any)}
            className="px-3 py-1 border rounded text-sm"
          >
            <option value="hidden">Скрытый</option>
            <option value="minimal">Минимальный</option>
            <option value="default">Стандартный</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Градиенты:</label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showGradients}
              onChange={(e) => setShowGradients(e.target.checked)}
            />
            <span className="text-sm">Показывать градиенты</span>
          </label>
        </div>
      </div>

      <ScrollableArea
        scrollbarStyle={scrollbarStyle}
        showGradients={showGradients}
        maxHeight="400px"
        className="border rounded-lg p-4"
      >
        {children}
      </ScrollableArea>
    </div>
  );
}

export default ScrollableArea;
