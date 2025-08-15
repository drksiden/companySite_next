"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { Sidebar } from "@/components/admin/Sidebar";
import {
  AdminSettingsProvider,
  useAdminSettings,
} from "@/hooks/useAdminSettings";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Database, Zap, ZapOff } from "lucide-react";

// Simplified page transition variants for better performance
const pageTransitionVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Компонент статуса автообновления
function AdminStatusIndicator() {
  const { settings, canAutoRefresh } = useAdminSettings();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            {settings.cacheEnabled && (
              <Badge variant="outline" className="text-xs">
                <Database className="h-3 w-3 mr-1" />
                Кэш
              </Badge>
            )}
            {canAutoRefresh ? (
              <Badge variant="outline" className="text-xs text-green-600">
                <Zap className="h-3 w-3 mr-1" />
                Авто
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-orange-600">
                <ZapOff className="h-3 w-3 mr-1" />
                {settings.isDevelopment ? "Dev" : "Выкл"}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p>
              Кэширование: {settings.cacheEnabled ? "включено" : "отключено"}
            </p>
            <p>Автообновление: {canAutoRefresh ? "включено" : "отключено"}</p>
            {settings.isDevelopment && (
              <p className="text-orange-400">Режим разработки</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminAuthGuard>
      <AdminSettingsProvider>
        <div className="flex h-screen bg-muted/40 overflow-hidden">
          {/* Sidebar */}
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          {/* Main Content */}
          <div
            className={cn(
              "flex flex-1 flex-col transition-all duration-200 ease-in-out min-h-0",
              "lg:ml-64",
              "ml-0", // Ensure no margin on mobile
            )}
          >
            {/* Header */}
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Открыть панель навигации"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="relative ml-auto flex-1 md:grow-0">
                {/* This could be a global search bar in the future */}
              </div>
              <AdminStatusIndicator />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label={
                  theme === "dark"
                    ? "Переключить на светлую тему"
                    : "Переключить на темную тему"
                }
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:pl-8 relative min-w-0">
              <motion.div
                key={pathname}
                variants={pageTransitionVariants}
                initial="initial"
                animate="animate"
                transition={{
                  duration: 0.15,
                  ease: "easeOut",
                }}
                className="h-full"
              >
                {children}
              </motion.div>
            </main>
          </div>

          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/60 lg:hidden transition-opacity duration-200"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}
        </div>
      </AdminSettingsProvider>
    </AdminAuthGuard>
  );
}
