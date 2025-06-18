// types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
  /**
   * Возвращается `useSession`, `getSession` и получается как prop в `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      medusaCustomerId?: string; // Ваше кастомное свойство
      // Добавьте другие кастомные свойства, которые вы хотите видеть в session.user
    };
  }

  /**
   * Форма объекта пользователя, возвращаемого колбэком `profile` OAuth-провайдеров,
   * или объекта пользователя, возвращаемого колбэком `authorize` Credentials-провайдера.
   */
  interface User {
    id: string;
    email: string;
    name?: string | null;
    medusaCustomerId?: string; // Ваше кастомное свойство из функции authorize
    // id здесь должен соответствовать тому, что authorize возвращает как основной ID пользователя
  }
}

declare module 'next-auth/jwt' {
  /** Возвращается колбэком `jwt` и `getToken`, когда используются JWT-сессии */
  interface JWT {
    id: string;
    email: string;
    name?: string | null;
    medusaCustomerId?: string; // Ваше кастомное свойство
    // Добавьте другие свойства, которые вы добавили в токен в колбэке jwt
  }
}