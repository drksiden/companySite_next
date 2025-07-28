"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Menu, Moon, Sun, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { Sidebar } from "@/components/admin/Sidebar";

// Updated Framer Motion variants for a smoother page transition
const pageTransitionVariants = {
  initial: { opacity: 0, x: -10 },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: 10,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isPending] = useTransition();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <AdminAuthGuard>
      <div className="flex h-screen bg-muted/40 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarOpen={setSidebarOpen}
          setSidebarCollapsed={setSidebarCollapsed}
        />

        {/* Main Content */}
        <div
          className={cn(
            "flex flex-1 flex-col transition-all duration-300 ease-in-out",
            sidebarCollapsed ? "lg:ml-20" : "lg:ml-64",
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
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 relative">
            <AnimatePresence mode="wait">
              {isPending && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              key={pathname}
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="h-full"
            >
              {children}
            </motion.div>
          </main>
        </div>

        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>
      </div>
    </AdminAuthGuard>
  );
}
