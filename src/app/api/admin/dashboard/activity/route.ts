import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  status: string;
  metadata: Record<string, any>;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated and is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const days = parseInt(searchParams.get("days") || "7");

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get recent orders for activity
    const { data: recentOrders, error: ordersError } = await supabase
      .from("orders")
      .select(
        `
        id,
        order_number,
        customer_name,
        status,
        total,
        created_at,
        updated_at
      `,
      )
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false })
      .limit(limit);

    if (ordersError) {
      console.error("Error fetching recent orders:", ordersError);
    }

    // Get recent user registrations
    const { data: recentUsers, error: usersError } = await supabase
      .from("user_profiles")
      .select(
        `
        id,
        email,
        first_name,
        last_name,
        created_at
      `,
      )
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false })
      .limit(10);

    if (usersError) {
      console.error("Error fetching recent users:", usersError);
    }

    // Get recent product updates (if you have audit log or updated_at field)
    const { data: recentProducts, error: productsError } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        sku,
        base_price,
        created_at,
        updated_at
      `,
      )
      .gte("updated_at", startDate.toISOString())
      .order("updated_at", { ascending: false })
      .limit(10);

    if (productsError) {
      console.error("Error fetching recent products:", productsError);
    }

    // Combine all activities into a unified feed
    const activities: ActivityItem[] = [];

    // Add order activities
    if (recentOrders) {
      recentOrders.forEach((order) => {
        activities.push({
          id: `order-${order.id}`,
          type: "order",
          title: `Новый заказ ${order.order_number}`,
          description: `${order.customer_name} оформил заказ на сумму ${order.total.toLocaleString()} ₸`,
          timestamp: order.created_at,
          status: order.status,
          metadata: {
            orderId: order.id,
            orderNumber: order.order_number,
            customerName: order.customer_name,
            total: order.total,
          },
        });
      });
    }

    // Add user registration activities
    if (recentUsers) {
      recentUsers.forEach((user) => {
        const fullName =
          user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.first_name || user.last_name;

        activities.push({
          id: `user-${user.id}`,
          type: "user",
          title: "Новая регистрация",
          description: `${fullName || user.email} зарегистрировался в системе`,
          timestamp: user.created_at,
          status: "active",
          metadata: {
            userId: user.id,
            userEmail: user.email,
            userFullName: fullName,
          },
        });
      });
    }

    // Add product activities
    if (recentProducts) {
      recentProducts.forEach((product) => {
        const isNew = new Date(product.created_at) >= startDate;
        activities.push({
          id: `product-${product.id}`,
          type: "product",
          title: isNew ? "Новый товар" : "Обновление товара",
          description: `${product.name} (${product.sku}) - ${product.base_price.toLocaleString()} ₸`,
          timestamp: product.updated_at || product.created_at,
          status: isNew ? "created" : "updated",
          metadata: {
            productId: product.id,
            productName: product.name,
            productSku: product.sku,
            productPrice: product.base_price,
            isNew,
          },
        });
      });
    }

    // Sort activities by timestamp (most recent first)
    activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    // Return limited results
    const limitedActivities = activities.slice(0, limit);

    return NextResponse.json({
      activities: limitedActivities,
      total: activities.length,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days,
      },
    });
  } catch (error) {
    console.error("Error in dashboard activity API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
