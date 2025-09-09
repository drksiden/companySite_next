// src/lib/schemas.ts
import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .string()
    .email({ message: "Введите корректный email адрес." })
    .min(1, { message: "Email обязателен." }),
  password: z.string().min(1, { message: "Пароль обязателен." }),
});

export type SignInFormData = z.infer<typeof signInSchema>;

// Обновленная схема для регистрации
export const signUpSchema = z
  .object({
    firstName: z
      .string()
      .min(2, { message: "Имя должно содержать не менее 2 символов." }),
    lastName: z
      .string()
      .min(2, { message: "Фамилия должна содержать не менее 2 символов." }),
    email: z.string().email({ message: "Неверный формат email." }),
    password: z
      .string()
      .min(8, { message: "Пароль должен быть не менее 8 символов." }),
    confirmPassword: z.string().min(8, {
      message: "Подтверждение пароля должно быть не менее 8 символов.",
    }),
    phone: z.string().optional(), // Оставляем опциональным, как было
    company: z.string().optional(), // Новое поле: Название компании (опциональное)
    accountType: z.enum(["individual", "business"], {
      // Новое поле: Тип аккаунта
      required_error: "Необходимо выбрать тип аккаунта.",
      invalid_type_error: "Неверное значение для типа аккаунта.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают.",
    path: ["confirmPassword"], // Поле, на котором отобразится ошибка, если пароли не совпадут
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;

// Вы также можете создать отдельную схему для обновления профиля,
// если там другие правила валидации или другие поля
export const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "Имя должно содержать не менее 2 символов." })
    .optional(),
  lastName: z
    .string()
    .min(2, { message: "Фамилия должна содержать не менее 2 символов." })
    .optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  // Email и accountType обычно не меняются через простую форму обновления профиля
  // или требуют специальных процедур
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

// Catalog schemas
export const CatalogQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(20),
  sort: z
    .enum(["price.asc", "price.desc", "name.asc", "name.desc", "created.desc"])
    .default("name.asc"),
  categories: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(",").filter(Boolean) : [])),
  brands: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(",").filter(Boolean) : [])),
  collections: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(",").filter(Boolean) : [])),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStockOnly: z
    .union([
      z.string().transform((val) => val === "true" || val === "1"),
      z.boolean(),
      z.number().transform((val) => val === 1),
    ])
    .optional()
    .default(false),
  search: z.string().optional(),
});

export type CatalogQuery = z.infer<typeof CatalogQuerySchema>;

// Image upload schema
export const ImageUploadSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  contentType: z.string().regex(/^image\//, "Only image files are allowed"),
});

export type ImageUploadRequest = z.infer<typeof ImageUploadSchema>;

// Product creation/update schema
export const ProductFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Product slug is required"),
  sku: z.string().optional(),
  short_description: z.string().optional(),
  description: z.string().optional(),
  base_price: z.coerce.number().min(0, "Price must be positive"),
  sale_price: z.coerce
    .number()
    .min(0, "Sale price must be positive")
    .optional(),
  category_id: z.string().uuid("Invalid category ID").optional(),
  brand_id: z.string().uuid("Invalid brand ID").optional(),
  collection_id: z.string().uuid("Invalid collection ID").optional(),
  thumbnail: z.string().url("Invalid thumbnail URL").optional(),
  images: z.array(z.string().url("Invalid image URL")).default([]),
  inventory_quantity: z.coerce
    .number()
    .min(0, "Inventory must be non-negative")
    .default(0),
  track_inventory: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  status: z.enum(["active", "inactive", "draft"]).default("draft"),
  specifications: z.record(z.any()).optional(),
});

export type ProductFormData = z.infer<typeof ProductFormSchema>;
