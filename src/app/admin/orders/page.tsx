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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingBag,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Типы для заказов
interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  itemsCount: number;
  createdAt: string;
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
}

interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  todayRevenue: number;
  todayOrders: number;
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

// Функции для работы со статусами
const getStatusColor = (status: Order["status"]) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "processing":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "shipped":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "delivered":
      return "bg-green-100 text-green-800 border-green-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status: Order["status"]) => {
  switch (status) {
    case "pending":
      return <Clock className="h-3 w-3" />;
    case "processing":
      return <Package className="h-3 w-3" />;
    case "shipped":
      return <Truck className="h-3 w-3" />;
    case "delivered":
      return <CheckCircle className="h-3 w-3" />;
    case "cancelled":
      return <AlertCircle className="h-3 w-3" />;
    default:
      return <Clock className="h-3 w-3" />;
  }
};

const getStatusLabel = (status: Order["status"]) => {
  switch (status) {
    case "pending":
      return "Ожидает";
    case "processing":
      return "В обработке";
    case "shipped":
      return "Отправлен";
    case "delivered":
      return "Доставлен";
    case "cancelled":
      return "Отменен";
    default:
      return status;
  }
};

const getPaymentStatusColor = (status: Order["paymentStatus"]) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "failed":
      return "bg-red-100 text-red-800 border-red-200";
    case "refunded":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getPaymentStatusLabel = (status: Order["paymentStatus"]) => {
  switch (status) {
    case "paid":
      return "Оплачен";
    case "pending":
      return "Ожидает";
    case "failed":
      return "Ошибка";
    case "refunded":
      return "Возврат";
    default:
      return status;
  }
};

// Компонент статистической карточки
const StatCard = ({
  title,
  value,
  icon: Icon,
  color = "text-primary",
  bgColor = "bg-primary/10",
}: {
  title: string;
  value: string | number;
  icon: any;
  color?: string;
  bgColor?: string;
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center">
        <div className={cn("p-2 rounded-lg", bgColor)}>
          <Icon className={cn("h-4 w-4", color)} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "1",
      orderNumber: "ORD-2024-001",
      customerName: "Иван Петров",
      customerEmail: "ivan@example.com",
      customerPhone: "+7 777 123 4567",
      status: "processing",
      total: 125000,
      itemsCount: 3,
      createdAt: "2024-01-15T10:30:00Z",
      shippingAddress: "г. Алматы, ул. Абая 150",
      paymentMethod: "Банковская карта",
      paymentStatus: "paid",
    },
    {
      id: "2",
      orderNumber: "ORD-2024-002",
      customerName: "Анна Смирнова",
      customerEmail: "anna@example.com",
      customerPhone: "+7 777 234 5678",
      status: "shipped",
      total: 85000,
      itemsCount: 2,
      createdAt: "2024-01-14T15:45:00Z",
      shippingAddress: "г. Астана, пр. Республики 25",
      paymentMethod: "Наличные",
      paymentStatus: "pending",
    },
    {
      id: "3",
      orderNumber: "ORD-2024-003",
      customerName: "Михаил Козлов",
      customerEmail: "mikhail@example.com",
      customerPhone: "+7 777 345 6789",
      status: "delivered",
      total: 95500,
      itemsCount: 1,
      createdAt: "2024-01-13T09:15:00Z",
      shippingAddress: "г. Шымкент, ул. Тауке хана 45",
      paymentMethod: "Банковская карта",
      paymentStatus: "paid",
    },
  ]);

  const [stats] = useState<OrderStats>({
    total: 3,
    pending: 0,
    processing: 1,
    shipped: 1,
    delivered: 1,
    cancelled: 0,
    todayRevenue: 125000,
    todayOrders: 1,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  // Фильтрация заказов
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesPayment =
      paymentFilter === "all" || order.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

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
            Управление заказами
          </h1>
          <p className="text-muted-foreground">
            Просматривайте и управляйте всеми заказами в вашем магазине
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Экспорт
          </Button>
          <Button size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Обновить
          </Button>
        </div>
      </motion.div>

      {/* Статистика */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Всего заказов"
            value={stats.total}
            icon={ShoppingBag}
          />
          <StatCard
            title="В обработке"
            value={stats.processing}
            icon={Package}
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
          <StatCard
            title="Выручка сегодня"
            value={`${stats.todayRevenue.toLocaleString()} ₸`}
            icon={DollarSign}
            color="text-green-600"
            bgColor="bg-green-100"
          />
          <StatCard
            title="Заказов сегодня"
            value={stats.todayOrders}
            icon={Calendar}
            color="text-purple-600"
            bgColor="bg-purple-100"
          />
        </div>
      </motion.div>

      {/* Основной контент */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">Все заказы</TabsTrigger>
              <TabsTrigger value="pending">Ожидают</TabsTrigger>
              <TabsTrigger value="processing">В обработке</TabsTrigger>
              <TabsTrigger value="shipped">Отправлены</TabsTrigger>
              <TabsTrigger value="delivered">Доставлены</TabsTrigger>
            </TabsList>

            {/* Фильтры и поиск */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск заказов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="pending">Ожидают</SelectItem>
                  <SelectItem value="processing">В обработке</SelectItem>
                  <SelectItem value="shipped">Отправлены</SelectItem>
                  <SelectItem value="delivered">Доставлены</SelectItem>
                  <SelectItem value="cancelled">Отменены</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Оплата" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="paid">Оплачено</SelectItem>
                  <SelectItem value="pending">Ожидает</SelectItem>
                  <SelectItem value="failed">Ошибка</SelectItem>
                  <SelectItem value="refunded">Возврат</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Список заказов</CardTitle>
                <CardDescription>
                  Найдено {filteredOrders.length} заказов
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Номер заказа</TableHead>
                      <TableHead>Клиент</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Оплата</TableHead>
                      <TableHead>Сумма</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order, index) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-primary hover:underline"
                          >
                            {order.orderNumber}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {order.customerName}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Mail className="mr-1 h-3 w-3" />
                              {order.customerEmail}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Phone className="mr-1 h-3 w-3" />
                              {order.customerPhone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "border",
                              getStatusColor(order.status),
                            )}
                          >
                            {getStatusIcon(order.status)}
                            <span className="ml-1">
                              {getStatusLabel(order.status)}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "border",
                              getPaymentStatusColor(order.paymentStatus),
                            )}
                          >
                            {getPaymentStatusLabel(order.paymentStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {order.total.toLocaleString()} ₸
                          <div className="text-sm text-muted-foreground">
                            {order.itemsCount} товар(ов)
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              {new Date(order.createdAt).toLocaleDateString(
                                "ru-RU",
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleTimeString(
                                "ru-RU",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </div>
                          </div>
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
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/orders/${order.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Просмотр
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Редактировать
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Удалить
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Дополнительные вкладки можно добавить здесь */}
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
