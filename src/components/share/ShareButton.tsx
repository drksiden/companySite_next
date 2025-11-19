"use client";

import * as React from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ShareButton({
  title,
  text,
  url,
  className,
  variant = "outline",
  size = "default",
}: ShareButtonProps) {
  const handleShare = async () => {
    const shareUrl = url || window.location.href;
    const shareText = text || title;
    const shareData: ShareData = {
      title,
      text: shareText,
      url: shareUrl,
    };

    // Проверяем поддержку Web Share API
    if (
      typeof navigator !== "undefined" &&
      navigator.share &&
      navigator.canShare &&
      navigator.canShare(shareData)
    ) {
      try {
        await navigator.share(shareData);
        // Не показываем toast для успешного sharing через нативный интерфейс
      } catch (error) {
        // Если пользователь отменил sharing, не показываем ошибку
        if ((error as Error).name !== "AbortError") {
          // Fallback: копируем ссылку в буфер обмена
          try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success("Ссылка скопирована в буфер обмена!");
          } catch (clipboardError) {
            // Fallback для старых браузеров
            const textArea = document.createElement("textarea");
            textArea.value = shareUrl;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
              document.execCommand("copy");
              toast.success("Ссылка скопирована в буфер обмена!");
            } catch (err) {
              toast.error("Не удалось скопировать ссылку");
            }

            document.body.removeChild(textArea);
          }
        }
      }
    } else {
      // Fallback: копируем ссылку в буфер обмена
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareUrl);
          toast.success("Ссылка скопирована в буфер обмена!");
        } else {
          // Fallback для старых браузеров
          const textArea = document.createElement("textarea");
          textArea.value = shareUrl;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          textArea.style.top = "-999999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          try {
            document.execCommand("copy");
            toast.success("Ссылка скопирована в буфер обмена!");
          } catch (err) {
            toast.error("Не удалось скопировать ссылку");
          }

          document.body.removeChild(textArea);
        }
      } catch (error) {
        console.error("Failed to copy:", error);
        toast.error("Не удалось скопировать ссылку");
      }
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      className={cn("gap-2", className)}
      aria-label={`Поделиться: ${title}`}
    >
      <Share2 className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">Поделиться</span>
    </Button>
  );
}

