import { useSession } from "next-auth/react";

export default function AccountPage() {
  const { data: session } = useSession();

  if (!session) {
    return <div>Пожалуйста, войдите в аккаунт</div>;
  }

  return <div>Мой аккаунт</div>;
}