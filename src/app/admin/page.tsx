"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Users,
  Package,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Eye,
  Star,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Типы для статистики
interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  productsChange: number;
  usersChange: number;
  ordersChange: number;
  revenueChange: number;
}

interface RecentActivity {
  id: string;
  type: "order" | "user" | "product";
  message: string;
  timestamp: string;
  status: "success" | "warning" | "error";
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  image?: string;
}

// Анимационные варианты
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Компонент статистической карточки
const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  trend = "up",
  description,
  href,
}: {
  title: string;
  value: string | number;
  change: number;
  icon: any;
  trend?: "up" | "down";
  description?: string;
  href?: string;
}) => {
  const isPositive = change >= 0;
  const TrendIcon = trend === "up" ? ArrowUpRight : ArrowDownRight;

  const CardWrapper = href ? Link : "div";
  const cardProps = href ? { href } : {};

  return (
    <CardWrapper {...cardProps} className={href ? "block" : ""}>
      <motion.div variants={itemVariants}>
        <Card
          className={cn(
            "relative overflow-hidden transition-all duration-300",
            href && "hover:shadow-lg hover:scale-105 cursor-pointer group",
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <div
              className={cn(
                "p-2 rounded-lg transition-colors",
                href && "group-hover:bg-primary/10",
              )}
            >
              <Icon className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <div className="flex items-center text-xs mt-1">
              <TrendIcon
                className={cn(
                  "mr-1 h-3 w-3",
                  isPositive ? "text-green-500" : "text-red-500",
                )}
              />
              <span
                className={cn(
                  "font-medium",
                  isPositive ? "text-green-500" : "text-red-500",
                )}
              >
                {Math.abs(change)}%
              </span>
              {description && (
                <span className="text-muted-foreground ml-1">
                  {description}
                </span>
              )}
            </div>
          </CardContent>

          {/* Декоративный градиент */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-accent/50" />
        </Card>
      </motion.div>
    </CardWrapper>
  );
};

// Компонент активности
const ActivityItem = ({ activity }: { activity: RecentActivity }) => {
  const getStatusIcon = () => {
    switch (activity.status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeIcon = () => {
    switch (activity.type) {
      case "order":
        return <ShoppingBag className="h-4 w-4" />;
      case "user":
        return <Users className="h-4 w-4" />;
      case "product":
        return <Package className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
    >
      <div className="flex-shrink-0">{getTypeIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{activity.message}</p>
        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
      </div>
      <div className="flex-shrink-0">{getStatusIcon()}</div>
    </motion.div>
  );
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 1248,
    totalUsers: 892,
    totalOrders: 156,
    totalRevenue: 24890,
    productsChange: 12.5,
    usersChange: 8.2,
    ordersChange: -3.1,
    revenueChange: 15.8,
  });

  const [recentActivities] = useState<RecentActivity[]>([
    {
      id: "1",
      type: "order",
      message: "Новый заказ #1234 от Иван Петров",
      timestamp: "2 минуты назад",
      status: "success",
    },
    {
      id: "2",
      type: "user",
      message: "Новый пользователь зарегистрирован",
      timestamp: "15 минут назад",
      status: "success",
    },
    {
      id: "3",
      type: "product",
      message: 'Товар "iPhone 15" заканчивается на складе',
      timestamp: "1 час назад",
      status: "warning",
    },
    {
      id: "4",
      type: "order",
      message: "Заказ #1230 отменен",
      timestamp: "2 часа назад",
      status: "error",
    },
  ]);

  const [topProducts] = useState<TopProduct[]>([
    { id: "1", name: "iPhone 15 Pro", sales: 45, revenue: 67500 },
    { id: "2", name: "Samsung Galaxy S24", sales: 32, revenue: 38400 },
    { id: "3", name: "MacBook Pro M3", sales: 18, revenue: 54000 },
    { id: "4", name: "iPad Air", sales: 28, revenue: 22400 },
  ]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Заголовок */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Панель управления
          </h1>
          <p className="text-muted-foreground">
            Добро пожаловать в административную панель. Здесь вы можете
            управлять всеми аспектами вашего магазина.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Activity className="mr-1 h-3 w-3" />
            Система работает
          </Badge>
          <Button size="sm" asChild>
            <Link href="/admin/analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Подробная аналитика
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Статистические карточки */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Всего товаров"
            value={stats.totalProducts.toLocaleString()}
            change={stats.productsChange}
            icon={Package}
            href="/admin/catalog/products"
            description="за месяц"
          />
          <StatCard
            title="Пользователи"
            value={stats.totalUsers.toLocaleString()}
            change={stats.usersChange}
            icon={Users}
            href="/admin/users"
            description="за месяц"
          />
          <StatCard
            title="Заказы"
            value={stats.totalOrders.toLocaleString()}
            change={stats.ordersChange}
            trend="down"
            icon={ShoppingBag}
            href="/admin/orders"
            description="за месяц"
          />
          <StatCard
            title="Выручка"
            value={`${stats.totalRevenue.toLocaleString()} ₸`}
            change={stats.revenueChange}
            icon={DollarSign}
            href="/admin/analytics"
            description="за месяц"
          />
        </div>
      </motion.div>

      {/* Основной контент */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="products">Товары</TabsTrigger>
            <TabsTrigger value="activity">Активность</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Топ товары */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="mr-2 h-5 w-5 text-yellow-500" />
                    Топ товары
                  </CardTitle>
                  <CardDescription>
                    Самые продаваемые товары за последний месяц
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.sales} продаж
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {product.revenue.toLocaleString()} ₸
                        </p>
                        <p className="text-sm text-muted-foreground">выручка</p>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* Быстрые действия */}
              <Card>
                <CardHeader>
                  <CardTitle>Быстрые действия</CardTitle>
                  <CardDescription>
                    Часто используемые функции управления
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <Button
                    asChild
                    variant="outline"
                    className="justify-start h-auto p-4"
                  >
                    <Link href="/admin/catalog/products">
                      <Package className="mr-3 h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Добавить товар</div>
                        <div className="text-sm text-muted-foreground">
                          Создать новый товар в каталоге
                        </div>
                      </div>
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="justify-start h-auto p-4"
                  >
                    <Link href="/admin/catalog/categories">
                      <BarChart3 className="mr-3 h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">
                          Управление категориями
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Добавить или изменить категории
                        </div>
                      </div>
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="justify-start h-auto p-4"
                  >
                    <Link href="/admin/orders">
                      <ShoppingBag className="mr-3 h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Просмотр заказов</div>
                        <div className="text-sm text-muted-foreground">
                          Обработка и управление заказами
                        </div>
                      </div>
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="justify-start h-auto p-4"
                  >
                    <Link href="/admin/users">
                      <Users className="mr-3 h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">
                          Управление пользователями
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Просмотр и редактирование пользователей
                        </div>
                      </div>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Статистика товаров</CardTitle>
                <CardDescription>
                  Информация о состоянии каталога товаров
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">892</div>
                    <div className="text-sm text-muted-foreground">
                      Активные товары
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      156
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Заканчиваются
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">23</div>
                    <div className="text-sm text-muted-foreground">
                      Нет в наличии
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Последняя активность
                </CardTitle>
                <CardDescription>
                  Недавние события и изменения в системе
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentActivities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
