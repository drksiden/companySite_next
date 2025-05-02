import { useSession } from "next-auth/react";

export default function AccountWishlistPage() {
  const { data: session } = useSession();

  if (!session) {
    return <div>Пожалуйста, войдите в аккаунт</div>;
  }

  return <div>Список желаемого</div>;
}