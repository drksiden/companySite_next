// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Проверяем доступ к админке
    if (pathname.startsWith('/admin')) {
      const userRole = token?.role;
      
      if (!userRole || !['manager', 'admin', 'super_admin'].includes(userRole)) {
        // Перенаправляем на страницу входа с указанием откуда пришел запрос
        const signInUrl = new URL('/auth/signin', req.url);
        signInUrl.searchParams.set('callbackUrl', req.url);
        return NextResponse.redirect(signInUrl);
      }

      // Проверяем специфичные права для определенных разделов
      if (pathname.startsWith('/admin/users') && userRole !== 'super_admin' && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/admin', req.url));
      }

      if (pathname.startsWith('/admin/settings') && userRole !== 'super_admin') {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }

    // Проверяем API маршруты админки
    if (pathname.startsWith('/api/admin')) {
      const userRole = token?.role;
      
      if (!userRole || !['manager', 'admin', 'super_admin'].includes(userRole)) {
        return NextResponse.json(
          { error: 'Недостаточно прав доступа' },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Для админских маршрутов требуется токен
        if (req.nextUrl.pathname.startsWith('/admin') || 
            req.nextUrl.pathname.startsWith('/api/admin')) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ],
};

// src/types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: 'customer' | 'manager' | 'admin' | 'super_admin';
      permissions: string[];
      avatar_url?: string | null;
      company_name?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: 'customer' | 'manager' | 'admin' | 'super_admin';
    permissions: string[];
    avatar_url?: string | null;
    company_name?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name?: string | null;
    role: 'customer' | 'manager' | 'admin' | 'super_admin';
    permissions: string[];
    avatar_url?: string | null;
    company_name?: string | null;
  }
}

// src/components/auth/signin-form.tsx
'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInFormData } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle, Eye, EyeOff } from "lucide-react";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const onSubmit = async (data: SignInFormData) => {
    setError(null);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setError(
          result.error === "CredentialsSignin"
            ? "Неверный email или пароль."
            : "Произошла ошибка. Пожалуйста, проверьте свои данные."
        );
      } else if (result?.ok) {
        // Если это админский callbackUrl или пользователь имеет админские права
        // Перенаправляем соответственно
        if (callbackUrl.includes('/admin')) {
          router.push(callbackUrl);
        } else {
          // Для обычных пользователей проверяем их роль и перенаправляем
          router.push(callbackUrl);
        }
        router.refresh();
      } else {
        setError("Произошла неизвестная ошибка при входе.");
      }
    } catch (err) {
      console.error("Sign in error catch:", err);
      setError("Не удалось войти. Пожалуйста, проверьте соединение или попробуйте еще раз.");
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <Card className="w-full max-w-md shadow-xl bg-slate-800/30 backdrop-blur-md border-slate-700">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold tracking-tight text-white">
          Вход в систему
        </CardTitle>
        <CardDescription className="text-slate-400">
          Введите ваш email и пароль для доступа.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-md flex items-center space-x-2"
            >
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500"
            />
            {errors.email && <p className="text-red-400 text-xs pt-1">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">Пароль</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 pr-10"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-200"
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs pt-1">{errors.password.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 transition-all duration-300 ease-in-out transform hover:scale-105 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Вход...
              </>
            ) : (
              "Войти"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-600" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-800 px-2 text-slate-400">
              Или продолжить с
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full border-slate-600 hover:bg-slate-700/50 text-slate-300 hover:text-white"
          onClick={() => signIn('google', { callbackUrl })}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <img src="/images/logos/icon-google.svg" alt="Google icon" className="mr-2 h-4 w-4" />
          )}
          Google
        </Button>
         <p className="px-8 text-center text-sm text-slate-400">
            Еще нет аккаунта?{' '}
            <a
                href="/auth/signup"
                className="underline underline-offset-4 hover:text-indigo-400 font-medium"
            >
                Зарегистрироваться
            </a>
        </p>
      </CardFooter>
    </Card>
  );
}

// src/app/config/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from 'next-auth/providers/google';
import { supabase } from '@/lib/supabaseClient';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email и пароль обязательны");
        }

        try {
          // Авторизуем пользователя через Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (authError || !authData.user) {
            throw new Error("Неверный email или пароль");
          }

          // Получаем профиль пользователя
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (profileError) {
            console.error('Profile fetch error:', profileError);
            throw new Error("Ошибка получения профиля пользователя");
          }

          if (!profile.is_active) {
            throw new Error("Аккаунт деактивирован");
          }

          // Обновляем последний вход
          await supabase.rpc('update_last_login', { user_id: authData.user.id });

          return {
            id: authData.user.id,
            email: authData.user.email!,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email,
            role: profile.role,
            permissions: profile.permissions || [],
            avatar_url: profile.avatar_url,
            company_name: profile.company_name,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.permissions = (user as any).permissions;
        token.avatar_url = (user as any).avatar_url;
        token.company_name = (user as any).company_name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).permissions = token.permissions;
        (session.user as any).avatar_url = token.avatar_url;
        (session.user as any).company_name = token.company_name;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Если пользователь входит и у него есть админские права
      if (url === baseUrl || url === `${baseUrl}/`) {
        // Проверяем в URL параметрах или в сессии роль пользователя
        // Здесь можно добавить логику перенаправления для админов
        return baseUrl;
      }
      
      // Если это относительный URL, делаем его абсолютным
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // Если URL принадлежит тому же сайту, разрешаем
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};