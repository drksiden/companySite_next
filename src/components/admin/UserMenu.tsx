"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  LogOut,
  Home,
  Moon,
  Sun,
  User,
  Settings,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface UserMenuProps {
  sidebarCollapsed: boolean;
}

interface UserProfile {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  role?: string;
  avatar_url?: string | null;
}

export function UserMenu({ sidebarCollapsed }: UserMenuProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        if (user?.id) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          setUserProfile(profile);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const getInitials = (
    firstName?: string | null,
    lastName?: string | null,
    email?: string,
  ) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0]?.toUpperCase() || "U";
    }
    return email?.[0]?.toUpperCase() || "U";
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Супер Админ";
      case "admin":
        return "Админ";
      case "manager":
        return "Менеджер";
      case "customer":
        return "Клиент";
      default:
        return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_admin":
        return "destructive";
      case "admin":
        return "default";
      case "manager":
        return "secondary";
      case "customer":
        return "outline";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="border-t border-border/30 p-4 space-y-3 bg-gradient-to-t from-background/50 to-transparent">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const userName =
    userProfile?.first_name || userProfile?.last_name
      ? `${userProfile?.first_name || ""} ${userProfile?.last_name || ""}`.trim()
      : null;
  const userEmail = user?.email;
  const userRole = userProfile?.role;
  const avatarUrl = userProfile?.avatar_url;

  return (
    <div className="border-t p-4 space-y-3">
      {/* Theme Toggle */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={cn(
            "w-full justify-start relative overflow-hidden group",
            "hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/20",
            "transition-all duration-300 border border-transparent hover:border-accent/20",
            sidebarCollapsed && "justify-center",
          )}
          aria-label={
            theme === "dark"
              ? "Переключить на светлую тему"
              : "Переключить на темную тему"
          }
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <motion.div
            animate={{
              rotate: theme === "dark" ? 360 : 0,
              scale: theme === "dark" ? 1.1 : 1,
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="relative z-10"
          >
            {theme === "dark" ? (
              <Sun
                className={cn(
                  "h-4 w-4 text-amber-500",
                  !sidebarCollapsed && "mr-2",
                )}
              />
            ) : (
              <Moon
                className={cn(
                  "h-4 w-4 text-blue-500",
                  !sidebarCollapsed && "mr-2",
                )}
              />
            )}
          </motion.div>

          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 font-medium"
              >
                {theme === "dark" ? "Светлая тема" : "Темная тема"}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start p-3 h-auto relative overflow-hidden group",
                "hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10",
                "border border-transparent hover:border-primary/20",
                "transition-all duration-300 rounded-xl",
              )}
              aria-label="Меню пользователя"
            >
              {/* Background effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Avatar with status indicator */}
              <div className="relative">
                <Avatar
                  className={cn(
                    "h-9 w-9 border-2 border-transparent group-hover:border-primary/30 transition-all duration-300",
                    !sidebarCollapsed && "mr-3",
                  )}
                >
                  <AvatarImage src={avatarUrl || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-foreground font-semibold">
                    {getInitials(
                      userProfile?.first_name,
                      userProfile?.last_name,
                      userEmail,
                    )}
                  </AvatarFallback>
                </Avatar>

                {/* Online status indicator */}
                <motion.div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>

              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 text-left overflow-hidden relative z-10"
                  >
                    <motion.div
                      className="text-sm font-semibold truncate mb-1"
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {userName || userEmail}
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-2"
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      <Badge
                        variant={getRoleBadgeVariant(userRole || "") as any}
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          "shadow-sm border border-current/20",
                        )}
                      >
                        {getRoleLabel(userRole || "")}
                      </Badge>
                      {userRole === "super_admin" && (
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Sparkles className="h-3 w-3 text-primary" />
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={sidebarCollapsed ? "center" : "end"}
          className={cn(
            "w-64 p-2 border border-border/50 shadow-2xl",
            "bg-gradient-to-b from-card via-card to-card/95 backdrop-blur-xl",
            "animate-in slide-in-from-left-2 duration-300",
          )}
          sideOffset={8}
        >
          {/* Header */}
          <div className="px-3 py-3 border-b border-border/30 mb-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src={avatarUrl || ""} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-foreground font-semibold">
                  {getInitials(
                    userProfile?.first_name,
                    userProfile?.last_name,
                    userEmail,
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {userName || userEmail}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={getRoleBadgeVariant(userRole || "") as any}
                    className="text-xs font-medium"
                  >
                    {getRoleLabel(userRole || "")}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Онлайн
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-1">
            <DropdownMenuItem asChild>
              <Link
                href="/account"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium">Профиль</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/account/settings"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <Settings className="h-4 w-4 text-primary" />
                <span className="font-medium">Настройки</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-2" />

            <DropdownMenuItem asChild>
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <Home className="h-4 w-4 text-primary" />
                <span className="font-medium">На сайт</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-2" />

            <DropdownMenuItem
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive focus:text-destructive transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium">Выйти</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
