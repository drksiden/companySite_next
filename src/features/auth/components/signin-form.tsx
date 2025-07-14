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
          result.error || "Произошла неизвестная ошибка. Пожалуйста, попробуйте еще раз.");
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