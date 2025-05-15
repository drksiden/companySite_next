// app/actions/authActions.ts
'use server';

import { z } from 'zod';
import { signUpSchema } from '@/lib/schemas';
import { sdk } from '@/lib/sdk'; // Ваш инициализированный SDK
// FetchError может быть не экспортирован напрямую из @medusajs/js-sdk,
// ошибки нужно будет проверять по структуре (например, error.message, error.statusText или error.response)

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
    // Шаг 1: Попытка зарегистрировать "identity" (email/password) для customer
    // Этот метод в @medusajs/js-sdk должен подготовить сессию/токен для создания customer
    // или выбросить ошибку, если identity уже существует.
    await sdk.auth.register("customer", "emailpass", {
      email,
      password,
    });
    // Если предыдущий шаг не выбросил ошибку, SDK теперь должен быть "готов" создать customer,
    // используя полученный токен регистрации неявно.

  } catch (error: any) {
    console.warn('SDK auth.register error:', JSON.stringify(error, null, 2));
    // Проверяем, является ли ошибка той, что "Identity with email already exists"
    // В старом SDK это может быть ошибка с определенным statusText или message.
    // Точная структура ошибки может варьироваться, поэтому важно логировать `error` целиком.
    // Ошибка "Unauthorized" (401) часто означает, что такая identity уже есть.
    if (
      (error.name === 'FetchError' && error.statusText === "Unauthorized") || // Пример проверки для FetchError
      (error.response && error.response.data && error.response.data.message?.includes("Identity with email already exists")) ||
      (error.message?.includes("Identity with email already exists"))
    ) {
      console.log('Identity exists, attempting login and then customer creation...');
      try {
        // Пытаемся войти, чтобы SDK получил токен аутентификации для существующей identity
        await sdk.auth.login("customer", "emailpass", {
          email,
          password,
        });
        // Если логин успешен, SDK теперь аутентифицирован для создания customer
      } catch (loginError: any) {
        console.error('SDK auth.login error after identity conflict:', JSON.stringify(loginError, null, 2));
        let loginErrorMessage = 'Ошибка при попытке входа для существующей учетной записи.';
        if (loginError.response && loginError.response.data && loginError.response.data.message) {
            loginErrorMessage = loginError.response.data.message;
        } else if (loginError.message) {
            loginErrorMessage = loginError.message;
        }
        return { message: loginErrorMessage, errors: { _form: [loginErrorMessage] } };
      }
    } else {
      // Другая ошибка на этапе sdk.auth.register
      let registerErrorMessage = 'Ошибка на этапе регистрации личности.';
        if (error.response && error.response.data && error.response.data.message) {
            registerErrorMessage = error.response.data.message;
        } else if (error.message) {
            registerErrorMessage = error.message;
        }
      return { message: registerErrorMessage, errors: { _form: [registerErrorMessage] } };
    }
  }

  // Шаг 2: Создаем самого покупателя.
  // SDK должен автоматически использовать токен (регистрации или логина), полученный на предыдущих шагах.
  try {
    // Для @medusajs/js-sdk, это sdk.store.customers.create
    // (а не sdk.customers.create, как я ошибочно писал для v2)
    const { customer } = await sdk.store.customer.create({
      first_name: firstName,
      last_name: lastName,
      email: email,
      // Пароль здесь НЕ передается, так как он уже обработан sdk.auth.register/login
      phone: phone || undefined,
      metadata: {
        company: company || undefined,
        account_type: accountType || undefined,
      },
    });

    if (customer) {
      return { success: true, registeredEmail: customer.email, message: "Регистрация прошла успешно!" };
    } else {
      // Эта ситуация маловероятна, если предыдущие шаги прошли успешно
      return { message: "Не удалось создать профиль пользователя.", errors: { _form: ["Не удалось создать профиль пользователя."] } };
    }
  } catch (createCustomerError: any) {
    console.error('SDK store.customers.create error:', JSON.stringify(createCustomerError, null, 2));
    let createErrorMessage = 'Ошибка при создании профиля пользователя.';
    if (createCustomerError.response && createCustomerError.response.data && createCustomerError.response.data.message) {
        createErrorMessage = createCustomerError.response.data.message;
        if (createCustomerError.response.data.type === 'duplicate_error') {
             createErrorMessage = `Покупатель с email ${email} уже существует.`;
        }
    } else if (createCustomerError.message) {
        createErrorMessage = createCustomerError.message;
    }
    return { message: createErrorMessage, errors: { _form: [createErrorMessage] } };
  }
}