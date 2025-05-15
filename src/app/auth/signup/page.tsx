'use client';

import { SignUpForm } from "@/components/auth/signup-form"; // Убедитесь, что путь правильный
import { motion } from "framer-motion";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full" // Позволяет SignUpForm контролировать свою max-w
      >
        <SignUpForm />
      </motion.div>
    </div>
  );
}
