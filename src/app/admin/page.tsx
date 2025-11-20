"use client";

import { useState, useEffect, ReactNode, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  Eye,
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Skeleton } from "@/components/ui/skeleton";

// Динамический импорт графиков для избежания SSR ошибок
const RevenueChart = dynamic(
  () => import("@/components/admin/DashboardCharts").then((mod) => ({ default: mod.RevenueChart })),
  {
    loading: () => <Skeleton className="h-[300px] w-full" />,
    ssr: false,
  }
);

const OrdersChart = dynamic(
  () => import("@/components/admin/DashboardCharts").then((mod) => ({ default: mod.OrdersChart })),
  {
    loading: () => <Skeleton className="h-[300px] w-full" />,
    ssr: false,
  }
);

// Types
interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  productsChange: number;
  usersChange: number;
  ordersChange: number;
  revenueChange: number;
  activeUsers: number;
  pendingOrders: number;
  lowStockProducts: number;
}

interface RecentActivity {
  id: string;
  type: "order" | "user" | "product" | "system";
  title: string;
  description: string;
  time: string;
  status: "success" | "warning" | "error" | "info";
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  change: number;
  category?: string;
}

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
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

// Components
const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  href,
  suffix = "",
}: {
  title: string;
  value: number;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  suffix?: string;
}) => {
  const isPositive = change >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  const content = (
    <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-1 group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold">
                {value.toLocaleString()}
                {suffix}
              </p>
              <div
                className={cn(
                  "flex items-center space-x-1 text-xs font-medium",
                  isPositive ? "text-green-600" : "text-red-600",
                )}
              >
                <TrendIcon className="h-3 w-3" />
                <span>{Math.abs(change)}%</span>
              </div>
            </div>
          </div>
          <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        {href && (
          <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center text-sm text-primary">
              Подробнее <ArrowUpRight className="ml-1 h-3 w-3" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
};

const ActivityItem = ({ activity }: { activity: RecentActivity }) => {
  const getStatusIcon = () => {
    switch (activity.status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeColor = () => {
    switch (activity.type) {
      case "order":
        return "bg-blue-100 text-blue-800";
      case "user":
        return "bg-green-100 text-green-800";
      case "product":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="mt-1">{getStatusIcon()}</div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">{activity.title}</p>
          <Badge variant="secondary" className={cn("text-xs", getTypeColor())}>
            {activity.type}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{activity.description}</p>
        <p className="text-xs text-muted-foreground flex items-center">
          <Clock className="mr-1 h-3 w-3" />
          {activity.time}
        </p>
      </div>
    </div>
  );
};

const QuickActionCard = ({ action }: { action: QuickAction }) => (
  <Link href={action.href}>
    <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-1 group cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className={cn("p-2 rounded-lg", action.color)}>
            <action.icon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-sm">{action.title}</h3>
            <p className="text-xs text-muted-foreground">
              {action.description}
            </p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </CardContent>
    </Card>
  </Link>
);

// Hook to fetch dashboard data
const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cache ref to prevent repeated API calls
  const cacheRef = useRef<{
    stats: DashboardStats | null;
    recentActivity: RecentActivity[];
    topProducts: TopProduct[];
    timestamp: number;
  } | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Check cache first (cache for 5 minutes)
        const now = Date.now();
        if (cacheRef.current && now - cacheRef.current.timestamp < 300000) {
          setStats(cacheRef.current.stats);
          setRecentActivity(cacheRef.current.recentActivity);
          setTopProducts(cacheRef.current.topProducts);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setError(null);

        let fetchedStats: DashboardStats | null = null;
        let fetchedActivity: RecentActivity[] = [];
        let fetchedTopProducts: TopProduct[] = [];

        // Fetch dashboard stats
        const statsResponse = await fetch("/api/admin/dashboard/stats");
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          // Преобразуем данные API в формат компонента
          fetchedStats = {
            totalProducts: statsData.totalProducts || 0,
            totalUsers: statsData.totalUsers || 0,
            totalOrders: statsData.totalOrders || 0,
            totalRevenue: statsData.totalRevenue || 0,
            productsChange: 0, // API не предоставляет изменение продуктов
            usersChange: 0, // API не предоставляет изменение пользователей
            ordersChange: statsData.changes?.orders || 0,
            revenueChange: statsData.changes?.revenue || 0,
            activeUsers: statsData.totalUsers || 0, // Можно добавить фильтр активных
            pendingOrders: statsData.pendingOrders || 0,
            lowStockProducts: statsData.lowStockProducts || 0,
          };
          setStats(fetchedStats);
        } else {
          // Fallback stats from individual APIs
          const [usersRes, ordersRes, productsRes] = await Promise.allSettled([
            fetch("/api/admin/users"),
            fetch("/api/admin/orders"),
            fetch("/api/admin/products"),
          ]);

          const users: unknown[] =
            usersRes.status === "fulfilled" && usersRes.value.ok
              ? await usersRes.value.json()
              : [];
          const orders: unknown[] =
            ordersRes.status === "fulfilled" && ordersRes.value.ok
              ? await ordersRes.value.json()
              : [];
          const products: unknown[] =
            productsRes.status === "fulfilled" && productsRes.value.ok
              ? await productsRes.value.json()
              : [];

          // Calculate stats from available data
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);

          const todayUsers = users.filter(
            (u: unknown) =>
              new Date((u as { created_at: string }).created_at) >= today,
          ).length;
          const yesterdayUsers = users.filter((u: unknown) => {
            const date = new Date((u as { created_at: string }).created_at);
            return date >= yesterday && date < today;
          }).length;

          const todayOrders = orders.filter(
            (o: unknown) =>
              new Date((o as { created_at: string }).created_at) >= today,
          ).length;
          const yesterdayOrders = orders.filter((o: unknown) => {
            const date = new Date((o as { created_at: string }).created_at);
            return date >= yesterday && date < today;
          }).length;

          const todayRevenue = orders
            .filter(
              (o: unknown) =>
                new Date((o as { created_at: string }).created_at) >= today,
            )
            .reduce(
              (sum: number, o: unknown) =>
                sum + ((o as { total?: number }).total || 0),
              0,
            );
          const yesterdayRevenue = orders
            .filter((o: unknown) => {
              const date = new Date((o as { created_at: string }).created_at);
              return date >= yesterday && date < today;
            })
            .reduce(
              (sum: number, o: unknown) =>
                sum + ((o as { total?: number }).total || 0),
              0,
            );

          setStats({
            totalProducts: products.length,
            totalUsers: users.length,
            totalOrders: orders.length,
            totalRevenue: orders.reduce(
              (sum: number, o: unknown) =>
                sum + ((o as { total?: number }).total || 0),
              0,
            ),
            productsChange: 0, // Cannot calculate without historical data
            usersChange:
              yesterdayUsers > 0
                ? ((todayUsers - yesterdayUsers) / yesterdayUsers) * 100
                : 0,
            ordersChange:
              yesterdayOrders > 0
                ? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100
                : 0,
            revenueChange:
              yesterdayRevenue > 0
                ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
                : 0,
            activeUsers: users.filter(
              (u: unknown) => (u as { status: string }).status === "active",
            ).length,
            pendingOrders: orders.filter(
              (o: unknown) => (o as { status: string }).status === "pending",
            ).length,
            lowStockProducts: products.filter(
              (p: unknown) =>
                ((p as { inventory_quantity?: number }).inventory_quantity ||
                  0) < 10,
            ).length,
          });
          fetchedStats = {
            totalProducts: products.length,
            totalUsers: users.length,
            totalOrders: orders.length,
            totalRevenue: orders.reduce(
              (sum: number, o: unknown) =>
                sum + ((o as { total?: number }).total || 0),
              0,
            ),
            productsChange: 0,
            usersChange:
              yesterdayUsers > 0
                ? ((todayUsers - yesterdayUsers) / yesterdayUsers) * 100
                : 0,
            ordersChange:
              yesterdayOrders > 0
                ? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100
                : 0,
            revenueChange:
              yesterdayRevenue > 0
                ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
                : 0,
            activeUsers: users.filter(
              (u: unknown) => (u as { status: string }).status === "active",
            ).length,
            pendingOrders: orders.filter(
              (o: unknown) => (o as { status: string }).status === "pending",
            ).length,
            lowStockProducts: products.filter(
              (p: unknown) =>
                ((p as { inventory_quantity?: number }).inventory_quantity ||
                  0) < 10,
            ).length,
          };
        }

        // Fetch recent activity
        const activityResponse = await fetch("/api/admin/dashboard/activity");
        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          // API возвращает объект с activities, преобразуем в формат компонента
          const activities = activityData.activities || [];
          fetchedActivity = activities.map((act: any) => ({
            id: act.id,
            type: act.type || "system",
            title: act.title || "",
            description: act.description || "",
            time: act.timestamp || act.time || new Date().toISOString(),
            status: act.status === "created" ? "success" : 
                   act.status === "error" ? "error" :
                   act.status === "warning" ? "warning" : "info",
          }));
          setRecentActivity(fetchedActivity);
        }

        // Fetch top products
        const topProductsResponse = await fetch(
          "/api/admin/dashboard/top-products",
        );
        if (topProductsResponse.ok) {
          const topProductsData = await topProductsResponse.json();
          // API возвращает объект с products, преобразуем в формат компонента
          const products = topProductsData.products || [];
          fetchedTopProducts = products.map((p: any) => ({
            id: p.id || p.productId || "",
            name: p.name || p.productName || "",
            sales: p.totalQuantity || p.quantity || 0,
            revenue: p.totalRevenue || p.revenue || 0,
            change: p.change || 0,
            category: p.category || p.categoryName,
          }));
          setTopProducts(fetchedTopProducts);
        }

        // Update cache with fresh data
        cacheRef.current = {
          stats: fetchedStats,
          recentActivity: fetchedActivity,
          topProducts: fetchedTopProducts,
          timestamp: now,
        };
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch dashboard data",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { stats, recentActivity, topProducts, isLoading, error };
};

// Main component
export default function AdminDashboardPage() {
  const { stats, recentActivity, topProducts, isLoading, error } =
    useDashboard();

  const quickActions: QuickAction[] = [
    {
      title: "Добавить товар",
      description: "Создать новый товар",
      href: "/admin/catalog/products/new",
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "Новый пользователь",
      description: "Добавить пользователя",
      href: "/admin/users/new",
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: "Аналитика",
      description: "Просмотр отчетов",
      href: "/admin/analytics",
      icon: BarChart3,
      color: "bg-purple-500",
    },
    {
      title: "Настройки",
      description: "Конфигурация",
      href: "/admin/settings",
      icon: Activity,
      color: "bg-orange-500",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
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
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse" />
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold text-destructive">
          Ошибка загрузки дашборда
        </h2>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Попробовать снова
        </Button>
      </div>
    );
  }

  return (
    <ContentLayout title="Дашборд">
      <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="Товары"
          value={stats?.totalProducts || 0}
          change={stats?.productsChange || 0}
          icon={Package}
          href="/admin/catalog/products"
        />
        <StatCard
          title="Пользователи"
          value={stats?.totalUsers || 0}
          change={stats?.usersChange || 0}
          icon={Users}
          href="/admin/users"
        />
        <StatCard
          title="Заказы"
          value={stats?.totalOrders || 0}
          change={stats?.ordersChange || 0}
          icon={ShoppingCart}
          href="/admin/orders"
        />
        <StatCard
          title="Выручка"
          value={stats?.totalRevenue || 0}
          change={stats?.revenueChange || 0}
          icon={DollarSign}
          suffix=" ₸"
          href="/admin/analytics"
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          {/* Revenue Chart */}
          <RevenueChart days={30} />

          {/* Orders Chart */}
          <OrdersChart days={30} />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
              <CardDescription>
                Часто используемые функции администратора
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {quickActions.map((action, index) => (
                <QuickActionCard key={index} action={action} />
              ))}
            </CardContent>
          </Card>

          {/* Top Products */}
          {topProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Топ товары</CardTitle>
                <CardDescription>
                  Самые продаваемые товары за последние 30 дней
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-8 text-center">
                      <span className="text-lg font-bold text-muted-foreground">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{product.name}</h4>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {product.revenue.toLocaleString()} ₸
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.sales} продаж
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center space-x-2">
                        <Progress
                          value={
                            (product.sales / (topProducts[0]?.sales || 1)) * 100
                          }
                          className="flex-1"
                        />
                        <Badge
                          variant={
                            product.change >= 0 ? "default" : "destructive"
                          }
                          className="text-xs"
                        >
                          {product.change >= 0 ? "+" : ""}
                          {product.change}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Right Column */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle>Состояние системы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Активные пользователи
                </span>
                <Badge variant="default">{stats?.activeUsers || 0}</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Заказы в обработке</span>
                <Badge variant="secondary">{stats?.pendingOrders || 0}</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Мало на складе</span>
                <Badge
                  variant={
                    (stats?.lowStockProducts || 0) > 0
                      ? "destructive"
                      : "default"
                  }
                >
                  {stats?.lowStockProducts || 0}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Последняя активность</CardTitle>
              <CardDescription>Недавние события в системе</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Activity className="mx-auto h-8 w-8 mb-2" />
                  <p className="text-sm">Нет недавней активности</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
    </ContentLayout>
  );
}
