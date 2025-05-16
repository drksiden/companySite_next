// config/auth.ts
import type { AuthOptions, User as NextAuthUser } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from 'next-auth/providers/google';
import { sdk } from '@/lib/sdk'; // Ваш Medusa SDK
import { FetchError } from "@medusajs/js-sdk";
import { HttpTypes } from "@medusajs/types"; // Импортируем типы Medusa

// Расширяем стандартные типы User, Session и JWT в NextAuth
declare module "next-auth" {
  interface User {
    medusa_id?: string;
    first_name?: string;
    last_name?: string;
    email: string;
    name?: string | null;
    isPartial?: boolean;
    medusaToken?: string;
  }

  interface Session {
    user: User & {
      id: string;
      medusa_id?: string;
      first_name?: string;
      last_name?: string;
      isPartial?: boolean;
    };
    medusaToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    medusa_id?: string;
    first_name?: string;
    last_name?: string;
    email: string;
    name?: string | null;
    picture?: string | null;
    sub?: string;
    isPartial?: boolean;
    medusaToken?: string;
  }
}

export const authConfig: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Credentials({
            credentials: {
                email: { label: 'email', type: 'email', required: true },
                password: { label: 'password', type: 'password', required: true },
            },
            async authorize(credentials, req) {
                console.log("AUTHORIZE: Попытка входа Medusa (sdk.auth.login) для email:", credentials?.email);
                if (!credentials?.email || !credentials?.password) {
                    console.log("AUTHORIZE: Учетные данные отсутствуют");
                    return null;
                }

                let loginAuthToken: string | null = null;

                try {
                    // Шаг 1: Вход в Medusa и получение токена
                    const loginResponse = await sdk.auth.login("customer", "emailpass", {
                        email: credentials.email,
                        password: credentials.password,
                    });
                    console.log("AUTHORIZE: Ответ от Medusa sdk.auth.login:", loginResponse);

                    if (typeof loginResponse === 'string') {
                        loginAuthToken = loginResponse;
                    } else if (loginResponse && typeof loginResponse === 'object' && 'token' in loginResponse) {
                        loginAuthToken = (loginResponse as { token: string }).token;
                    } else if (loginResponse && typeof loginResponse === 'object' && 'access_token' in loginResponse) { 
                        loginAuthToken = (loginResponse as { access_token: string }).access_token;
                    } else {
                        console.error("AUTHORIZE: sdk.auth.login не вернул строковый токен или объект с токеном. Ответ:", loginResponse);
                        return null;
                    }
                    
                    console.log("AUTHORIZE: Medusa sdk.auth.login успешен, получен токен (первые 10 симв.):", loginAuthToken.substring(0,10)+"...");

                    // Шаг 2: Получение профиля customer с использованием sdk.client.fetch и явной передачи токена
                    try {
                        console.log("AUTHORIZE: Попытка sdk.client.fetch('/store/customers/me') с ЯВНЫМ Authorization Header");
                        
                        // sdk.client.config.baseUrl уже должен быть установлен в вашем lib/sdk.ts
                        // x-publishable-api-key также должен автоматически добавляться SDK, если он был сконфигурирован при инициализации SDK.
                        // Если нет, его нужно добавить в headers ниже.
                        const customerResponse = await sdk.client.fetch<{ customer: HttpTypes.StoreCustomer }>(
                            `/store/customers/me`, // Эндпоинт для получения текущего пользователя
                            {
                                method: "GET",
                                headers: {
                                    "Authorization": `Bearer ${loginAuthToken}`,
                                    "Content-Type": "application/json", // Не обязательно для GET, но хорошая практика
                                    // Если publishableApiKey не добавляется автоматически SDK в этом контексте:
                                    // "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!
                                },
                                // query: { fields: "*orders" }, // Можно добавить, если нужны конкретные поля или развертывания
                            }
                        );
                        
                        if (!customerResponse || !customerResponse.customer) {
                            console.error("AUTHORIZE: Ответ от sdk.client.fetch не содержит данных пользователя:", customerResponse);
                            return null;
                        }
                        const customer = customerResponse.customer;
                        console.log("AUTHORIZE: Medusa sdk.client.fetch('/store/customers/me') успешен, ID пользователя:", customer.id);
                        
                        return {
                            id: customer.id,
                            medusa_id: customer.id,
                            email: customer.email,
                            first_name: customer.first_name,
                            last_name: customer.last_name,
                            name: customer.first_name && customer.last_name 
                                  ? `${customer.first_name} ${customer.last_name}` 
                                  : customer.email,
                            isPartial: false,
                            medusaToken: loginAuthToken,
                        } as NextAuthUser;

                    } catch (retrieveError) {
                        const fetchRetrieveError = retrieveError as FetchError; // sdk.client.fetch может выбрасывать FetchError
                        console.error(
                            "AUTHORIZE: Ошибка при sdk.client.fetch('/store/customers/me') - Статус:", 
                            fetchRetrieveError.status, 
                            "Сообщение:", fetchRetrieveError.message,
                            "Полная ошибка:", JSON.stringify(fetchRetrieveError)
                        );

                        if (fetchRetrieveError.status === 404 || (fetchRetrieveError.message && fetchRetrieveError.message.toLowerCase().includes("not found"))) {
                            console.warn("AUTHORIZE: Профиль Medusa customer не найден для email (используем email как ID):", credentials.email);
                            return {
                                id: credentials.email, 
                                email: credentials.email,
                                name: credentials.email, 
                                isPartial: true,
                                medusaToken: loginAuthToken,
                            } as NextAuthUser;
                        }
                        return null; 
                    }
                } catch (error: any) { // Ошибки от sdk.auth.login
                    const fetchError = error as FetchError;
                    console.error(
                        "AUTHORIZE: Ошибка аутентификации Medusa (sdk.auth.login) - Статус:", 
                        fetchError.status, 
                        "Сообщение:", fetchError.message,
                        "Полная ошибка:", JSON.stringify(fetchError)
                    );
                    return null;
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: { // Колбэки остаются такими же
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
                token.email = user.email;
                token.name = user.name;
                token.isPartial = user.isPartial;
                if (user.medusa_id) token.medusa_id = user.medusa_id;
                if (user.first_name) token.first_name = user.first_name;
                if (user.last_name) token.last_name = user.last_name;
                if (user.medusaToken) token.medusaToken = user.medusaToken;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.sub) session.user.id = token.sub;
            if (token.email) session.user.email = token.email;
            if (token.name) session.user.name = token.name;
            if (typeof token.isPartial === 'boolean') session.user.isPartial = token.isPartial;
            if (token.medusa_id) session.user.medusa_id = token.medusa_id as string;
            if (token.first_name) session.user.first_name = token.first_name as string;
            if (token.last_name) session.user.last_name = token.last_name as string;
            if (token.medusaToken) token.medusaToken = token.medusaToken;

            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
    },
    secret: process.env.NEXTAUTH_SECRET,
    // debug: process.env.NODE_ENV === "development",
};
