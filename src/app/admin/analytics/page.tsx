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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingBag,
  Package,
  Eye,
  Calendar,
  Download,
  RefreshCw,
  Activity,
  Target,
  Globe,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Типы для аналитики
interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    change: number;
    trend: "up" | "down";
  };
  orders: {
    current: number;
    previous: number;
    change: number;
    trend: "up" | "down";
  };
  customers: {
    current: number;
    previous: number;
    change: number;
    trend: "up" | "down";
  };
  averageOrder: {
    current: number;
    previous: number;
    change: number;
    trend: "up" | "down";
  };
  conversionRate: {
    current: number;
    previous: number;
    change: number;
    trend: "up" | "down";
  };
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
    change: number;
  }>;
  salesByCategory: Array<{
    category: string;
    sales: number;
    percentage: number;
  }>;
  recentVisitors: {
    current: number;
    change: number;
    trend: "up" | "down";
  };
}

interface ChartDataPoint {
  date: string;
  revenue: number;
  orders: number;
  visitors: number;
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
    },
  },
};

// Компонент метрики
const MetricCard = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  suffix = "",
  prefix = "",
}: {
  title: string;
  value: number;
  change: number;
  trend: "up" | "down";
  icon: any;
  suffix?: string;
  prefix?: string;
}) => {
  const isPositive = change >= 0;
  const TrendIcon = trend === "up" ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {prefix}
          {value.toLocaleString()}
          {suffix}
        </div>
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
          <span className="text-muted-foreground ml-1">за период</span>
        </div>
      </CardContent>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-accent/50" />
    </Card>
  );
};

// Простой компонент графика (заглушка)
const SimpleChart = ({
  data,
  title,
  color = "primary",
}: {
  data: ChartDataPoint[];
  title: string;
  color?: string;
}) => {
  const maxValue = Math.max(...data.map((d) => d.revenue));

  return (
    <div className="space-y-4">
      <h4 className="font-medium">{title}</h4>
      <div className="flex items-end space-x-2 h-32">
        {data.map((point, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className={cn(
                "w-full rounded-t-sm transition-all duration-300 hover:opacity-80",
                color === "primary" ? "bg-primary" : "bg-accent",
              )}
              style={{
                height: `${(point.revenue / maxValue) * 100}%`,
                minHeight: "4px",
              }}
            />
            <span className="text-xs text-muted-foreground mt-1 transform -rotate-45 origin-left">
              {new Date(point.date).toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("7d");
  const [loading, setLoading] = useState(false);

  // Моковые данные аналитики
  const [analyticsData] = useState<AnalyticsData>({
    revenue: {
      current: 2450000,
      previous: 2100000,
      change: 16.7,
      trend: "up",
    },
    orders: {
      current: 156,
      previous: 132,
      change: 18.2,
      trend: "up",
    },
    customers: {
      current: 89,
      previous: 76,
      change: 17.1,
      trend: "up",
    },
    averageOrder: {
      current: 15705,
      previous: 15909,
      change: -1.3,
      trend: "down",
    },
    conversionRate: {
      current: 3.2,
      previous: 2.8,
      change: 14.3,
      trend: "up",
    },
    topProducts: [
      {
        id: "1",
        name: "iPhone 15 Pro",
        sales: 45,
        revenue: 1575000,
        change: 25.3,
      },
      {
        id: "2",
        name: "Samsung Galaxy S24",
        sales: 32,
        revenue: 960000,
        change: 12.1,
      },
      {
        id: "3",
        name: "MacBook Pro M3",
        sales: 18,
        revenue: 810000,
        change: -5.2,
      },
      { id: "4", name: "iPad Air", sales: 28, revenue: 560000, change: 8.7 },
    ],
    salesByCategory: [
      { category: "Смартфоны", sales: 85, percentage: 54.5 },
      { category: "Ноутбуки", sales: 32, percentage: 20.5 },
      { category: "Планшеты", sales: 28, percentage: 17.9 },
      { category: "Аксессуары", sales: 11, percentage: 7.1 },
    ],
    recentVisitors: {
      current: 2847,
      change: 23.4,
      trend: "up",
    },
  });

  // Моковые данные для графика
  const [chartData] = useState<ChartDataPoint[]>([
    { date: "2024-01-08", revenue: 125000, orders: 8, visitors: 245 },
    { date: "2024-01-09", revenue: 145000, orders: 12, visitors: 312 },
    { date: "2024-01-10", revenue: 110000, orders: 6, visitors: 198 },
    { date: "2024-01-11", revenue: 180000, orders: 15, visitors: 387 },
    { date: "2024-01-12", revenue: 165000, orders: 11, visitors: 356 },
    { date: "2024-01-13", revenue: 195000, orders: 18, visitors: 421 },
    { date: "2024-01-14", revenue: 220000, orders: 22, visitors: 478 },
  ]);

  const handleRefresh = () => {
    setLoading(true);
    // Симуляция загрузки данных
    setTimeout(() => setLoading(false), 1000);
  };

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
            Аналитика и отчеты
          </h1>
          <p className="text-muted-foreground">
            Детальная статистика и аналитика продаж вашего магазина
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Сегодня</SelectItem>
              <SelectItem value="7d">7 дней</SelectItem>
              <SelectItem value="30d">30 дней</SelectItem>
              <SelectItem value="90d">90 дней</SelectItem>
              <SelectItem value="1y">Год</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Экспорт
          </Button>
          <Button size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw
              className={cn("mr-2 h-4 w-4", loading && "animate-spin")}
            />
            Обновить
          </Button>
        </div>
      </motion.div>

      {/* Основные метрики */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <MetricCard
            title="Выручка"
            value={analyticsData.revenue.current}
            change={analyticsData.revenue.change}
            trend={analyticsData.revenue.trend}
            icon={DollarSign}
            suffix=" ₸"
          />
          <MetricCard
            title="Заказы"
            value={analyticsData.orders.current}
            change={analyticsData.orders.change}
            trend={analyticsData.orders.trend}
            icon={ShoppingBag}
          />
          <MetricCard
            title="Клиенты"
            value={analyticsData.customers.current}
            change={analyticsData.customers.change}
            trend={analyticsData.customers.trend}
            icon={Users}
          />
          <MetricCard
            title="Средний чек"
            value={analyticsData.averageOrder.current}
            change={analyticsData.averageOrder.change}
            trend={analyticsData.averageOrder.trend}
            icon={Target}
            suffix=" ₸"
          />
          <MetricCard
            title="Конверсия"
            value={analyticsData.conversionRate.current}
            change={analyticsData.conversionRate.change}
            trend={analyticsData.conversionRate.trend}
            icon={Percent}
            suffix="%"
          />
        </div>
      </motion.div>

      {/* Детальная аналитика */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="sales">Продажи</TabsTrigger>
            <TabsTrigger value="customers">Клиенты</TabsTrigger>
            <TabsTrigger value="products">Товары</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* График выручки */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Динамика выручки
                  </CardTitle>
                  <CardDescription>
                    Выручка за последние {period === "7d" ? "7 дней" : period}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SimpleChart
                    data={chartData}
                    title="Выручка по дням"
                    color="primary"
                  />
                </CardContent>
              </Card>

              {/* Топ товары */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Топ товары
                  </CardTitle>
                  <CardDescription>
                    Самые продаваемые товары за период
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analyticsData.topProducts.map((product, index) => (
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
                        <div className="flex items-center text-xs">
                          {product.change >= 0 ? (
                            <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                          ) : (
                            <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                          )}
                          <span
                            className={cn(
                              "font-medium",
                              product.change >= 0
                                ? "text-green-500"
                                : "text-red-500",
                            )}
                          >
                            {Math.abs(product.change)}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Дополнительная статистика */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="mr-2 h-5 w-5" />
                    Посетители
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData.recentVisitors.current.toLocaleString()}
                  </div>
                  <div className="flex items-center text-xs mt-1">
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                    <span className="font-medium text-green-500">
                      +{analyticsData.recentVisitors.change}%
                    </span>
                    <span className="text-muted-foreground ml-1">
                      за период
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Продажи по категориям</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analyticsData.salesByCategory.map((category, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{category.category}</span>
                        <span className="font-medium">
                          {category.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <motion.div
                          className="bg-primary h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${category.percentage}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5" />
                    Активность
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Пиковые часы</span>
                    <Badge variant="outline">14:00 - 16:00</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Среднее время на сайте</span>
                    <Badge variant="outline">4:32 мин</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Отказы</span>
                    <Badge variant="outline">23.4%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Повторные визиты</span>
                    <Badge variant="outline">31.2%</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Другие вкладки можно добавить позже */}
          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle>Детальная статистика продаж</CardTitle>
                <CardDescription>
                  Подробная информация о продажах и заказах
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Здесь будет детальная аналитика продаж...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>Аналитика клиентов</CardTitle>
                <CardDescription>
                  Статистика по клиентской базе и поведению покупателей
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Здесь будет аналитика клиентов...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Аналитика товаров</CardTitle>
                <CardDescription>
                  Статистика по товарам, остаткам и популярности
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Здесь будет аналитика товаров...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
