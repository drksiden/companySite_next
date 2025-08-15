"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, ReactNode, useRef } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

// Кэш для проверки авторизации (5 минут)
const authCache = new Map<
  string,
  { user: any; userRole: string | null; timestamp: number }
>();
const AUTH_CACHE_DURATION = 5 * 60 * 1000; // 5 минут

interface AdminAuthGuardProps {
  children: ReactNode;
  requiredRole?: ("customer" | "manager" | "admin" | "super_admin")[];
  fallback?: ReactNode;
}

export function AdminAuthGuard({
  children,
  requiredRole = ["manager", "admin", "super_admin"],
  fallback,
}: AdminAuthGuardProps) {
  // В dev режиме можно полностью отключить проверку
  if (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_DISABLE_AUTH === "true"
  ) {
    return <>{children}</>;
  }
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const router = useRouter();
  const lastCheckRef = useRef<number>(0);
  const listenerRef = useRef<any>(null);

  useEffect(() => {
    let ignore = false;

    async function checkAuth(forceRefresh = false) {
      const now = Date.now();
      const cacheKey = "current_user";

      // Отладочная информация
      setDebugInfo(`Auth check: ${new Date().toLocaleTimeString()}`);

      // Проверяем кэш, если не принудительное обновление
      if (!forceRefresh && now - lastCheckRef.current < 30000) {
        // 30 секунд между проверками
        const cached = authCache.get(cacheKey);
        if (cached && now - cached.timestamp < AUTH_CACHE_DURATION) {
          if (!ignore) {
            setUser(cached.user);
            setUserRole(cached.userRole);
            setLoading(false);
            setDebugInfo(
              `Используется кэш: ${new Date(cached.timestamp).toLocaleTimeString()}`,
            );
          }
          return;
        }
      }

      setLoading(true);
      lastCheckRef.current = now;

      try {
        const { data, error } = await supabase.auth.getUser();

        if (!ignore) {
          let currentUser = data?.user || null;
          let currentRole = null;

          if (currentUser?.id) {
            // Получаем роль из таблицы user_profiles
            const { data: profile } = await supabase
              .from("user_profiles")
              .select("role")
              .eq("id", currentUser.id)
              .single();
            currentRole = profile?.role || null;
          }

          // Кэшируем результат
          authCache.set(cacheKey, {
            user: currentUser,
            userRole: currentRole,
            timestamp: now,
          });

          setUser(currentUser);
          setUserRole(currentRole);
          setLoading(false);
        }
      } catch (error) {
        console.error("AdminAuthGuard - Auth check failed:", error);
        if (!ignore) {
          setUser(null);
          setUserRole(null);
          setLoading(false);
        }
      }
    }

    // Первоначальная проверка
    checkAuth();

    // Подписка на изменения сессии отключена для предотвращения
    // перезагрузки при переключении вкладок браузера
    // if (!listenerRef.current) {
    //   const { data: listener } = supabase.auth.onAuthStateChange((event) => {
    //     if (event === "SIGNED_OUT" || event === "SIGNED_IN") {
    //       // Очищаем кэш при изменении авторизации
    //       authCache.clear();
    //       checkAuth(true);
    //     }
    //   });
    //   listenerRef.current = listener;
    // }

    return () => {
      ignore = true;
    };
  }, []);

  // Очистка подписки при размонтировании
  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        listenerRef.current.subscription.unsubscribe();
        listenerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    const currentPath = window.location.pathname;

    // Избегаем проверок для статических ресурсов
    if (
      currentPath.includes("/_next/") ||
      currentPath.includes(".css") ||
      currentPath.includes(".js") ||
      currentPath.includes(".map")
    ) {
      return;
    }

    if (!user) {
      // Избегаем циклических редиректов
      if (currentPath !== "/auth/signin" && !currentPath.startsWith("/auth/")) {
        router.push(
          "/auth/signin?callbackUrl=" + encodeURIComponent(currentPath),
        );
      }
      return;
    }

    if (
      !userRole ||
      !requiredRole.includes(
        userRole as "customer" | "admin" | "manager" | "super_admin",
      )
    ) {
      // Избегаем циклических редиректов
      if (
        userRole === "customer" &&
        currentPath !== "/" &&
        !currentPath.startsWith("/auth/")
      ) {
        router.push("/");
      } else if (
        userRole !== "customer" &&
        currentPath !== "/admin" &&
        !currentPath.startsWith("/admin/") &&
        !currentPath.startsWith("/auth/")
      ) {
        router.push("/admin");
      }
    }
  }, [user, userRole, loading, router, requiredRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Проверка доступа...</p>
          {process.env.NODE_ENV === "development" && (
            <p className="text-xs text-gray-400 mt-2">{debugInfo}</p>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <Alert className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Необходима авторизация для доступа к этой странице.
            </AlertDescription>
          </Alert>
        </div>
      )
    );
  }

  if (
    !userRole ||
    !requiredRole.includes(
      userRole as "customer" | "admin" | "manager" | "super_admin",
    )
  ) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <Alert variant="destructive" className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <p>У вас недостаточно прав для доступа к этой странице.</p>
              <div className="text-xs text-gray-500 mt-2">
                User ID: {user?.id}
                <br />
                Email: {user?.email}
                <br />
                Role: {userRole || "не найдена"}
                <br />
                Required: {requiredRole.join(", ")}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/admin")}
                >
                  Вернуться в админку
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/")}
                >
                  На главную
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )
    );
  }

  return <>{children}</>;
}

// Хук для проверки прав доступа через Supabase
export function useAdminAuth(
  requiredRole?: ("customer" | "manager" | "admin" | "super_admin")[],
) {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const lastCheckRef = useRef<number>(0);

  useEffect(() => {
    let ignore = false;

    async function checkAuth() {
      const now = Date.now();
      const cacheKey = "hook_user";

      // Проверяем кэш (1 минута для хука)
      if (now - lastCheckRef.current < 60000) {
        const cached = authCache.get(cacheKey);
        if (cached && now - cached.timestamp < AUTH_CACHE_DURATION) {
          if (!ignore) {
            setUser(cached.user);
            setUserRole(cached.userRole);
            setLoading(false);
          }
          return;
        }
      }

      setLoading(true);
      lastCheckRef.current = now;

      const { data } = await supabase.auth.getUser();
      if (!ignore) {
        let currentUser = data?.user || null;
        let currentRole = null;

        if (currentUser?.id) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("role, permissions")
            .eq("id", currentUser.id)
            .single();
          currentRole = profile?.role || null;
        }

        // Кэшируем результат
        authCache.set(cacheKey, {
          user: currentUser,
          userRole: currentRole,
          timestamp: now,
        });

        setUser(currentUser);
        setUserRole(currentRole);
        setLoading(false);
      }
    }

    checkAuth();

    // Отключаем подписку на изменения для предотвращения
    // перезагрузки при переключении вкладок браузера
    // const { data: listener } = supabase.auth.onAuthStateChange((event) => {
    //   if (event === "SIGNED_OUT" || event === "SIGNED_IN") {
    //     authCache.clear();
    //     checkAuth();
    //   }
    // });

    return () => {
      ignore = true;
      // listener?.subscription.unsubscribe();
    };
  }, []);

  const hasAccess =
    !loading &&
    userRole &&
    (requiredRole
      ? requiredRole.includes(
          userRole as "customer" | "admin" | "manager" | "super_admin",
        )
      : ["manager", "admin", "super_admin"].includes(userRole));
  const canAccess = (roles: string[]) => userRole && roles.includes(userRole);

  return {
    user,
    isLoading: loading,
    isAuthenticated: !!user,
    hasAccess,
    canAccess,
    userRole,
    permissions: [],
  };
}
