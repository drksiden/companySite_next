import { useSession } from "next-auth/react";

export default function AccountSettingsPage() {
  const { data: session } = useSession();

  if (!session) {
    return <div>Пожалуйста, войдите в аккаунт</div>;
  }

  return <div>Настройки аккаунта</div>;
}