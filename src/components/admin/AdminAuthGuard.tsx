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
  const [backgroundChecking, setBackgroundChecking] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [hasInitialCache, setHasInitialCache] = useState(false);
  const router = useRouter();
  const lastCheckRef = useRef<number>(0);
  const listenerRef = useRef<any>(null);

  // Bypass auth in development mode if configured
  const shouldBypassAuth =
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_DISABLE_AUTH === "true";

  // Проверяем кэш только на клиенте после монтирования
  useEffect(() => {
    if (shouldBypassAuth) {
      setLoading(false);
      return;
    }

    let ignore = false;

    // Проверяем кэш только на клиенте (после монтирования компонента)
    if (typeof window !== "undefined") {
      const cachedUser = sessionStorage.getItem("current_user");
      const cachedProfile = sessionStorage.getItem("user_profile");
      if (cachedUser && cachedProfile) {
        try {
          const parsedUser = JSON.parse(cachedUser);
          const parsedProfile = JSON.parse(cachedProfile);
          if (!ignore) {
            setUser(parsedUser);
            setUserProfile(parsedProfile);
            setUserRole(parsedProfile?.role || "user");
            setHasInitialCache(true);
            setLoading(false);
          }
        } catch (e) {
          console.error("Error parsing cached data:", e);
          sessionStorage.removeItem("current_user");
          sessionStorage.removeItem("user_profile");
        }
      }
    }

    // Фоновая проверка актуальности данных (не блокирует UI)
    async function checkAuthInBackground(userId: string) {
      if (ignore) return;
      setBackgroundChecking(true);
      try {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", userId)
          .single();
        
        if (profile) {
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (currentUser && currentUser.id === userId) {
            const cacheKey = "current_user";
            const profileCacheKey = "user_profile";
            sessionStorage.setItem(cacheKey, JSON.stringify(currentUser));
            sessionStorage.setItem(profileCacheKey, JSON.stringify(profile));
            if (!ignore) {
              setUser(currentUser);
              setUserProfile(profile);
              setUserRole(profile?.role || "user");
              setBackgroundChecking(false);
            }
          } else {
            if (!ignore) setBackgroundChecking(false);
          }
        } else {
          if (!ignore) setBackgroundChecking(false);
        }
      } catch (error) {
        console.error("Background auth check error:", error);
        if (!ignore) setBackgroundChecking(false);
      }
    }

    async function checkAuth(forceRefresh = false) {
      const now = Date.now();
      const cacheKey = "current_user";
      const profileCacheKey = "user_profile";

      // Отладочная информация
      setDebugInfo(`Checking auth at ${new Date().toISOString()}`);

      // Если уже использовали кэш при монтировании, сразу запускаем фоновую проверку
      if (hasInitialCache && user) {
        if (!ignore) {
          setDebugInfo(`Using cached user: ${user.email} (${userRole})`);
          // Проверяем актуальность данных в фоне (не блокируя UI)
          setTimeout(() => {
            if (!ignore) {
              checkAuthInBackground(user.id);
            }
          }, 0);
        }
        return;
      }

      // Проверяем кэш - используем более длительный интервал для кэша
      if (!forceRefresh && now - lastCheckRef.current < 30000) {
        const cachedUser = sessionStorage.getItem(cacheKey);
        const cachedProfile = sessionStorage.getItem(profileCacheKey);
        if (cachedUser && cachedProfile) {
          try {
            const parsedUser = JSON.parse(cachedUser);
            const parsedProfile = JSON.parse(cachedProfile);
            if (!ignore) {
              // Быстро показываем интерфейс с кэшированными данными
              setUser(parsedUser);
              setUserProfile(parsedProfile);
              setUserRole(parsedProfile?.role || "user");
              setLoading(false);
              setHasInitialCache(true);
              setDebugInfo(
                `Using cached user: ${parsedUser.email} (${parsedProfile.role})`,
              );
              // Проверяем актуальность данных в фоне (не блокируя UI)
              setTimeout(() => {
                if (!ignore) {
                  checkAuthInBackground(parsedUser.id);
                }
              }, 0);
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

    // Первоначальная проверка (только если не использовали кэш)
    if (!hasInitialCache) {
      checkAuth();
    } else if (user) {
      // Если использовали кэш, запускаем фоновую проверку
      setTimeout(() => {
        if (!ignore && user) {
          checkAuthInBackground(user.id);
        }
      }, 0);
    }

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Пустой массив - выполняем только при монтировании

  useEffect(() => {
    if (shouldBypassAuth) return;

    // Автоматическое обновление токена каждые 10 минут
    const refreshTokenInterval = setInterval(async () => {
      if (user) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (session && !error) {
            // Проверяем, истекает ли токен в ближайшие 5 минут
            const expiresAt = session.expires_at;
            if (expiresAt) {
              const expiresIn = expiresAt - Math.floor(Date.now() / 1000);
              // Если токен истекает менее чем через 5 минут, обновляем его
              if (expiresIn < 300) {
                const { data: { session: refreshedSession }, error: refreshError } = 
                  await supabase.auth.refreshSession(session);
                
                if (!refreshError && refreshedSession) {
                  setDebugInfo(`Token refreshed at ${new Date().toISOString()}`);
                  // Обновляем кэш пользователя
                  sessionStorage.setItem("current_user", JSON.stringify(refreshedSession.user));
                } else {
                  console.error("Token refresh error:", refreshError);
                  // Если не удалось обновить токен, очищаем кэш и состояние
                  // Это вызовет повторную проверку при следующем запросе
                  sessionStorage.removeItem("current_user");
                  sessionStorage.removeItem("user_profile");
                  setUser(null);
                  setUserRole(null);
                  setUserProfile(null);
                }
              }
            }
          }
        } catch (error) {
          console.error("Error checking session:", error);
        }
      }
    }, 10 * 60 * 1000); // Проверяем каждые 10 минут

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
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        // При обновлении токена обновляем кэш
        setUser(session.user);
        sessionStorage.setItem("current_user", JSON.stringify(session.user));
        setDebugInfo(`Token refreshed at ${new Date().toISOString()}`);
      }
    });

    listenerRef.current = subscription;

    return () => {
      clearInterval(refreshTokenInterval);
      subscription.unsubscribe();
    };
  }, [shouldBypassAuth, user]);

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

  // Loading state - если есть кэш, показываем интерфейс сразу
  if (loading) {
    // Если использовали кэш при монтировании, показываем контент сразу
    if (hasInitialCache && user) {
      return (
        <>
          {children}
          {/* Индикатор проверки в углу экрана - скрывается автоматически после проверки */}
          {backgroundChecking && (
            <div className="fixed top-4 right-4 z-50 bg-background border rounded-lg shadow-lg p-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Проверка доступа...</span>
            </div>
          )}
        </>
      );
    }
    
    // Если кэша нет, показываем обычный loading
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
