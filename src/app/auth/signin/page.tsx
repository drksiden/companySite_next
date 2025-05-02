'use client';

import { SignInForm } from "@/components/auth/signin-form";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <SignInForm />
    </div>
  );
}