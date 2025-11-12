"use client";

import { useEffect, useRef } from "react";

interface CategoryDescriptionProps {
  content: string;
}

export function CategoryDescription({ content }: CategoryDescriptionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && content) {
      containerRef.current.innerHTML = content;
      
      // Добавляем обработчики для ссылок
      const links = containerRef.current.querySelectorAll("a");
      links.forEach((link) => {
        if (link.href && !link.target) {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        }
      });
    }
  }, [content]);

  return (
    <div
      ref={containerRef}
      className="text-muted-foreground leading-relaxed
        [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:first:mt-0
        [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-5 [&_h3]:mb-2
        [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-foreground [&_h4]:mt-4 [&_h4]:mb-2
        [&_p]:mb-4 [&_p]:text-muted-foreground [&_p]:leading-relaxed
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-2 [&_ul]:text-muted-foreground
        [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-2 [&_ol]:text-muted-foreground
        [&_li]:text-muted-foreground [&_li]:leading-relaxed
        [&_strong]:font-semibold [&_strong]:text-foreground
        [&_a]:text-primary [&_a]:hover:underline [&_a]:font-medium
        [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:my-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:bg-muted/30 [&_blockquote]:rounded-r
        [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_code]:text-primary
        [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:shadow-md [&_img]:my-4"
    />
  );
}

