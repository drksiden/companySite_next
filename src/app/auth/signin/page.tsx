// src/app/auth/signin/page.tsx (или где у вас находится страница)
'use client';

import { SignInForm } from "@/components/auth/signin-form";
import { motion } from "framer-motion";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full" // Позволяет SignInForm контролировать свою max-w
      >
        <SignInForm />
      </motion.div>
      {/* Можно добавить какой-нибудь футер или ссылку на регистрацию, если нужно */}
      {/* <p className="mt-8 text-center text-sm text-gray-400">
        Еще нет аккаунта?{' '}
        <a href="/auth/signup" className="font-semibold text-indigo-400 hover:text-indigo-300">
          Зарегистрироваться
        </a>
      </p> */}
    </div>
  );
}