// types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as NextAuthJWT } from "next-auth/jwt"; // Используйте псевдоним, если JWT уже где-то определен

declare module "next-auth" {
  /**
   * Возвращается `useSession`, `getSession` и получается как prop в `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string; // Стандартный ID пользователя NextAuth (из token.id)
      medusaCustomerId?: string; // Ваше кастомное свойство
      // Добавьте другие кастомные свойства, которые вы хотите видеть в session.user
    } & DefaultSession["user"]; // Расширяет стандартный тип пользователя сессии (name, email, image)
  }

  /**
   * Форма объекта пользователя, возвращаемого колбэком `profile` OAuth-провайдеров,
   * или объекта пользователя, возвращаемого колбэком `authorize` Credentials-провайдера.
   */
  interface User extends DefaultUser {
    medusaCustomerId?: string; // Ваше кастомное свойство из функции authorize
    // id здесь должен соответствовать тому, что authorize возвращает как основной ID пользователя
    // DefaultUser уже содержит id: string
  }
}

declare module "next-auth/jwt" {
  /** Возвращается колбэком `jwt` и `getToken`, когда используются JWT-сессии */
  interface JWT extends NextAuthJWT { // Расширьте JWT с псевдонимом
    id?: string; // Соответствует user.id
    medusaCustomerId?: string; // Ваше кастомное свойство
    // Добавьте другие свойства, которые вы добавили в токен в колбэке jwt
  }
}