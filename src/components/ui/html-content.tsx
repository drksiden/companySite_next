"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface HtmlContentProps {
  content: string;
  className?: string;
  variant?: "default" | "compact" | "product";
}

export function HtmlContent({
  content,
  className,
  variant = "default",
}: HtmlContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && content) {
      // Устанавливаем HTML контент напрямую
      containerRef.current.innerHTML = content;
      
      // Добавляем обработчики для ссылок, чтобы открывались в новой вкладке
      const links = containerRef.current.querySelectorAll("a");
      links.forEach((link) => {
        if (link.href && !link.target) {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        }
      });
    }
  }, [content]);

  const baseStyles = {
    default: "prose prose-lg max-w-none dark:prose-invert",
    compact: "prose prose-sm max-w-none dark:prose-invert",
    product:
      "prose prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-blockquote:border-primary prose-blockquote:text-muted-foreground prose-code:text-primary prose-pre:bg-muted prose-pre:text-foreground",
  };

  if (!content || content.trim() === "") {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        baseStyles[variant],
        className,
        // Дополнительные стили для HTML элементов
        "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:mb-6 [&_h1]:mt-8 [&_h1]:first:mt-0 [&_h1]:border-b [&_h1]:pb-2",
        "[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:first:mt-0 [&_h2]:border-b [&_h2]:pb-2",
        "[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mb-3 [&_h3]:mt-6 [&_h3]:first:mt-0",
        "[&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-foreground [&_h4]:mb-2 [&_h4]:mt-4 [&_h4]:first:mt-0",
        "[&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:mb-4 [&_p]:text-base",
        "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:text-muted-foreground [&_ul]:mb-4",
        "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_ol]:text-muted-foreground [&_ol]:mb-4",
        "[&_li]:text-muted-foreground [&_li]:leading-relaxed",
        "[&_strong]:font-semibold [&_strong]:text-foreground",
        "[&_em]:italic [&_em]:text-muted-foreground",
        "[&_a]:text-primary [&_a]:hover:text-primary/80 [&_a]:underline [&_a]:underline-offset-4 [&_a]:transition-colors [&_a]:font-medium",
        "[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-6 [&_blockquote]:py-2 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-6 [&_blockquote]:bg-muted/30 [&_blockquote]:rounded-r-lg",
        "[&_code]:bg-muted [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_code]:text-primary [&_code]:border",
        "[&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:text-sm [&_pre]:font-mono [&_pre]:text-foreground [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:mb-4",
        "[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:shadow-md [&_img]:my-4 [&_img]:border",
        "[&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-border [&_table]:rounded-lg [&_table]:my-6",
        "[&_thead]:bg-muted",
        "[&_th]:text-left [&_th]:p-3 [&_th]:font-semibold [&_th]:text-foreground [&_th]:border-r [&_th]:border-border [&_th]:last:border-r-0",
        "[&_td]:p-3 [&_td]:text-muted-foreground [&_td]:border-r [&_td]:border-border [&_td]:last:border-r-0",
        "[&_tr]:border-b [&_tr]:border-border [&_tr]:hover:bg-muted/50 [&_tr]:transition-colors",
        "[&_hr]:border-border [&_hr]:my-8 [&_hr]:border-t-2"
      )}
    />
  );
}

