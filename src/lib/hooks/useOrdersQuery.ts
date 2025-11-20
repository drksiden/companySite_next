// lib/hooks/useOrdersQuery.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Order, OrderStats } from "@/hooks/admin/useOrders";

export interface UseOrdersQueryOptions {
  status?: string;
  paymentStatus?: string;
  limit?: number;
  offset?: number;
}

// Fetch orders
async function fetchOrders(options: UseOrdersQueryOptions = {}) {
  const params = new URLSearchParams();

  if (options.status && options.status !== "all") {
    params.append("status", options.status);
  }

  if (options.paymentStatus && options.paymentStatus !== "all") {
    params.append("payment_status", options.paymentStatus);
  }

  if (options.limit) {
    params.append("limit", options.limit.toString());
  }

  if (options.offset) {
    params.append("offset", options.offset.toString());
  }

  const response = await fetch(`/api/admin/orders?${params.toString()}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch orders");
  }
  const result = await response.json();
  return result.orders || [];
}

// Fetch order stats
async function fetchOrderStats(): Promise<OrderStats> {
  const response = await fetch("/api/admin/dashboard/stats");
  if (!response.ok) {
    throw new Error("Failed to fetch order stats");
  }
  const data = await response.json();
  return {
    total: data.totalOrders || 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    todayRevenue: data.todayRevenue || 0,
    todayOrders: data.todayOrders || 0,
  };
}

// Update order status
async function updateOrderStatus(
  orderId: string,
  status: Order["status"],
): Promise<Order> {
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
  return result.order;
}

// Delete order
async function deleteOrder(orderId: string): Promise<void> {
  const response = await fetch(`/api/admin/orders?id=${orderId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to delete order");
  }
}

export function useOrdersQuery(options: UseOrdersQueryOptions = {}) {
  return useQuery<Order[]>({
    queryKey: ["orders", options],
    queryFn: () => fetchOrders(options),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useOrderStatsQuery() {
  return useQuery<OrderStats>({
    queryKey: ["order-stats"],
    queryFn: fetchOrderStats,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Order["status"] }) =>
      updateOrderStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ["orders"] });

      // Snapshot previous value
      const previousOrders = queryClient.getQueryData<Order[]>(["orders"]);

      // Optimistically update cache
      queryClient.setQueryData<Order[]>(["orders"], (old = []) =>
        old.map((order) => (order.id === id ? { ...order, status } : order)),
      );

      return { previousOrders };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousOrders) {
        queryClient.setQueryData(["orders"], context.previousOrders);
      }
    },
    onSuccess: (data) => {
      // Update cache with server data
      queryClient.setQueryData<Order[]>(["orders"], (old = []) =>
        old.map((order) => (order.id === data.id ? data : order)),
      );
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteOrder,
    onMutate: async (orderId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ["orders"] });

      // Snapshot previous value
      const previousOrders = queryClient.getQueryData<Order[]>(["orders"]);

      // Optimistically remove from cache
      queryClient.setQueryData<Order[]>(["orders"], (old = []) =>
        old.filter((order) => order.id !== orderId),
      );

      return { previousOrders };
    },
    onError: (err, orderId, context) => {
      // Rollback on error
      if (context?.previousOrders) {
        queryClient.setQueryData(["orders"], context.previousOrders);
      }
    },
    onSuccess: () => {
      // Invalidate for sync
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-stats"] });
    },
  });
}


