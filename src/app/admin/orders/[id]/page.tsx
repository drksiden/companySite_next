"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import { ContentLayout } from "@/components/admin-panel/content-layout";

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

// Fetch order details
async function fetchOrderDetails(orderId: string): Promise<OrderDetails> {
  const response = await fetch(`/api/admin/orders/${orderId}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch order");
  }
  const result = await response.json();
  const order = result.order;

  // Transform to OrderDetails format
  const shippingAddress = typeof order.shipping_address === 'string' 
    ? JSON.parse(order.shipping_address || '{}')
    : order.shipping_address || {};

  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    paymentStatus: order.payment_status,
    paymentMethod: order.payment_method || "Не указан",
    createdAt: order.created_at,
    updatedAt: order.updated_at || order.created_at,
    customer: {
      id: order.user_id || "",
      name: order.customer_name || "Не указано",
      email: order.customer_email || "Не указано",
      phone: order.customer_phone || "Не указано",
    },
    shippingAddress: {
      street: shippingAddress.street || shippingAddress.address || "",
      city: shippingAddress.city || "",
      postalCode: shippingAddress.postal_code || shippingAddress.postalCode || "",
      country: shippingAddress.country || "Казахстан",
    },
    items: order.items || [],
    subtotal: order.subtotal || order.total || 0,
    shippingCost: order.shipping_cost || 0,
    tax: order.tax || 0,
    total: order.total || 0,
    notes: order.notes || "",
    trackingNumber: order.tracking_number || "",
  };
}

// Update order status
async function updateOrderStatus(
  orderId: string,
  status: OrderDetails["status"],
): Promise<OrderDetails> {
  const response = await fetch("/api/admin/orders", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: orderId, status }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to update order status");
  }

  const result = await response.json();
  // Refetch order details after update
  return fetchOrderDetails(orderId);
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const orderId = params.id as string;

  const { data: order, isLoading: loading, error } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrderDetails(orderId),
    enabled: !!orderId,
  });

  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderDetails["status"] }) =>
      updateOrderStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ["order", id] });

      // Snapshot previous value
      const previousOrder = queryClient.getQueryData<OrderDetails>(["order", id]);

      // Optimistically update cache
      queryClient.setQueryData<OrderDetails>(["order", id], (old) =>
        old ? { ...old, status } : old,
      );

      return { previousOrder };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousOrder) {
        queryClient.setQueryData(["order", variables.id], context.previousOrder);
      }
    },
    onSuccess: (data) => {
      // Update cache with server data
      queryClient.setQueryData(["order", orderId], data);
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const handleStatusUpdate = async (newStatus: OrderDetails["status"]) => {
    if (!order) return;

    try {
      await updateStatusMut.mutateAsync({ id: order.id, status: newStatus });
      toast.success("Статус заказа обновлен");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Ошибка при обновлении статуса",
      );
    }
  };

  if (loading) {
    return (
      <ContentLayout title="Детали заказа">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Загрузка заказа...</span>
          </div>
        </div>
      </ContentLayout>
    );
  }

  if (error || !order) {
    return (
      <ContentLayout title="Детали заказа">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Заказ не найден</h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error
              ? error.message
              : `Заказ с ID ${orderId} не существует или был удален`}
          </p>
          <Button asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться к заказам
            </Link>
          </Button>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Заказы">
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
                    disabled={updateStatusMut.isPending}
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
                  {updateStatusMut.isPending && (
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
    </ContentLayout>
  );
}
