"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";

import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import { AdminSettingsProvider } from "@/hooks/useAdminSettings";

const pageTransitionVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme, setTheme } = useTheme();

  return (
    <AdminAuthGuard>
      <AdminSettingsProvider>
       <AdminPanelLayout>{children}</AdminPanelLayout>
      </AdminSettingsProvider>
    </AdminAuthGuard>
  );
}
