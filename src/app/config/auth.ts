import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from 'next-auth/providers/google';
import { supabase } from '@/lib/supabaseClient';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email и пароль обязательны");
        }

        try {
          // Авторизуем пользователя через Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (authError || !authData.user) {
            throw new Error("Неверный email или пароль");
          }

          // Получаем профиль пользователя
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (profileError) {
            console.error('Profile fetch error:', profileError);
            throw new Error("Ошибка получения профиля пользователя");
          }

          if (!profile.is_active) {
            throw new Error("Аккаунт деактивирован");
          }

          // Обновляем последний вход
          await supabase.rpc('update_last_login', { user_id: authData.user.id });

          return {
            id: authData.user.id,
            email: authData.user.email!,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email,
            role: profile.role,
            permissions: profile.permissions || [],
            avatar_url: profile.avatar_url,
            company_name: profile.company_name,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.permissions = (user as any).permissions;
        token.avatar_url = (user as any).avatar_url;
        token.company_name = (user as any).company_name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).permissions = token.permissions;
        (session.user as any).avatar_url = token.avatar_url;
        (session.user as any).company_name = token.company_name;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Если пользователь входит и у него есть админские права
      if (url === baseUrl || url === `${baseUrl}/`) {
        // Проверяем в URL параметрах или в сессии роль пользователя
        // Здесь можно добавить логику перенаправления для админов
        return baseUrl;
      }
      
      // Если это относительный URL, делаем его абсолютным
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // Если URL принадлежит тому же сайту, разрешаем
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};