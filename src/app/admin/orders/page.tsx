"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { memo } from "react";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useOrders, Order } from "@/hooks/admin/useOrders";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  DataTable,
  DataTableColumnHeader,
  DataTableRowActions,
  DataTableSkeleton,
} from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import { ContentLayout } from "@/components/admin-panel/content-layout";

// Status utilities
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
      return <AlertCircle className="h-3 w-3" />;
    case "shipped":
      return <Truck className="h-3 w-3" />;
    case "delivered":
      return <CheckCircle className="h-3 w-3" />;
    case "cancelled":
      return <XCircle className="h-3 w-3" />;
    default:
      return null;
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

const getPaymentStatusColor = (status: Order["payment_status"]) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "failed":
      return "bg-red-100 text-red-800 border-red-200";
    case "refunded":
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getPaymentStatusLabel = (status: Order["payment_status"]) => {
  switch (status) {
    case "paid":
      return "Оплачено";
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

// Optimized Stat Card Component with memo
const StatCard = memo(
  ({
    title,
    value,
    change,
    icon: Icon,
    href,
  }: {
    title: string;
    value: number;
    change: number;
    icon: React.ComponentType<any>;
    href?: string;
  }) => {
    const isPositive = change >= 0;

    const content = (
      <Card className="hover:shadow-sm transition-shadow duration-150">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold">{value.toLocaleString()}</p>
                <Badge
                  variant={isPositive ? "default" : "destructive"}
                  className="text-xs"
                >
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {isPositive ? "+" : ""}
                  {change}%
                </Badge>
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
  },
);

StatCard.displayName = "StatCard";

// Main component
export default function OrdersPage() {
  const {
    orders,
    stats,
    isLoading,
    error,
    updateOrderStatus,
    deleteOrder,
    refetch,
  } = useOrders();
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);

  // Define columns for the data table
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "order_number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Номер заказа" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/admin/orders/${row.original.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.getValue("order_number")}
        </Link>
      ),
    },
    {
      accessorKey: "customer_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Клиент" />
      ),
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium">{order.customer_name}</div>
            <div className="text-sm text-muted-foreground flex items-center">
              <Mail className="mr-1 h-3 w-3" />
              {order.customer_email}
            </div>
            <div className="text-sm text-muted-foreground flex items-center">
              <Phone className="mr-1 h-3 w-3" />
              {order.customer_phone}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Статус" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as Order["status"];
        return (
          <Badge
            variant="outline"
            className={cn("border", getStatusColor(status))}
          >
            {getStatusIcon(status)}
            <span className="ml-1">{getStatusLabel(status)}</span>
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "payment_status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Оплата" />
      ),
      cell: ({ row }) => {
        const paymentStatus = row.getValue(
          "payment_status",
        ) as Order["payment_status"];
        return (
          <Badge
            variant="outline"
            className={cn("border", getPaymentStatusColor(paymentStatus))}
          >
            {getPaymentStatusLabel(paymentStatus)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Сумма" />
      ),
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div>
            <div className="font-medium">{order.total.toLocaleString()} ₸</div>
            <div className="text-sm text-muted-foreground">
              {order.items_count} товар(ов)
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Дата" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return (
          <div className="text-sm">
            <div>{date.toLocaleDateString("ru-RU")}</div>
            <div className="text-muted-foreground">
              {date.toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
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
              onClick: (order) => {
                window.location.href = `/admin/orders/${order.id}`;
              },
              icon: Eye,
            },
            {
              label: "Редактировать",
              onClick: (order) => {
                console.log("Edit order:", order);
              },
              icon: Edit,
            },
            {
              label: "Удалить",
              onClick: async (order) => {
                if (confirm("Вы уверены, что хотите удалить этот заказ?")) {
                  await deleteOrder(order.id);
                }
              },
              icon: Trash2,
              variant: "destructive",
            },
          ]}
          statusActions={[
            {
              label: "Ожидает",
              value: "pending",
              onSelect: async (order, value) => {
                await updateOrderStatus(order.id, value as Order["status"]);
              },
            },
            {
              label: "В обработке",
              value: "processing",
              onSelect: async (order, value) => {
                await updateOrderStatus(order.id, value as Order["status"]);
              },
            },
            {
              label: "Отправлен",
              value: "shipped",
              onSelect: async (order, value) => {
                await updateOrderStatus(order.id, value as Order["status"]);
              },
            },
            {
              label: "Доставлен",
              value: "delivered",
              onSelect: async (order, value) => {
                await updateOrderStatus(order.id, value as Order["status"]);
              },
            },
          ]}
        />
      ),
    },
  ];

  // Handle row selection
  const handleRowSelect = useCallback((selectedRows: Order[]) => {
    setSelectedOrders(selectedRows);
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
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Попробовать снова
          </button>
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
            <DataTableSkeleton columnCount={7} rowCount={10} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ContentLayout title="Заказы">
      <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Всего заказов"
          value={stats?.total || 0}
          change={12.5}
          icon={ShoppingCart}
        />
        <StatCard
          title="Выручка сегодня"
          value={stats?.todayRevenue || 0}
          change={8.2}
          icon={DollarSign}
        />
        <StatCard
          title="Заказов сегодня"
          value={stats?.todayOrders || 0}
          change={15.3}
          icon={Package}
        />
        <StatCard
          title="Активных клиентов"
          value={156}
          change={-2.1}
          icon={Users}
        />
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Заказы</CardTitle>
              <CardDescription>
                Управление заказами интернет-магазина
              </CardDescription>
            </div>
            {selectedOrders.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Выбрано: {selectedOrders.length}
                </span>
                <Button size="sm" variant="outline">
                  Массовые действия
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={orders}
            searchPlaceholder="Поиск по номеру заказа, имени или email..."
            onRowSelect={handleRowSelect}
            enableRowSelection={true}
            enableColumnVisibility={true}
            pageSize={10}
          />
        </CardContent>
      </Card>
    </div>
    </ContentLayout>
  );
}
