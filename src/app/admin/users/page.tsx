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
  // Поскольку UserManagerClient уже имеет логику загрузки данных на клиенте,
  // эту SSR загрузку можно использовать для первичного рендера или просто для демонстрации.
  // В более сложных случаях, можно передавать предварительно загруженные данные через props
  // и использовать их как initialData для UserManagerClient.
  // Для простоты, пока что UserManagerClient сам будет загружать данные.
  // Если нужна SSR загрузка, раскомментируйте и передайте данные в UserManagerClient

  // const users = await userService.listUserProfiles();
  // const companies = await userService.listCompanies();

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading title="Пользователи" description="Управление пользователями вашего магазина." />
        </div>
        <Separator />
        <UserManagerClient
          // initialUsers={users} // Если будете передавать SSR данные
          // initialCompanies={companies} // Если будете передавать SSR данные
        />
      </div>
    </div>
  );
}