// src/lib/schemas.ts
import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email({ message: "Введите корректный email адрес." }).min(1, {message: "Email обязателен."}),
  password: z.string().min(1, { message: "Пароль обязателен." }),
});

export type SignInFormData = z.infer<typeof signInSchema>;

// Обновленная схема для регистрации
export const signUpSchema = z.object({
  firstName: z.string().min(2, { message: "Имя должно содержать не менее 2 символов." }),
  lastName: z.string().min(2, { message: "Фамилия должна содержать не менее 2 символов." }),
  email: z.string().email({ message: "Неверный формат email." }),
  password: z.string().min(8, { message: "Пароль должен быть не менее 8 символов." }),
  confirmPassword: z.string().min(8, { message: "Подтверждение пароля должно быть не менее 8 символов." }),
  phone: z.string().optional(), // Оставляем опциональным, как было
  company: z.string().optional(), // Новое поле: Название компании (опциональное)
  accountType: z.enum(['individual', 'business'], { // Новое поле: Тип аккаунта
    required_error: "Необходимо выбрать тип аккаунта.",
    invalid_type_error: "Неверное значение для типа аккаунта.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают.",
  path: ["confirmPassword"], // Поле, на котором отобразится ошибка, если пароли не совпадут
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

// Вы также можете создать отдельную схему для обновления профиля,
// если там другие правила валидации или другие поля
export const profileUpdateSchema = z.object({
  firstName: z.string().min(2, { message: "Имя должно содержать не менее 2 символов." }).optional(),
  lastName: z.string().min(2, { message: "Фамилия должна содержать не менее 2 символов." }).optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  // Email и accountType обычно не меняются через простую форму обновления профиля
  // или требуют специальных процедур
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

