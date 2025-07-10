// src/types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: 'customer' | 'manager' | 'admin' | 'super_admin';
      permissions: string[];
      avatar_url?: string | null;
      company_name?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: 'customer' | 'manager' | 'admin' | 'super_admin';
    permissions: string[];
    avatar_url?: string | null;
    company_name?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name?: string | null;
    role: 'customer' | 'manager' | 'admin' | 'super_admin';
    permissions: string[];
    avatar_url?: string | null;
    company_name?: string | null;
  }
}
