import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { authConfig } from "../config/auth";

export default async function AccountPage() {
  const session = await getServerSession(authConfig);

  if (!session) {
    return <div>Пожалуйста, войдите в аккаунт</div>;
  }

  return <div>Мой аккаунт</div>;
}