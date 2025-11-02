"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInFormData } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

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
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email, password: data.password,
      });

      if (authError) {
        setError(authError.message || "Ошибка входа. Проверьте email и пароль.");
        return;
      }
      if (!authData.user || !authData.session) {
        setError("Не удалось войти в систему.");
        return;
      }

      const { data: profile, error: profileError } = await supabase.from('user_profiles')
        .select('is_active')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        setError("Ошибка получения профиля пользователя.");
        return;
      }
      if (!profile.is_active) {
        setError("Аккаунт деактивирован. Обратитесь к администратору.");
        await supabase.auth.signOut();
        return;
      }

      await supabase.auth.setSession({
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
      });

      await new Promise(resolve => setTimeout(resolve, 200));
      router.push(callbackUrl);
      router.refresh();
    } catch (error: any) {
      setError(error.message || "Произошла непредвиденная ошибка.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-md">
      <Card className="shadow-xl bg-card dark:bg-card border border-card-border dark:border-card-border backdrop-blur-md transition-smooth">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-card-foreground dark:text-card-foreground">
            Вход в систему
          </CardTitle>
          <CardDescription className="text-muted-foreground dark:text-muted-foreground">
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
                className="bg-destructive/10 dark:bg-destructive/10 border border-destructive/30 dark:border-destructive/30 text-destructive dark:text-destructive p-3 rounded-md flex items-center space-x-2 mb-2"
              >
                <AlertTriangle className="h-5 w-5" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 form-content">
            <div>
              <Label htmlFor="email" className="text-muted-foreground dark:text-muted-foreground">Email</Label>
              <Input
                id="email" type="email" autoComplete="email" spellCheck={false}
                {...register("email")}
                className="bg-input dark:bg-input border border-input dark:border-input text-card-foreground dark:text-card-foreground placeholder-muted-foreground dark:placeholder-muted-foreground focus:border-primary transition-smooth"
              />
              {errors.email && <p className="text-destructive text-xs pt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password" className="text-muted-foreground dark:text-muted-foreground">Пароль</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password")}
                  className="bg-input dark:bg-input border border-input dark:border-input text-card-foreground dark:text-card-foreground placeholder-muted-foreground dark:placeholder-muted-foreground focus:border-primary transition-smooth pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-primary transition-colors"
                  aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs pt-1">{errors.password.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/80 text-primary-foreground dark:text-primary-foreground font-semibold py-3 transition-all duration-300 ease-in-out transform hover:scale-105 focus:ring-2 focus:ring-primary focus:ring-opacity-50">
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Вход...</>
              ) : "Войти"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <p className="px-8 text-center text-sm text-muted-foreground dark:text-muted-foreground">
            Еще нет аккаунта?{' '}
            <a href="/auth/signup" className="underline underline-offset-4 hover:text-primary font-medium transition-colors">
              Зарегистрироваться
            </a>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
