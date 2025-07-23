// src/components/admin/UserForm.tsx
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  UserProfile,
  UserRole,
  Company,
  UserUpdatePayload,
  UserCreatePayload,
  ClientType,
} from '@/lib/services/user';

// --- Константы и типы ---
export const USER_ROLES = ['admin', 'moderator', 'customer'] as const;
export const CLIENT_TYPES = ['individual', 'legal_entity'] as const;

// --- Zod Схемы ---

const BaseUserSchema = z.object({
  email: z.string().email({ message: 'Некорректный email.' }).optional(),
  first_name: z.string().max(100).nullable().optional(),
  last_name: z.string().max(100).nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  avatar_url: z.string().url({ message: 'Некорректный URL аватара.' }).nullable().optional(),
  role: z.enum(USER_ROLES, { message: 'Некорректная роль.' }).default('customer'),
  is_active: z.boolean().default(true),
  client_type: z.enum(CLIENT_TYPES, { message: 'Некорректный тип клиента.' }).default('individual'),
  company_id: z.string().uuid({ message: 'Некорректный ID компании.' }).nullable().optional(),
  position: z.string().max(100).nullable().optional(),
});

export const userCreateSchema = BaseUserSchema.extend({
  email: z.string().email({ message: 'Email обязателен.' }),
  password: z.string().min(6, { message: 'Пароль должен быть не менее 6 символов.' }),
  first_name: z.string().max(100).nullable(),
  role: z.enum(USER_ROLES, { message: 'Некорректная роль.' }),
  is_active: z.boolean(),
  client_type: z.enum(CLIENT_TYPES, { message: 'Некорректный тип клиента.' }),
});

export const userUpdateSchema = BaseUserSchema.partial();

// --- Пропсы компонента UserForm ---
interface UserFormProps {
  initialData?: UserProfile | null;
  companies: Company[];
  onSuccess: () => void;
  onClose: () => void;
}

// --- Компонент UserForm ---
export const UserForm: React.FC<UserFormProps> = ({
  initialData,
  companies,
  onSuccess,
  onClose,
}) => {
  const isEditing = !!initialData;

  const form = useForm<z.infer<typeof userCreateSchema> | z.infer<typeof userUpdateSchema>>({
    resolver: zodResolver(isEditing ? userUpdateSchema : userCreateSchema),
    defaultValues: {
      email: initialData?.email || '',
      first_name: initialData?.first_name ?? null,
      last_name: initialData?.last_name ?? null,
      phone: initialData?.phone ?? null,
      avatar_url: initialData?.avatar_url ?? null,
      role: initialData?.role || 'customer',
      is_active: initialData?.is_active ?? true,
      client_type: initialData?.client_type || 'individual',
      company_id: initialData?.company_id ?? null,
      position: initialData?.position ?? null,
      password: '', // Устанавливаем пустое значение по умолчанию для Create
    },
  });

  const onSubmit = async (values: z.infer<typeof userCreateSchema> | z.infer<typeof userUpdateSchema>) => {
    try {
      if (isEditing) {
        // Logic for updating user
        const payload: UserUpdatePayload = {};
        if (values.first_name !== undefined) payload.first_name = values.first_name === '' ? null : values.first_name;
        if (values.last_name !== undefined) payload.last_name = values.last_name === '' ? null : values.last_name;
        if (values.phone !== undefined) payload.phone = values.phone === '' ? null : values.phone;
        if (values.avatar_url !== undefined) payload.avatar_url = values.avatar_url === '' ? null : values.avatar_url;
        if (values.role !== undefined) payload.role = values.role;
        if (values.is_active !== undefined) payload.is_active = values.is_active;
        if (values.client_type !== undefined) payload.client_type = values.client_type;
        if (values.company_id !== undefined) payload.company_id = values.company_id === '' ? null : values.company_id;
        if (values.position !== undefined) payload.position = values.position === '' ? null : values.position;

        const response = await fetch(`/api/admin/users/${initialData!.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Ошибка при обновлении пользователя.');
        }

        toast.success('Пользователь успешно обновлен.');
      } else {
        // Logic for creating new user
        // Ensure that values corresponds to userCreateSchema when creating
        const createValues = values as z.infer<typeof userCreateSchema>; // Explicitly cast here

        const payload: UserCreatePayload = {
          email: createValues.email, // Email is required for create
          password: createValues.password, // Password is required for create, and only exists on createValues
          first_name: createValues.first_name === '' ? null : (createValues.first_name || null),
          last_name: createValues.last_name === '' ? null : (createValues.last_name || null),
          phone: createValues.phone === '' ? null : (createValues.phone || null),
          avatar_url: createValues.avatar_url === '' ? null : (createValues.avatar_url || null),
          role: createValues.role,
          is_active: createValues.is_active,
          client_type: createValues.client_type,
          company_id: createValues.company_id === '' ? null : (createValues.company_id || null),
          position: createValues.position === '' ? null : (createValues.position || null),
        };
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Ошибка при создании пользователя.');
        }

        toast.success('Пользователь успешно создан.');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Произошла непредвиденная ошибка.');
    } finally {
      // form.reset(values); // Consider if you want to reset or keep values in the form after submission
    }
  };

  const selectedClientType = form.watch('client_type');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="user@example.com" {...field} disabled={isEditing} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password Field (only for new user) */}
        {!isEditing && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Пароль</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* First Name Field */}
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Имя</FormLabel>
              <FormControl>
                <Input placeholder="Иван" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Last Name Field */}
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Фамилия</FormLabel>
              <FormControl>
                <Input placeholder="Иванов" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone Field */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Телефон</FormLabel>
              <FormControl>
                <Input placeholder="+7 (XXX) XXX-XX-XX" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Avatar URL Field */}
        <FormField
          control={form.control}
          name="avatar_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Аватара</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/avatar.jpg" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Role Select */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Роль</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите роль" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {USER_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Is Active Checkbox */}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Активен</FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Client Type Select */}
        <FormField
          control={form.control}
          name="client_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Тип клиента</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип клиента" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CLIENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === 'individual' ? 'Физическое лицо' : 'Юридическое лицо'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Company Select (only for legal_entity client type) */}
        {selectedClientType === 'legal_entity' && (
          <FormField
            control={form.control}
            name="company_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Компания</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || ''}
                  value={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите компанию" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {companies.length === 0 ? (
                      <SelectItem value="" disabled>Нет доступных компаний</SelectItem>
                    ) : (
                      companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Position Field (only for legal_entity client type) */}
        {selectedClientType === 'legal_entity' && (
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Должность</FormLabel>
                <FormControl>
                  <Input placeholder="Менеджер" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </form>
    </Form>
  );
};