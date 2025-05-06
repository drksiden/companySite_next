import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Medusa from "@medusajs/medusa-js";

const medusa = new Medusa({ baseUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000", maxRetries: 3, publishableApiKey: process.env.NEXT_PUBLIC_MEDUSA_API_KEY || '' });

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
        const { customer } = await medusa.auth.authenticate({
            email: credentials.email,
            password: credentials.password,
        });

        if (customer) {
            return {
            id: customer.id,
            email: customer.email,
            name: `${customer.first_name || ""} ${customer.last_name || ""}`.trim(),
            };
        }

        return null;
        } catch (_) { // Заменяем `error` на `_`
        throw new Error("Invalid email or password");
        console.log(_)
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    newUser: "/auth/signup",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
    if (token && session.user) { // Добавляем проверку `session.user`
        session.user.id = token.id as string;
        session.user.email = token.email as string;
    }
    return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);