// src/components/admin/UserManagerClient.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  UserProfile,
  Company,
  UserRole,
  ClientType,
} from '@/lib/services/user';

import {
  UserForm,
  USER_ROLES,
  CLIENT_TYPES,
  userCreateSchema,
  userUpdateSchema,
} from './UserForm';
import z from 'zod';

type UserFormData = z.infer<typeof userCreateSchema> | z.infer<typeof userUpdateSchema>;


interface UserManagerClientProps {
  initialUsers?: UserProfile[];
  companies?: Company[]; // Этот пропс остается, чтобы можно было передать данные с сервера
}

export const UserManagerClient: React.FC<UserManagerClientProps> = ({
  initialUsers,
  companies: initialCompaniesFromProps, // Переименовали для ясности
}) => {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers || []);
  // ИСПРАВЛЕНИЕ: Инициализируем `companies` из пропсов `initialCompaniesFromProps`
  const [companies, setCompanies] = useState<Company[]>(initialCompaniesFromProps || []);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterClientType, setFilterClientType] = useState<string>('all');

  // `isFormOpen` и `selectedUser` уже объявлены, нет нужды их дублировать
  // const [isFormOpen, setIsFormOpen] = useState(false);
  // const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const fetchUsers = async () => {
    // Эта функция будет вызываться для обновления списка пользователей после CRUD операций
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data: UserProfile[] = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching users');
      toast.error(err.message || 'Ошибка при загрузке пользователей.');
    } finally {
      // setLoading(false); // Загрузка будет управляться в fetchAllData
    }
  };

  const fetchCompanies = async () => {
    // Новая функция для загрузки компаний
    try {
      setLoading(true); // Если вызывается отдельно, то управляет своим loading
      const response = await fetch('/api/admin/companies');
      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }
      const data: Company[] = await response.json();
      setCompanies(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching companies');
      toast.error(err.message || 'Ошибка при загрузке компаний.');
    } finally {
      // setLoading(false); // Загрузка будет управляться в fetchAllData
    }
  };


  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersData, companiesData] = await Promise.all([
          fetch('/api/admin/users').then(res => {
            if (!res.ok) throw new Error('Failed to fetch users');
            return res.json();
          }),
          fetch('/api/admin/companies').then(res => {
            if (!res.ok) throw new Error('Failed to fetch companies');
            return res.json();
          })
        ]);
        setUsers(usersData);
        setCompanies(companiesData);
      } catch (err: any) {
        setError(err.message || 'Ошибка при загрузке данных.');
        toast.error(err.message || 'Ошибка при загрузке данных.');
      } finally {
        setLoading(false);
      }
    };

    // Загружаем данные только если они не были переданы через пропсы,
    // или если хотим всегда обновлять данные при монтировании компонента.
    // Если `initialUsers` или `initialCompaniesFromProps` не пусты, можно пропустить первую загрузку.
    // Для простоты, будем всегда загружать данные при монтировании.
    fetchAllData();
  }, []); // Пустой массив зависимостей означает, что useEffect запускается один раз при монтировании


  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleFormSuccess = () => {
    fetchUsers(); // Обновляем список пользователей
    // fetchCompanies(); // Если компании могут меняться через форму, их тоже нужно обновить
    handleCloseModal();
  };


  const handleDeleteUsers = async (ids: string[]) => {
    if (!confirm('Вы уверены, что хотите удалить выбранных пользователей?')) {
      return;
    }
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users/batch', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при удалении пользователей.');
      }

      toast.success('Пользователи успешно удалены.');
      setRowSelection({}); // Очищаем выбор
      fetchUsers(); // Обновляем список
    } catch (err: any) {
      toast.error(err.message || 'Произошла непредвиденная ошибка при удалении.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateUsers = async (ids: string[], is_active: boolean) => {
    if (!confirm(`Вы уверены, что хотите ${is_active ? 'активировать' : 'деактивировать'} выбранных пользователей?`)) {
      return;
    }
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users/batch', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids, is_active }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка при ${is_active ? 'активации' : 'деактивации'} пользователей.`);
      }

      toast.success(`Пользователи успешно ${is_active ? 'активированы' : 'деактивированы'}.`);
      setRowSelection({}); // Очищаем выбор
      fetchUsers(); // Обновляем список
    } catch (err: any) {
      toast.error(err.message || 'Произошла непредвиденная ошибка при изменении статуса.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!confirm('Вы уверены, что хотите сбросить пароль для этого пользователя?')) {
      return;
    }
    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при сбросе пароля.');
      }
      toast.success('Пароль успешно сброшен. Новый пароль отправлен пользователю.');
    } catch (error: any) {
      toast.error(error.message || 'Произошла непредвиденная ошибка при сбросе пароля.');
    }
  };

  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    if (!confirm(`Вы уверены, что хотите изменить роль пользователя на "${newRole}"?`)) {
      return;
    }
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при изменении роли.');
      }
      toast.success(`Роль пользователя успешно изменена на "${newRole}".`);
      fetchUsers(); // Обновляем список
    } catch (error: any) {
      toast.error(error.message || 'Произошла непредвиденная ошибка при изменении роли.');
    }
  };


  const columns: ColumnDef<UserProfile>[] = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'email',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Email
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div className="lowercase">{row.getValue('email')}</div>,
      },
      {
        accessorKey: 'first_name',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Имя
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue('first_name') || 'N/A'}</div>,
      },
      {
        accessorKey: 'last_name',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Фамилия
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue('last_name') || 'N/A'}</div>,
      },
      {
        accessorKey: 'role',
        header: 'Роль',
        cell: ({ row }) => {
          const role: UserRole = row.getValue('role');
          let variant: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'info' | null | undefined;
          switch (role) {
            case 'admin':
              variant = 'destructive';
              break;
            case 'moderator':
              variant = 'secondary';
              break;
            case 'customer':
              variant = 'default';
              break;
            default:
              variant = 'outline';
          }
          return <Badge variant={variant}>{role}</Badge>;
        },
        filterFn: (row, id, value) => {
          if (value === 'all') return true;
          return row.getValue(id) === value;
        },
      },
      {
        accessorKey: 'is_active',
        header: 'Активен',
        cell: ({ row }) => (
          <Badge variant={row.getValue('is_active') ? 'success' : 'destructive'}>
            {row.getValue('is_active') ? 'Да' : 'Нет'}
          </Badge>
        ),
        filterFn: (row, id, value) => {
          if (value === 'all') return true;
          return row.getValue(id) === (value === 'true');
        },
      },
      {
        accessorKey: 'client_type',
        header: 'Тип клиента',
        cell: ({ row }) => {
          const clientType: ClientType = row.getValue('client_type');
          return <div>{clientType === 'individual' ? 'Физ. лицо' : 'Юр. лицо'}</div>;
        },
        filterFn: (row, id, value) => {
          if (value === 'all') return true;
          return row.getValue(id) === value;
        },
      },
      {
        accessorKey: 'company_id',
        header: 'Компания',
        cell: ({ row }) => {
          const companyId = row.getValue('company_id') as string | null;
          // Здесь `companies` гарантированно является `Company[]` благодаря инициализации
          // и загрузке данных в useEffect.
          const company = companies.find(c => c.id === companyId);
          return <div>{company ? company.name : 'N/A'}</div>;
        },
        enableSorting: false,
      },
      {
        accessorKey: 'created_at',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Дата регистрации
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const date = new Date(row.getValue('created_at'));
          return <div>{date.toLocaleDateString()}</div>;
        },
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const user = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Открыть меню</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Действия</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>
                  Копировать Email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleOpenEditModal(user)}>Редактировать</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>Сбросить пароль</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeactivateUsers([user.id], !user.is_active)}
                >
                  {user.is_active ? 'Деактивировать' : 'Активировать'}
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Изменить роль</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      {USER_ROLES.map((role) => (
                        <DropdownMenuItem
                          key={role}
                          onClick={() => handleChangeRole(user.id, role as UserRole)}
                        >
                          {role}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuItem onClick={() => handleDeleteUsers([user.id])}>Удалить</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [companies] // Добавили companies в зависимости useMemo
  );

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Apply filters manually since filterFn is used in column definitions
  useEffect(() => {
    table.getColumn('role')?.setFilterValue(filterRole);
  }, [filterRole, table]);

  useEffect(() => {
    table.getColumn('client_type')?.setFilterValue(filterClientType);
  }, [filterClientType, table]);


  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedUserIds = selectedRows.map((row) => row.original.id);

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
  if (loading) {
    return <div className="p-4 text-center">Загрузка данных пользователей и компаний...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Ошибка: {error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Пользователи</CardTitle>
        <CardDescription>
          Управление пользователями, их ролями и доступом.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-2 py-4">
          <Input
            placeholder="Поиск по email..."
            value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('email')?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Колонки <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenCreateModal}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Создать
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingUser ? 'Редактировать пользователя' : 'Создать пользователя'}</DialogTitle>
                  <DialogDescription>
                    {editingUser ? 'Внесите изменения в данные пользователя.' : 'Добавьте нового пользователя в систему.'}
                  </DialogDescription>
                </DialogHeader>
                <UserForm
                  initialData={editingUser}
                  companies={companies}
                  onSuccess={handleFormSuccess}
                  onClose={handleCloseModal}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Нет результатов.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex items-center justify-between w-full">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} из{' '}
            {table.getFilteredRowModel().rows.length} строк(а) выбрано.
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Предыдущая
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Следующая
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};