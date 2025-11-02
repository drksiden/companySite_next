"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Shield,
  Building,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Activity,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DataTable,
  DataTableColumnHeader,
  DataTableRowActions,
  DataTableSkeleton,
} from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import { ContentLayout } from "@/components/admin-panel/content-layout";

// Types
interface User {
  id: string;
  email: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  phone: string;
  avatar_url?: string;
  role: "customer" | "manager" | "admin" | "super_admin";
  status: "active" | "inactive" | "suspended";
  company_name?: string;
  position?: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  orders_count?: number;
  total_spent?: number;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  customers: number;
  admins: number;
  newToday: number;
  activeToday: number;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

// Utility functions
const getRoleColor = (role: User["role"]) => {
  switch (role) {
    case "super_admin":
      return "bg-red-100 text-red-800 border-red-200";
    case "admin":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "manager":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "customer":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getRoleLabel = (role: User["role"]) => {
  switch (role) {
    case "super_admin":
      return "Супер Админ";
    case "admin":
      return "Администратор";
    case "manager":
      return "Менеджер";
    case "customer":
      return "Клиент";
    default:
      return role;
  }
};

const getStatusColor = (status: User["status"]) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200";
    case "inactive":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "suspended":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusLabel = (status: User["status"]) => {
  switch (status) {
    case "active":
      return "Активен";
    case "inactive":
      return "Неактивен";
    case "suspended":
      return "Заблокирован";
    default:
      return status;
  }
};

// Stat Card Component
const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  href,
}: {
  title: string;
  value: number;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}) => {
  const isPositive = change >= 0;

  const content = (
    <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold">{value.toLocaleString()}</p>
              {change !== 0 && (
                <Badge
                  variant={isPositive ? "default" : "destructive"}
                  className="text-xs"
                >
                  {isPositive ? "+" : ""}
                  {change}%
                </Badge>
              )}
            </div>
          </div>
          <div className="p-3 bg-primary/10 rounded-full">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
};

// Hook to fetch users data
const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to fetch from API
        const response = await fetch("/api/admin/users");

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data);

        // Calculate stats
        const stats: UserStats = {
          total: data.length,
          active: data.filter((u: User) => u.status === "active").length,
          inactive: data.filter((u: User) => u.status === "inactive").length,
          suspended: data.filter((u: User) => u.status === "suspended").length,
          customers: data.filter((u: User) => u.role === "customer").length,
          admins: data.filter(
            (u: User) => u.role === "admin" || u.role === "super_admin",
          ).length,
          newToday: data.filter((u: User) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return new Date(u.created_at) >= today;
          }).length,
          activeToday: data.filter((u: User) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return u.last_sign_in_at && new Date(u.last_sign_in_at) >= today;
          }).length,
        };

        setStats(stats);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch users");
        setUsers([]);
        setStats({
          total: 0,
          active: 0,
          inactive: 0,
          suspended: 0,
          customers: 0,
          admins: 0,
          newToday: 0,
          activeToday: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const updateUserStatus = async (userId: string, status: User["status"]) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, status } : user,
        ),
      );

      return { success: true };
    } catch (err) {
      console.error("Error updating user status:", err);
      return {
        success: false,
        error:
          err instanceof Error ? err.message : "Failed to update user status",
      };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      // Update local state
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));

      return { success: true };
    } catch (err) {
      console.error("Error deleting user:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to delete user",
      };
    }
  };

  return {
    users,
    stats,
    isLoading,
    error,
    updateUserStatus,
    deleteUser,
  };
};

// Main component
export default function UsersPage() {
  const { users, stats, isLoading, error, updateUserStatus, deleteUser } =
    useUsers();
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  // Define columns for the data table
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "full_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Пользователь" />
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar_url} alt={user.full_name} />
              <AvatarFallback>
                {user.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.full_name}</div>
              <div className="text-sm text-muted-foreground flex items-center">
                <Mail className="mr-1 h-3 w-3" />
                {user.email}
              </div>
              {user.phone && (
                <div className="text-sm text-muted-foreground flex items-center">
                  <Phone className="mr-1 h-3 w-3" />
                  {user.phone}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Роль" />
      ),
      cell: ({ row }) => {
        const role = row.getValue("role") as User["role"];
        return (
          <Badge variant="outline" className={cn("border", getRoleColor(role))}>
            <Shield className="mr-1 h-3 w-3" />
            {getRoleLabel(role)}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Статус" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as User["status"];
        return (
          <Badge
            variant="outline"
            className={cn("border", getStatusColor(status))}
          >
            <Activity className="mr-1 h-3 w-3" />
            {getStatusLabel(status)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "company_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Компания" />
      ),
      cell: ({ row }) => {
        const user = row.original;
        return user.company_name ? (
          <div>
            <div className="font-medium flex items-center">
              <Building className="mr-1 h-3 w-3" />
              {user.company_name}
            </div>
            {user.position && (
              <div className="text-sm text-muted-foreground">
                {user.position}
              </div>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: "orders_count",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Заказы" />
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div>
            <div className="font-medium">{user.orders_count || 0} заказов</div>
            {user.total_spent && (
              <div className="text-sm text-muted-foreground">
                {user.total_spent.toLocaleString()} ₸
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Регистрация" />
      ),
      cell: ({ row }) => {
        const user = row.original;
        const createdAt = new Date(user.created_at);
        const lastSignIn = user.last_sign_in_at
          ? new Date(user.last_sign_in_at)
          : null;

        return (
          <div className="text-sm">
            <div className="flex items-center">
              <Calendar className="mr-1 h-3 w-3" />
              {createdAt.toLocaleDateString("ru-RU")}
            </div>
            {lastSignIn && (
              <div className="text-muted-foreground">
                Вход: {lastSignIn.toLocaleDateString("ru-RU")}
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          actions={[
            {
              label: "Просмотр",
              onClick: (user) => {
                window.location.href = `/admin/users/${user.id}`;
              },
              icon: Eye,
            },
            {
              label: "Редактировать",
              onClick: (user) => {
                console.log("Edit user:", user);
              },
              icon: Edit,
            },
            {
              label: "Удалить",
              onClick: async (user) => {
                if (
                  confirm("Вы уверены, что хотите удалить этого пользователя?")
                ) {
                  await deleteUser(user.id);
                }
              },
              icon: Trash2,
              variant: "destructive",
            },
          ]}
          statusActions={[
            {
              label: "Активировать",
              value: "active",
              onSelect: async (user, value) => {
                await updateUserStatus(user.id, value as User["status"]);
              },
            },
            {
              label: "Деактивировать",
              value: "inactive",
              onSelect: async (user, value) => {
                await updateUserStatus(user.id, value as User["status"]);
              },
            },
            {
              label: "Заблокировать",
              value: "suspended",
              onSelect: async (user, value) => {
                await updateUserStatus(user.id, value as User["status"]);
              },
            },
          ]}
        />
      ),
    },
  ];

  // Handle row selection
  const handleRowSelect = useCallback((selectedRows: User[]) => {
    setSelectedUsers(selectedRows);
  }, []);

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-lg font-semibold text-destructive">
            Ошибка загрузки данных
          </h2>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-12 w-12 bg-muted rounded-full animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <DataTableSkeleton columnCount={6} rowCount={10} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ContentLayout title="Пользователи">
      <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="Всего пользователей"
          value={stats?.total || 0}
          change={8.2}
          icon={Users}
        />
        <StatCard
          title="Активных"
          value={stats?.active || 0}
          change={5.4}
          icon={Activity}
        />
        <StatCard
          title="Новых сегодня"
          value={stats?.newToday || 0}
          change={12.1}
          icon={UserPlus}
        />
        <StatCard
          title="Администраторов"
          value={stats?.admins || 0}
          change={0}
          icon={Shield}
        />
      </motion.div>

      {/* Users Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Пользователи</CardTitle>
                <CardDescription>
                  Управление пользователями и их правами доступа
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                {selectedUsers.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      Выбрано: {selectedUsers.length}
                    </span>
                    <Button size="sm" variant="outline">
                      Массовые действия
                    </Button>
                  </div>
                )}
                <Button size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Добавить пользователя
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={users}
              searchPlaceholder="Поиск по имени, email или компании..."
              onRowSelect={handleRowSelect}
              enableRowSelection={true}
              enableColumnVisibility={true}
              pageSize={15}
            />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
    </ContentLayout>
  );
}
