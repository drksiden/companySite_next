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
  title: string;
  description: string;
  time: string;
  status: "success" | "warning" | "error";
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  change: number;
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

  const content = (
    <motion.div variants={itemVariants}>
      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          href && "hover:shadow-lg hover:scale-105 cursor-pointer group",
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <TrendIcon
              className={cn(
                "h-3 w-3",
                isPositive ? "text-green-500" : "text-red-500",
              )}
            />
            <span
              className={cn(
                "font-medium",
                isPositive ? "text-green-600" : "text-red-600",
              )}
            >
              {Math.abs(change)}%
            </span>
            <span>с прошлого месяца</span>
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </CardContent>

        {/* Декоративный градиент */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-accent/50" />
      </Card>
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
};

// Компонент элемента активности
const ActivityItem = ({ activity }: { activity: RecentActivity }) => {
  const getIcon = () => {
    switch (activity.type) {
      case "order":
        return ShoppingBag;
      case "user":
        return Users;
      case "product":
        return Package;
      default:
        return Activity;
    }
  };

  const getStatusColor = () => {
    switch (activity.status) {
      case "success":
        return "text-green-500";
      case "warning":
        return "text-yellow-500";
      case "error":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  const Icon = getIcon();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center space-x-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
    >
      <div className={cn("rounded-full p-2 bg-muted", getStatusColor())}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">{activity.title}</p>
        <p className="text-sm text-muted-foreground">{activity.description}</p>
      </div>
      <div className="text-xs text-muted-foreground">{activity.time}</div>
    </motion.div>
  );
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 1234,
    totalUsers: 567,
    totalOrders: 89,
    totalRevenue: 12345,
    productsChange: 12.5,
    usersChange: -2.1,
    ordersChange: 8.3,
    revenueChange: 15.7,
  });

  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: "1",
      type: "order",
      title: "Новый заказ #1234",
      description: "Заказ на сумму 2500₽ от Иван Петров",
      time: "2 мин назад",
      status: "success",
    },
    {
      id: "2",
      type: "user",
      title: "Новый пользователь",
      description: "Анна Сидорова зарегистрировалась",
      time: "15 мин назад",
      status: "success",
    },
    {
      id: "3",
      type: "product",
      title: "Товар закончился",
      description: "iPhone 15 Pro недоступен на складе",
      time: "1 час назад",
      status: "warning",
    },
    {
      id: "4",
      type: "order",
      title: "Заказ отменен",
      description: "Заказ #1230 отменен клиентом",
      time: "2 часа назад",
      status: "error",
    },
  ]);

  const [topProducts] = useState<TopProduct[]>([
    {
      id: "1",
      name: "iPhone 15 Pro",
      sales: 45,
      revenue: 135000,
      change: 12.5,
    },
    {
      id: "2",
      name: "Samsung Galaxy S24",
      sales: 32,
      revenue: 96000,
      change: 8.3,
    },
    {
      id: "3",
      name: "MacBook Air M2",
      sales: 18,
      revenue: 180000,
      change: -2.1,
    },
  ]);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Панель управления
            </h2>
            <p className="text-muted-foreground">
              Добро пожаловать в административную панель
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Сегодня
            </Button>
            <Button size="sm">
              <BarChart3 className="mr-2 h-4 w-4" />
              Экспорт
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Статистические карточки */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="Общее количество товаров"
          value={stats.totalProducts.toLocaleString()}
          change={stats.productsChange}
          icon={Package}
          description="Активные товары в каталоге"
          href="/admin/catalog/products"
        />
        <StatCard
          title="Пользователи"
          value={stats.totalUsers.toLocaleString()}
          change={stats.usersChange}
          icon={Users}
          trend={stats.usersChange >= 0 ? "up" : "down"}
          description="Зарегистрированные пользователи"
          href="/admin/users"
        />
        <StatCard
          title="Заказы"
          value={stats.totalOrders.toLocaleString()}
          change={stats.ordersChange}
          icon={ShoppingBag}
          description="Заказы за текущий месяц"
          href="/admin/orders"
        />
        <StatCard
          title="Выручка"
          value={`${stats.totalRevenue.toLocaleString()}₽`}
          change={stats.revenueChange}
          icon={DollarSign}
          description="Общая выручка за месяц"
        />
      </motion.div>

      {/* Контент с вкладками */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
          <TabsTrigger value="reports">Отчеты</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* График продаж */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Продажи</CardTitle>
                <CardDescription>
                  Общие продажи за последние 12 месяцев
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="h-80 flex items-center justify-center bg-muted/30 rounded-lg"
                >
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      График будет здесь
                    </p>
                  </div>
                </motion.div>
              </CardContent>
            </Card>

            {/* Последняя активность */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Последняя активность</CardTitle>
                <CardDescription>Недавние действия в системе</CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1 }}
                  className="space-y-2"
                >
                  {recentActivity.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </div>

          {/* Топ товары */}
          <Card>
            <CardHeader>
              <CardTitle>Топ товары</CardTitle>
              <CardDescription>
                Самые продаваемые товары за последний месяц
              </CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
                className="space-y-4"
              >
                {topProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold text-muted-foreground">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.sales} продаж
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {product.revenue.toLocaleString()}₽
                      </p>
                      <div className="flex items-center space-x-1 text-xs">
                        {product.change >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        <span
                          className={cn(
                            "font-medium",
                            product.change >= 0
                              ? "text-green-600"
                              : "text-red-600",
                          )}
                        >
                          {Math.abs(product.change)}%
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Аналитика</CardTitle>
              <CardDescription>Подробная аналитика и метрики</CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="h-96 flex items-center justify-center bg-muted/30 rounded-lg"
              >
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">
                    Раздел в разработке
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Здесь будет подробная аналитика
                  </p>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Отчеты</CardTitle>
              <CardDescription>Генерация и просмотр отчетов</CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="h-96 flex items-center justify-center bg-muted/30 rounded-lg"
              >
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">
                    Отчеты скоро будут доступны
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Система отчетности в разработке
                  </p>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
