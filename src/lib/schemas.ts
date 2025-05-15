import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email({ message: "Введите корректный email адрес." }).min(1, {message: "Email обязателен."}),
  password: z.string().min(1, { message: "Пароль обязателен." }).min(8, {message: "Пароль должен быть не менее 8 символов."}),
});

export type SignInFormData = z.infer<typeof signInSchema>;

// Новая схема для регистрации
export const signUpSchema = z.object({
  firstName: z.string().min(2, { message: "Имя должно содержать не менее 2 символов." }),
  lastName: z.string().min(2, { message: "Фамилия должна содержать не менее 2 символов." }),
  email: z.string().email({ message: "Неверный формат email." }),
  password: z.string().min(8, { message: "Пароль должен быть не менее 8 символов." }),
  confirmPassword: z.string().min(8, { message: "Подтверждение пароля должно быть не менее 8 символов." }),
  phone: z.string().optional(), // Если нужно поле для телефона
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают.",
  path: ["confirmPassword"], // Поле, на котором отобразится ошибка, если пароли не совпадут
});

export type SignUpFormData = z.infer<typeof signUpSchema>;