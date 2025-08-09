"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items_count: number;
  created_at: string;
  shipping_address: string;
  payment_method: string;
  payment_status: "paid" | "pending" | "failed" | "refunded";
  user_id?: string;
}

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  todayRevenue: number;
  todayOrders: number;
}

export interface UseOrdersOptions {
  status?: string;
  paymentStatus?: string;
  limit?: number;
  offset?: number;
}

export function useOrders(options: UseOrdersOptions = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stabilize options to prevent infinite re-renders
  const stableOptions = useMemo(() => options, [options]);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();

      if (stableOptions.status && stableOptions.status !== "all") {
        params.append("status", stableOptions.status);
      }

      if (
        stableOptions.paymentStatus &&
        stableOptions.paymentStatus !== "all"
      ) {
        params.append("payment_status", stableOptions.paymentStatus);
      }

      if (stableOptions.limit) {
        params.append("limit", stableOptions.limit.toString());
      }

      if (stableOptions.offset) {
        params.append("offset", stableOptions.offset.toString());
      }

      const response = await fetch(`/api/admin/orders?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setOrders(result.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [stableOptions]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/dashboard/stats");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const statsData = await response.json();

      setStats({
        total: statsData.totalOrders || 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        todayRevenue: statsData.todayRevenue || 0,
        todayOrders: statsData.todayOrders || 0,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
      // Set empty stats on error
      setStats({
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        todayRevenue: 0,
        todayOrders: 0,
      });
    }
  }, []);

  const updateOrderStatus = useCallback(
    async (orderId: string, status: Order["status"]) => {
      try {
        const response = await fetch("/api/admin/orders", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: orderId, status }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Update local state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status } : order,
          ),
        );

        return { success: true };
      } catch (err) {
        console.error("Error updating order status:", err);
        return {
          success: false,
          error:
            err instanceof Error
              ? err.message
              : "Failed to update order status",
        };
      }
    },
    [],
  );

  const deleteOrder = useCallback(async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders?id=${orderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId),
      );

      return { success: true };
    } catch (err) {
      console.error("Error deleting order:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to delete order",
      };
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [fetchOrders, fetchStats]);

  const refetch = useCallback(() => {
    fetchOrders();
    fetchStats();
  }, [fetchOrders, fetchStats]);

  return {
    orders,
    stats,
    isLoading,
    error,
    updateOrderStatus,
    deleteOrder,
    refetch,
  };
}
