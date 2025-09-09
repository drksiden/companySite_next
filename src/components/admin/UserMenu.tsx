"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { cn } from "@/lib/utils";
import { LogOut, Home, Moon, Sun, User, Settings } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface UserProfile {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  role?: string;
  avatar_url?: string | null;
}

export function UserMenu() {
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
    <div className="border-t p-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="w-full justify-start mb-2 h-8"
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4 mr-2" />
        ) : (
          <Moon className="h-4 w-4 mr-2" />
        )}
        {theme === "dark" ? "Светлая тема" : "Темная тема"}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-start h-auto p-2">
            <Avatar className="h-7 w-7 mr-2">
              <AvatarImage src={avatarUrl || ""} />
              <AvatarFallback className="text-xs">
                {getInitials(
                  userProfile?.first_name,
                  userProfile?.last_name,
                  userEmail,
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left truncate">
              <div className="text-sm font-medium truncate">
                {userName || userEmail}
              </div>
              <div className="text-xs text-muted-foreground">
                {getRoleLabel(userRole || "")}
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm font-medium">
            {userName || userEmail}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/account" className="cursor-pointer">
              <User className="h-4 w-4 mr-2" />
              Профиль
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account/settings" className="cursor-pointer">
              <Settings className="h-4 w-4 mr-2" />
              Настройки
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/" className="cursor-pointer">
              <Home className="h-4 w-4 mr-2" />
              На сайт
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-destructive cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
