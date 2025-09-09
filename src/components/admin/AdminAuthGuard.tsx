"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Shield, Home } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface AdminAuthGuardProps {
  children: React.ReactNode;
  requireRole?: "admin" | "manager" | "user" | "super_admin";
  fallback?: React.ReactNode;
}

export default function AdminAuthGuard({
  children,
  requireRole = "admin",
  fallback,
}: AdminAuthGuardProps) {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const router = useRouter();
  const lastCheckRef = useRef<number>(0);
  const listenerRef = useRef<any>(null);

  // Bypass auth in development mode if configured
  const shouldBypassAuth =
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_DISABLE_AUTH === "true";

  useEffect(() => {
    if (shouldBypassAuth) {
      setLoading(false);
      return;
    }

    let ignore = false;

    async function checkAuth(forceRefresh = false) {
      const now = Date.now();
      const cacheKey = "current_user";
      const profileCacheKey = "user_profile";

      // Отладочная информация
      setDebugInfo(`Checking auth at ${new Date().toISOString()}`);

      // Проверяем кэш
      if (!forceRefresh && now - lastCheckRef.current < 5000) {
        const cachedUser = sessionStorage.getItem(cacheKey);
        const cachedProfile = sessionStorage.getItem(profileCacheKey);
        if (cachedUser && cachedProfile) {
          try {
            const parsedUser = JSON.parse(cachedUser);
            const parsedProfile = JSON.parse(cachedProfile);
            if (!ignore) {
              setUser(parsedUser);
              setUserProfile(parsedProfile);
              setUserRole(parsedProfile?.role || "user");
              setLoading(false);
              setDebugInfo(
                `Using cached user: ${parsedUser.email} (${parsedProfile.role})`,
              );
            }
            return;
          } catch (e) {
            console.error("Error parsing cached data:", e);
            sessionStorage.removeItem(cacheKey);
            sessionStorage.removeItem(profileCacheKey);
          }
        }
      }

      lastCheckRef.current = now;

      try {
        // Получаем текущего пользователя
        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("User fetch error:", userError);
          if (!ignore) {
            setDebugInfo(`User error: ${userError.message}`);
            setUser(null);
            setUserRole(null);
            setUserProfile(null);
            setLoading(false);
          }
          return;
        }

        if (!currentUser) {
          if (!ignore) {
            setDebugInfo("No authenticated user found");
            setUser(null);
            setUserRole(null);
            setUserProfile(null);
            setLoading(false);
          }
          return;
        }

        // Получаем профиль пользователя из таблицы user_profiles
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          if (!ignore) {
            setDebugInfo(`Profile error: ${profileError.message}`);
            setUser(currentUser);
            setUserProfile(null);
            setUserRole("user"); // fallback роль
            setLoading(false);
          }
          return;
        }

        if (!ignore) {
          setUser(currentUser);
          setUserProfile(profile);
          setUserRole(profile?.role || "user");
          setLoading(false);
          setDebugInfo(
            `Authenticated as: ${currentUser.email} (${profile?.role || "user"})`,
          );

          // Кэшируем данные
          sessionStorage.setItem(cacheKey, JSON.stringify(currentUser));
          sessionStorage.setItem(profileCacheKey, JSON.stringify(profile));
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (!ignore) {
          setDebugInfo(
            `Auth error: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
          setUser(null);
          setUserRole(null);
          setUserProfile(null);
          setLoading(false);
        }
      }
    }

    // Первоначальная проверка
    checkAuth();

    return () => {
      ignore = true;
    };
  }, [shouldBypassAuth]);

  useEffect(() => {
    if (shouldBypassAuth) return;

    // Подписываемся на изменения авторизации
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setDebugInfo(`Auth state changed: ${event}`);

      if (event === "SIGNED_OUT") {
        setUser(null);
        setUserRole(null);
        setUserProfile(null);
        sessionStorage.removeItem("current_user");
        sessionStorage.removeItem("user_profile");
      } else if (event === "SIGNED_IN" && session?.user) {
        // При входе получаем профиль из базы
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        const role = profile?.role || "user";
        setUser(session.user);
        setUserProfile(profile);
        setUserRole(role);
        sessionStorage.setItem("current_user", JSON.stringify(session.user));
        sessionStorage.setItem("user_profile", JSON.stringify(profile));
      }
    });

    listenerRef.current = subscription;

    return () => {
      subscription.unsubscribe();
    };
  }, [shouldBypassAuth]);

  useEffect(() => {
    if (shouldBypassAuth) return;

    // Проверяем роль каждые 30 секунд
    const interval = setInterval(async () => {
      if (user) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile && profile.role !== userRole) {
          setUserProfile(profile);
          setUserRole(profile.role);
          sessionStorage.setItem("user_profile", JSON.stringify(profile));
          setDebugInfo(`Role updated to: ${profile.role}`);
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, userRole, shouldBypassAuth]);

  // Early return for bypass mode
  if (shouldBypassAuth) {
    return <>{children}</>;
  }

  // Loading state
  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl">Проверка доступа</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-sm text-muted-foreground">
                Проверяем ваши права доступа...
              </p>
              {process.env.NODE_ENV === "development" && debugInfo && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs font-mono">
                    {debugInfo}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  // Not authenticated
  if (!user) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-xl">Доступ запрещен</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Для доступа к панели администратора необходимо войти в систему.
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => router.push("/auth/signin")}
                  className="w-full"
                >
                  Войти в систему
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  На главную
                </Button>
              </div>
              {process.env.NODE_ENV === "development" && debugInfo && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs font-mono">
                    {debugInfo}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  // Check role authorization
  const hasRequiredRole = () => {
    if (!userRole) return false;

    const roleHierarchy = {
      user: 1,
      customer: 1,
      manager: 2,
      admin: 3,
      super_admin: 4,
    };
    const userLevel =
      roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requireRole] || 0;

    return userLevel >= requiredLevel;
  };

  // Insufficient permissions
  if (!hasRequiredRole()) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-xl">Недостаточно прав</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                У вас нет прав для доступа к этой странице.
              </p>
              <p className="text-sm text-muted-foreground">
                Ваша роль: <span className="font-medium">{userRole}</span>
                <br />
                Требуется: <span className="font-medium">{requireRole}</span>
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push("/admin")}
                  className="w-full"
                >
                  К панели администратора
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  На главную
                </Button>
              </div>
              {process.env.NODE_ENV === "development" && debugInfo && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs font-mono">
                    {debugInfo}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  // Authorized - render children
  return <>{children}</>;
}
