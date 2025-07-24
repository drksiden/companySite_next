// src/app/admin/users/page.tsx
import { Metadata } from 'next';
import { UserManagerClient } from '@/components/admin/UserManagerClient'; // Adjust path if necessary
import { userService } from '@/lib/services/user'; // Adjust path if necessary
import { Separator } from '@/components/ui/separator'; // Assuming you have this component
import { Heading } from '@/components/ui/heading'; // Assuming you have a custom Heading component or use a standard tag

export const metadata: Metadata = {
  title: 'Управление пользователями | Админ-панель',
  description: 'Управление пользователями, ролями и доступом в административной панели.',
};

export default async function UsersPage() {
  return (
    <UserManagerClient />
  );
}