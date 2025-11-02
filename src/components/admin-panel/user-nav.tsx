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
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { LogOut, Home, Moon, Sun, User, Settings } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface UserProfile {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  role?: string;
  avatar_url?: string | null;
}

export function UserNav() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="relative h-8 w-8 rounded-full p-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl || ""} alt={userName || userEmail || ""} />
            <AvatarFallback className="bg-muted text-xs">
              {getInitials(
                userProfile?.first_name,
                userProfile?.last_name,
                userEmail,
              )}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal pb-0">
          <div className="flex flex-col space-y-0.5">
            <span className="text-sm font-semibold text-foreground">{userName || userEmail}</span>
            <span className="text-xs text-muted-foreground">{userEmail}</span>
            <span className="text-[11px] text-muted-foreground">
              {getRoleLabel(userRole || "")}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account" className="flex items-center cursor-pointer">
            <User className="h-4 w-4 mr-2 text-muted-foreground" />
            Профиль
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/settings" className="flex items-center cursor-pointer">
            <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
            Настройки
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/" className="flex items-center cursor-pointer">
            <Home className="h-4 w-4 mr-2 text-muted-foreground" />
            На сайт
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex items-center text-destructive cursor-pointer"
        >
          <LogOut className="h-4 w-4 mr-2 text-destructive" />
          Выйти
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start h-8 p-0"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 mr-2" />
            ) : (
              <Moon className="h-4 w-4 mr-2" />
            )}
            {theme === "dark" ? "Светлая тема" : "Темная тема"}
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
