"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <TooltipProvider disableHoverableContent>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Button
            className="rounded-full w-8 h-8 bg-card text-foreground relative flex items-center justify-center"
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Сменить тему"
          >
            <SunIcon
              className={`absolute transition-all duration-300 ${
                theme === "dark"
                  ? "opacity-0 scale-0"
                  : "opacity-100 scale-100"
              } text-muted-foreground`}
            />
            <MoonIcon
              className={`absolute transition-all duration-300 ${
                theme === "dark"
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-0"
              } text-muted-foreground`}
            />
            <span className="sr-only">Сменить тему</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Сменить тему</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
