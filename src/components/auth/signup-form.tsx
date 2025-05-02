'use client';

import { useForm } from "react-hook-form";
import { signUpSchema } from "@/lib/schemas";
import { z } from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { signIn } from "next-auth/react";
import type { SignInResponse } from "next-auth/react";

type SignUpFormData = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignUpFormData>({
    // resolver: zodResolver(signUpSchema), // включите если нужен zod
  });

  const onSubmit = async (data: SignUpFormData) => {
    setError(null);
    try {
      // 1. Получаем registration JWT
      const regRes = await axios.post(
        `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'}/auth/customer/emailpass/register`,
        {
          email: data.email,
          password: data.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(process.env.NEXT_PUBLIC_MEDUSA_API_KEY
              ? { 'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_API_KEY }
              : {}),
          },
        }
      );
      const registrationToken = regRes.data.token;

      // 2. Создаём покупателя с этим токеном
      await axios.post(
        `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'}/store/customers`,
        {
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          ...(data.company ? { company: data.company } : {}),
          ...(data.phone ? { phone: data.phone } : {}),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${registrationToken}`,
            ...(process.env.NEXT_PUBLIC_MEDUSA_API_KEY
              ? { 'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_API_KEY }
              : {}),
          },
        }
      );

      // 3. (Опционально) Выполняем вход
      const result: SignInResponse | undefined = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Регистрация прошла успешно, но не удалось выполнить вход. Пожалуйста, войдите вручную.");
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data;
        const status = err.response?.status;

        if (status === 401) {
          setError("Ошибка авторизации (401). Проверьте настройки API и права доступа.");
        } else if (status === 422 || status === 400) {
          setError(`Ошибка валидации: ${responseData?.message || JSON.stringify(responseData?.errors || {})}`);
        } else if (responseData?.message) {
          setError(responseData.message);
        } else {
          setError(`Ошибка регистрации: ${err.message}`);
        }
      } else {
        setError("Неизвестная ошибка при регистрации. Проверьте консоль для деталей.");
      }
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Регистрация</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="firstName">Имя</Label>
            <Input id="firstName" {...register("firstName")} />
            {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
          </div>
          <div>
            <Label htmlFor="lastName">Фамилия</Label>
            <Input id="lastName" {...register("lastName")} />
            {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
          </div>
          <div>
            <Label htmlFor="company">Компания (необязательно)</Label>
            <Input id="company" {...register("company")} />
            {errors.company && <p className="text-red-500 text-sm">{errors.company.message}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Телефон (необязательно)</Label>
            <Input id="phone" {...register("phone")} />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Регистрация..." : "Зарегистрироваться"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}