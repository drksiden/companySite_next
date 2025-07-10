// src/app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  MoreHorizontal, 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield,
  Ban,
  CheckCircle,
  Filter
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  role: 'customer' | 'manager' | 'admin' | 'super_admin';
  company_name?: string;
  position?: string;
  is_active: boolean;
  permissions: string[];
  last_login_at?: string;
  login_count: number;
  created_at: string;
  updated_at: string;
}

const roleLabels = {
  customer: 'Клиент',
  manager: 'Менеджер',
  admin: 'Админ',
  super_admin: 'Супер Админ'
};

const roleVariants = {
  customer: 'outline',
  manager: 'secondary',
  admin: 'default',
  super_admin: 'destructive'
} as const;

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const canEditRoles = session?.user?.role === 'super_admin';
  const canDeleteUsers = session?.user?.role === 'super_admin';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Не удалось загрузить пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<UserProfile>) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ));
      
      toast.success('Пользователь обновлен');
      setIsEditDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Ошибка при обновлении пользователя');
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    await handleUpdateUser(userId, { is_active: !isActive });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.company_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName[0].toUpperCase();
    return email?.[0]?.toUpperCase() || 'U';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AdminAuthGuard requiredRole={['admin', 'super_admin']}>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Пользователи</h2>
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminAuthGuard>
    );
  }

  return (
    <AdminAuthGuard requiredRole={['admin', 'super_admin']}>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Пользователи</h2>
          {canEditRoles && (
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Добавить пользователя
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Управление пользователями</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Поиск пользователей..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все роли</SelectItem>
                  <SelectItem value="customer">Клиенты</SelectItem>
                  <SelectItem value="manager">Менеджеры</SelectItem>
                  <SelectItem value="admin">Админы</SelectItem>
                  <SelectItem value="super_admin">Супер Админы</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="inactive">Неактивные</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Компания</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Последний вход</TableHead>
                  <TableHead>Дата регистрации</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>
                            {getInitials(user.first_name, user.last_name, user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.first_name && user.last_name 
                              ? `${user.first_name} ${user.last_name}`
                              : user.email
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="text-sm text-muted-foreground">
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleVariants[user.role]}>
                        {roleLabels[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        {user.company_name && (
                          <div className="font-medium">{user.company_name}</div>
                        )}
                        {user.position && (
                          <div className="text-sm text-muted-foreground">{user.position}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {user.is_active ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Ban className="h-4 w-4 text-red-500" />
                        )}
                        <span className={user.is_active ? 'text-green-600' : 'text-red-600'}>
                          {user.is_active ? 'Активен' : 'Заблокирован'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.last_login_at ? (
                        <div>
                          <div className="text-sm">
                            {formatDate(user.last_login_at)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Входов: {user.login_count}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Никогда</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Действия</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingUser(user);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                          >
                            {user.is_active ? (
                              <>
                                <Ban className="mr-2 h-4 w-4" />
                                Заблокировать
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Активировать
                              </>
                            )}
                          </DropdownMenuItem>
                          {canEditRoles && (
                            <DropdownMenuItem>
                              <Shield className="mr-2 h-4 w-4" />
                              Права доступа
                            </DropdownMenuItem>
                          )}
                          {canDeleteUsers && user.role !== 'super_admin' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Удалить
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Пользователи не найдены</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Редактировать пользователя</DialogTitle>
              <DialogDescription>
                Изменение информации о пользователе.
              </DialogDescription>
            </DialogHeader>
            {editingUser && (
              <EditUserForm
                user={editingUser}
                onSave={(updates) => handleUpdateUser(editingUser.id, updates)}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setEditingUser(null);
                }}
                canEditRole={canEditRoles}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminAuthGuard>
  );
}

// Компонент формы редактирования пользователя
function EditUserForm({
  user,
  onSave,
  onCancel,
  canEditRole
}: {
  user: UserProfile;
  onSave: (updates: Partial<UserProfile>) => void;
  onCancel: () => void;
  canEditRole: boolean;
}) {
  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    phone: user.phone || '',
    company_name: user.company_name || '',
    position: user.position || '',
    role: user.role,
    is_active: user.is_active,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">Имя</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Фамилия</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Телефон</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company_name">Компания</Label>
        <Input
          id="company_name"
          value={formData.company_name}
          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="position">Должность</Label>
        <Input
          id="position"
          value={formData.position}
          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
        />
      </div>

      {canEditRole && (
        <div className="space-y-2">
          <Label htmlFor="role">Роль</Label>
          <Select 
            value={formData.role} 
            onValueChange={(value) => setFormData({ ...formData, role: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">Клиент</SelectItem>
              <SelectItem value="manager">Менеджер</SelectItem>
              <SelectItem value="admin">Админ</SelectItem>
              <SelectItem value="super_admin">Супер Админ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="is_active">Активный пользователь</Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit">
          Сохранить
        </Button>
      </DialogFooter>
    </form>
  );
}