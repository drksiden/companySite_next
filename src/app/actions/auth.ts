// app/actions/authActions.ts
'use server';

import { signUpSchema } from '@/lib/schemas';
import { createClient } from '@/utils/supabase/server';
import { AuthError } from '@supabase/supabase-js';

interface RegisterState {
  errors?: {
    firstName?: string[];
    lastName?: string[];
    email?: string[];
    password?: string[];
    company?: string[];
    phone?: string[];
    accountType?: string[];
    _form?: string[];
  };
  message?: string;
  success?: boolean;
  registeredEmail?: string;
}

export async function registerUser(
  prevState: RegisterState | undefined,
  formData: FormData
): Promise<RegisterState> {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = signUpSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Ошибка валидации. Пожалуйста, проверьте введенные данные.',
    };
  }

  const { firstName, lastName, email, password, company, phone, accountType } = validatedFields.data;

  try {
    const supabase = await createClient();

    // Step 1: Create the user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          company: company || undefined,
          phone: phone || undefined,
          account_type: accountType || undefined,
        },
      },
    });

    if (error) {
      console.error("Error during supabase.auth.signUp:", error.message);
      let errorMessage = 'Ошибка при регистрации.';

      if (error instanceof AuthError && error.message.includes('Auth user registration disabled')) {
        errorMessage = 'Регистрация пользователей отключена.';
      } else if (error.message.includes('email address already registered')) {
        errorMessage = 'Пользователь с таким email уже зарегистрирован.';
      }

      return { message: errorMessage, errors: { _form: [errorMessage] } };
    }

    return { success: true, registeredEmail: email, message: "Регистрация прошла успешно!" };

  } catch (error: any) {
    console.error("Unhandled registration error:", error);
    return { message: "Произошла непредвиденная ошибка при регистрации.", errors: { _form: ["Произошла непредвиденная ошибка при регистрации."] } };
  }
}