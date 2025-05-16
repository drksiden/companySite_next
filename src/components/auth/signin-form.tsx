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
import { Loader2, AlertTriangle } from "lucide-react"; // Иконки

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false); // Для показа/скрытия пароля

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/"; // Или на вашу страницу профиля/дашборда

  const onSubmit = async (data: SignInFormData) => {
    setError(null);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
        // callbackUrl: callbackUrl // Можно указать здесь, если redirect: true
      });

      if (result?.error) {
        // "CredentialsSignin" это стандартная ошибка от NextAuth при неверных данных
        // Можно ее кастомизировать на стороне сервера в authorize, если возвращать объект ошибки
        setError(
          result.error === "CredentialsSignin"
            ? "Неверный email или пароль."
            : "Произошла ошибка. Пожалуйста, проверьте свои данные." // Более общая ошибка
        );
      } else if (result?.ok) {
        router.push(callbackUrl); // Перенаправление после успешного входа
        // router.refresh(); // Может понадобиться для обновления состояния сессии на клиенте немедленно
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
    <Card className="w-full max-w-md shadow-xl bg-slate-800/30 backdrop-blur-md border-slate-700"> {/* Улучшенный стиль карты */}
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold tracking-tight text-white">
          Вход в аккаунт
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
                {showPassword ? (
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                )}
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
                href="/auth/signup" // Убедитесь, что этот путь правильный
                className="underline underline-offset-4 hover:text-indigo-400 font-medium"
            >
                Зарегистрироваться
            </a>
        </p>
      </CardFooter>
    </Card>
  );
}