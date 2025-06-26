import { useSession } from "next-auth/react";

export default function AccountOrdersPage() {
  const { data: session } = useSession();

  if (!session) {
    return <div>Пожалуйста, войдите в аккаунт</div>;
  }

  return <div>Мои заказы</div>;
}