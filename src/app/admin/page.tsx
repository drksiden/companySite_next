// src/app/admin/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Package, 
  ShoppingBag, 
  TrendingUp,
  Activity,
  Database,
  Settings,
  BarChart3
} from 'lucide-react';

interface AdminStats {
  users: {
    total: number;
    active: number;
    new_this_month: number;
  };
  products: {
    total: number;
    active: number;
    out_of_stock: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    revenue: number;
  };
  categories: {
    total: number;
    active: number;
  };
}

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend 
}: { 
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  trend?: { value: number; label: string };
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && (
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      )}
      {trend && (
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          <TrendingUp className="h-3 w-3 mr-1" />
          <span className={trend.value > 0 ? 'text-green-600' : 'text-red-600'}>
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="ml-1">{trend.label}</span>
        </div>
      )}
    </CardContent>
  </Card>
);

const LoadingSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Здесь будем получать статистику из API
        // Пока заглушка с фиктивными данными
        await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация загрузки
        
        const mockStats: AdminStats = {
          users: {
            total: 150,
            active: 142,
            new_this_month: 23,
          },
          products: {
            total: 89,
            active: 76,
            out_of_stock: 5,
          },
          orders: {
            total: 234,
            pending: 12,
            completed: 200,
            revenue: 1250000,
          },
          categories: {
            total: 15,
            active: 12,
          },
        };

        setStats(mockStats);
      } catch (err) {
        setError('Не удалось загрузить статистику');
        console.error('Stats fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'admin': return 'default';
      case 'manager': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Супер Админ';
      case 'admin': return 'Админ';
      case 'manager': return 'Менеджер';
      case 'customer': return 'Клиент';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Панель управления</h2>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <Activity className="h-5 w-5 mr-2" />
                Ошибка загрузки
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Панель управления</h2>
          <p className="text-muted-foreground">
            Добро пожаловать, {session?.user?.name || session?.user?.email}
            <Badge 
              variant={getRoleBadgeVariant(session?.user?.role || '')} 
              className="ml-2"
            >
              {getRoleLabel(session?.user?.role || '')}
            </Badge>
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Всего пользователей"
          value={stats?.users.total || 0}
          subtitle={`${stats?.users.active} активных`}
          icon={Users}
          trend={{ value: 12, label: 'за месяц' }}
        />
        
        <StatCard
          title="Товары"
          value={stats?.products.total || 0}
          subtitle={`${stats?.products.out_of_stock} нет в наличии`}
          icon={Package}
        />
        
        <StatCard
          title="Заказы"
          value={stats?.orders.total || 0}
          subtitle={`${stats?.orders.pending} в обработке`}
          icon={ShoppingBag}
        />
        
        <StatCard
          title="Выручка"
          value={formatCurrency(stats?.orders.revenue || 0)}
          subtitle="за все время"
          icon={BarChart3}
          trend={{ value: 8, label: 'за месяц' }}
        />

        <StatCard
          title="Категории"
          value={stats?.categories.total || 0}
          subtitle={`${stats?.categories.active} активных`}
          icon={Database}
        />

        <StatCard
          title="Новые клиенты"
          value={stats?.users.new_this_month || 0}
          subtitle="за этот месяц"
          icon={TrendingUp}
        />

        <StatCard
          title="Завершенные заказы"
          value={stats?.orders.completed || 0}
          subtitle="успешно обработано"
          icon={Activity}
        />

        <StatCard
          title="Система"
          value="Работает"
          subtitle="все сервисы доступны"
          icon={Settings}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Последняя активность</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Новый заказ #1234</p>
                  <p className="text-xs text-muted-foreground">2 минуты назад</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Товар добавлен в каталог</p>
                  <p className="text-xs text-muted-foreground">15 минут назад</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Низкий остаток товара</p>
                  <p className="text-xs text-muted-foreground">1 час назад</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full text-left p-2 rounded hover:bg-muted transition-colors">
                <p className="text-sm font-medium">Добавить товар</p>
                <p className="text-xs text-muted-foreground">Создать новый товар в каталоге</p>
              </button>
              <button className="w-full text-left p-2 rounded hover:bg-muted transition-colors">
                <p className="text-sm font-medium">Просмотреть заказы</p>
                <p className="text-xs text-muted-foreground">Управление заказами клиентов</p>
              </button>
              <button className="w-full text-left p-2 rounded hover:bg-muted transition-colors">
                <p className="text-sm font-medium">Настройки</p>
                <p className="text-xs text-muted-foreground">Конфигурация системы</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}