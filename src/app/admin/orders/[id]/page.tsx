"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Truck,
  MoreHorizontal,
  Edit,
  Printer,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Типы для заказа
interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  total: number;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  notes?: string;
  trackingNumber?: string;
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
const getStatusColor = (status: OrderDetails["status"]) => {
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

const getStatusIcon = (status: OrderDetails["status"]) => {
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

const getStatusLabel = (status: OrderDetails["status"]) => {
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

const getPaymentStatusColor = (status: OrderDetails["paymentStatus"]) => {
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

const getPaymentStatusLabel = (status: OrderDetails["paymentStatus"]) => {
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

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Моковые данные заказа
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        // Симуляция загрузки данных
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockOrder: OrderDetails = {
          id: orderId,
          orderNumber: "ORD-2024-001",
          status: "processing",
          paymentStatus: "paid",
          paymentMethod: "Банковская карта",
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-01-15T14:20:00Z",
          customer: {
            id: "1",
            name: "Иван Петров",
            email: "ivan@example.com",
            phone: "+7 777 123 4567",
          },
          shippingAddress: {
            street: "ул. Абая 150, кв. 25",
            city: "Алматы",
            postalCode: "050000",
            country: "Казахстан",
          },
          items: [
            {
              id: "1",
              productId: "p1",
              productName: "iPhone 15 Pro 256GB",
              quantity: 1,
              price: 450000,
              total: 450000,
            },
            {
              id: "2",
              productId: "p2",
              productName: "AirPods Pro (2nd generation)",
              quantity: 2,
              price: 125000,
              total: 250000,
            },
          ],
          subtotal: 700000,
          shippingCost: 5000,
          tax: 0,
          total: 705000,
          notes: "Доставить до 18:00",
          trackingNumber: "TR123456789KZ",
        };

        setOrder(mockOrder);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleStatusUpdate = async (newStatus: OrderDetails["status"]) => {
    if (!order) return;

    setUpdatingStatus(true);
    try {
      // Здесь будет логика обновления статуса
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Загрузка заказа...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">Заказ не найден</h2>
        <p className="text-muted-foreground mb-4">
          Заказ с ID {orderId} не существует или был удален
        </p>
        <Button asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Вернуться к заказам
          </Link>
        </Button>
      </div>
    );
  }

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
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Заказ {order.orderNumber}
            </h1>
            <p className="text-muted-foreground">
              Создан{" "}
              {new Date(order.createdAt).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Печать
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Действия</DropdownMenuLabel>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Редактировать
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Отменить заказ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          {/* Статус заказа */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Статус заказа</span>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="outline"
                      className={cn("border", getStatusColor(order.status))}
                    >
                      {getStatusIcon(order.status)}
                      <span className="ml-1">
                        {getStatusLabel(order.status)}
                      </span>
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "border",
                        getPaymentStatusColor(order.paymentStatus),
                      )}
                    >
                      {getPaymentStatusLabel(order.paymentStatus)}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Select
                    value={order.status}
                    onValueChange={handleStatusUpdate}
                    disabled={updatingStatus}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Ожидает</SelectItem>
                      <SelectItem value="processing">В обработке</SelectItem>
                      <SelectItem value="shipped">Отправлен</SelectItem>
                      <SelectItem value="delivered">Доставлен</SelectItem>
                      <SelectItem value="cancelled">Отменен</SelectItem>
                    </SelectContent>
                  </Select>
                  {updatingStatus && (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  )}
                </div>
                {order.trackingNumber && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center text-sm text-blue-800">
                      <Truck className="mr-2 h-4 w-4" />
                      <span>
                        Трек-номер: <strong>{order.trackingNumber}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Товары в заказе */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Товары в заказе</CardTitle>
                <CardDescription>
                  {order.items.length} товар(ов) на сумму{" "}
                  {order.subtotal.toLocaleString()} ₸
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Товар</TableHead>
                      <TableHead className="text-center">Количество</TableHead>
                      <TableHead className="text-right">Цена</TableHead>
                      <TableHead className="text-right">Итого</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                              <Package className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {item.productName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ID: {item.productId}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{item.quantity}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.price.toLocaleString()} ₸
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.total.toLocaleString()} ₸
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>

                <Separator className="my-4" />

                {/* Итоги */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Стоимость товаров:</span>
                    <span>{order.subtotal.toLocaleString()} ₸</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Доставка:</span>
                    <span>{order.shippingCost.toLocaleString()} ₸</span>
                  </div>
                  {order.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Налог:</span>
                      <span>{order.tax.toLocaleString()} ₸</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Итого:</span>
                    <span>{order.total.toLocaleString()} ₸</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Информация о клиенте */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Клиент
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="font-medium">{order.customer.name}</div>
                  <div className="text-sm text-muted-foreground">
                    ID: {order.customer.id}
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{order.customer.email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{order.customer.phone}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/admin/users/${order.customer.id}`}>
                    Профиль клиента
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Адрес доставки */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Адрес доставки
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <div>{order.shippingAddress.street}</div>
                  <div>
                    {order.shippingAddress.city},{" "}
                    {order.shippingAddress.postalCode}
                  </div>
                  <div>{order.shippingAddress.country}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Информация об оплате */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Оплата
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Способ оплаты
                  </div>
                  <div className="font-medium">{order.paymentMethod}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Статус оплаты
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "border",
                      getPaymentStatusColor(order.paymentStatus),
                    )}
                  >
                    {getPaymentStatusLabel(order.paymentStatus)}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Сумма</div>
                  <div className="font-medium text-lg">
                    {order.total.toLocaleString()} ₸
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Заметки */}
          {order.notes && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Примечания</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{order.notes}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Даты */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  История
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">Создан</div>
                  <div className="text-sm">
                    {new Date(order.createdAt).toLocaleString("ru-RU")}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Обновлен</div>
                  <div className="text-sm">
                    {new Date(order.updatedAt).toLocaleString("ru-RU")}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
