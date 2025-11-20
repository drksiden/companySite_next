"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, ShoppingCart, Users } from "lucide-react";

interface ChartData {
  date: string;
  revenue?: number;
  orders?: number;
  users?: number;
  label: string;
}

const revenueConfig = {
  revenue: {
    label: "Выручка",
    color: "hsl(var(--chart-1))",
  },
} as const;

const ordersConfig = {
  orders: {
    label: "Заказы",
    color: "hsl(var(--chart-2))",
  },
} as const;

const usersConfig = {
  users: {
    label: "Пользователи",
    color: "hsl(var(--chart-3))",
  },
} as const;

export function RevenueChart({ days = 30 }: { days?: number }) {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/admin/dashboard/chart-data?type=revenue&days=${days}`);
        if (!response.ok) throw new Error("Failed to fetch revenue data");
        const result = await response.json();
        setData(result.data || []);
      } catch (error) {
        console.error("Error fetching revenue chart data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [days]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Динамика выручки
          </CardTitle>
          <CardDescription>Выручка за последние {days} дней</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Динамика выручки
        </CardTitle>
        <CardDescription>Выручка за последние {days} дней</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={revenueConfig} className="h-[300px]">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 6)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="revenue"
              type="monotone"
              fill="var(--color-revenue)"
              fillOpacity={0.2}
              stroke="var(--color-revenue)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function OrdersChart({ days = 30 }: { days?: number }) {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/admin/dashboard/chart-data?type=orders&days=${days}`);
        if (!response.ok) throw new Error("Failed to fetch orders data");
        const result = await response.json();
        setData(result.data || []);
      } catch (error) {
        console.error("Error fetching orders chart data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [days]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Динамика заказов
          </CardTitle>
          <CardDescription>Заказы за последние {days} дней</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Динамика заказов
        </CardTitle>
        <CardDescription>Заказы за последние {days} дней</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={ordersConfig} className="h-[300px]">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 6)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="orders"
              fill="var(--color-orders)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function UsersChart({ days = 30 }: { days?: number }) {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/admin/dashboard/chart-data?type=users&days=${days}`);
        if (!response.ok) throw new Error("Failed to fetch users data");
        const result = await response.json();
        setData(result.data || []);
      } catch (error) {
        console.error("Error fetching users chart data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [days]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Регистрации пользователей
          </CardTitle>
          <CardDescription>Новые пользователи за последние {days} дней</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Регистрации пользователей
        </CardTitle>
        <CardDescription>Новые пользователи за последние {days} дней</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={usersConfig} className="h-[300px]">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 6)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="users"
              type="monotone"
              fill="var(--color-users)"
              fillOpacity={0.2}
              stroke="var(--color-users)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

