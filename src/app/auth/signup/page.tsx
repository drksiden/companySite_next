"use client";
import { SignUpForm } from "@/features/auth/components/signup-form";
import { motion } from "framer-motion";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background dark:bg-background transition-smooth p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center w-full"
      >
        <Suspense fallback={<div>Loading...</div>}>
          <SignUpForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
