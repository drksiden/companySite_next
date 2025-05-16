'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, type SignUpFormData } from "@/lib/schemas"; // Убедитесь, что путь правильный
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle, CheckCircle2, Eye, EyeOff } from "lucide-react"; // Добавил Eye и EyeOff

export function SignUpForm() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    setApiError(null);
    setApiSuccess(null);
    try {
      const response = await fetch('/api/auth/register', { // Ваш API маршрут
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ // Отправляем данные как есть, API разберется
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword, // Zod уже проверил, но API может тоже захотеть
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setApiError(result.message || 'Ошибка регистрации. Пожалуйста, попробуйте еще раз.');
        if (result.errors) { // Для ошибок валидации Zod с сервера (если API их возвращает)
          console.error("Validation errors from API:", result.errors);
          // Здесь можно добавить логику для установки ошибок в useForm, если API возвращает их в формате fieldErrors
        }
      } else {
        setApiSuccess(result.message || 'Регистрация прошла успешно! Вы будете перенаправлены на страницу входа.');
        reset(); // Очищаем форму
        setTimeout(() => {
          router.push("/auth/signin"); // Перенаправление на страницу входа
        }, 2500); // Небольшая задержка, чтобы пользователь успел прочитать сообщение
      }
    } catch (err) {
      console.error("Sign up fetch error:", err);
      setApiError("Не удалось связаться с сервером. Пожалуйста, проверьте соединение или попробуйте еще раз.");
    }
  };

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    if (field === 'password') setShowPassword(!showPassword);
    if (field === 'confirmPassword') setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Card className="w-full max-w-lg shadow-xl bg-slate-800/30 backdrop-blur-md border-slate-700">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold tracking-tight text-white">
          Создать аккаунт
        </CardTitle>
        <CardDescription className="text-slate-400">
          Заполните форму для регистрации нового пользователя.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <AnimatePresence>
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-md flex items-center space-x-2"
            >
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{apiError}</p>
            </motion.div>
          )}
          {apiSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-md flex items-center space-x-2"
            >
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{apiSuccess}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-slate-300">Имя</Label>
              <Input id="firstName" placeholder="Иван" {...register("firstName")} className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500" />
              {errors.firstName && <p className="text-red-400 text-xs pt-1">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-slate-300">Фамилия</Label>
              <Input id="lastName" placeholder="Иванов" {...register("lastName")} className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500" />
              {errors.lastName && <p className="text-red-400 text-xs pt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register("email")} className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500" />
            {errors.email && <p className="text-red-400 text-xs pt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">Пароль</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} {...register("password")} className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 pr-10" />
              <button type="button" onClick={() => togglePasswordVisibility('password')} className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-200" aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}>
                 {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs pt-1">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-300">Подтвердите пароль</Label>
             <div className="relative">
              <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} {...register("confirmPassword")} className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 pr-10" />
              <button type="button" onClick={() => togglePasswordVisibility('confirmPassword')} className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-200" aria-label={showConfirmPassword ? "Скрыть пароль" : "Показать пароль"}>
                 {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-400 text-xs pt-1">{errors.confirmPassword.message}</p>}
          </div>

          <Button type="submit" disabled={isSubmitting || !!apiSuccess} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 transition-all duration-300 ease-in-out transform hover:scale-105 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-70">
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Регистрация...</>
            ) : apiSuccess ? (
              <><CheckCircle2 className="mr-2 h-4 w-4" /> Успешно!</>
            ) : (
              "Создать аккаунт"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="w-full text-center text-sm text-slate-400">
          Уже есть аккаунт?{' '}
          <a href="/auth/signin" className="underline underline-offset-4 hover:text-indigo-400 font-medium">
            Войти
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}
