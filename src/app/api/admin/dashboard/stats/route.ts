import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Check if user is authenticated and is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = yesterday.toISOString();

    // Get this month's date range
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfMonthISO = startOfMonth.toISOString();

    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    const lastMonthISO = lastMonth.toISOString();
    const endOfLastMonthISO = endOfLastMonth.toISOString();

    // Parallel queries for better performance
    const [
      totalOrdersResult,
      totalRevenueResult,
      totalUsersResult,
      totalProductsResult,
      todayOrdersResult,
      yesterdayOrdersResult,
      thisMonthRevenueResult,
      lastMonthRevenueResult,
      pendingOrdersResult,
    ] = await Promise.all([
      // Total orders
      supabase.from("orders").select("*", { count: "exact", head: true }),

      // Total revenue
      supabase.from("orders").select("total").eq("payment_status", "paid"),

      // Total users
      supabase.from("users").select("*", { count: "exact", head: true }),

      // Total products
      supabase.from("products").select("*", { count: "exact", head: true }),

      // Today's orders
      supabase.from("orders").select("total").gte("created_at", todayISO),

      // Yesterday's orders
      supabase
        .from("orders")
        .select("total")
        .gte("created_at", yesterdayISO)
        .lt("created_at", todayISO),

      // This month's revenue
      supabase
        .from("orders")
        .select("total")
        .eq("payment_status", "paid")
        .gte("created_at", startOfMonthISO),

      // Last month's revenue
      supabase
        .from("orders")
        .select("total")
        .eq("payment_status", "paid")
        .gte("created_at", lastMonthISO)
        .lte("created_at", endOfLastMonthISO),

      // Pending orders count
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

    // Calculate stats
    const totalOrders = totalOrdersResult.count || 0;
    const totalRevenue =
      totalRevenueResult.data?.reduce((sum, order) => sum + order.total, 0) ||
      0;
    const totalUsers = totalUsersResult.count || 0;
    const totalProducts = totalProductsResult.count || 0;

    const todayRevenue =
      todayOrdersResult.data?.reduce((sum, order) => sum + order.total, 0) || 0;
    const todayOrdersCount = todayOrdersResult.data?.length || 0;

    const yesterdayRevenue =
      yesterdayOrdersResult.data?.reduce(
        (sum, order) => sum + order.total,
        0,
      ) || 0;
    const yesterdayOrdersCount = yesterdayOrdersResult.data?.length || 0;

    const thisMonthRevenue =
      thisMonthRevenueResult.data?.reduce(
        (sum, order) => sum + order.total,
        0,
      ) || 0;
    const lastMonthRevenue =
      lastMonthRevenueResult.data?.reduce(
        (sum, order) => sum + order.total,
        0,
      ) || 0;

    const pendingOrders = pendingOrdersResult.count || 0;

    // Calculate percentage changes
    const revenueChange =
      yesterdayRevenue > 0
        ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
        : todayRevenue > 0
          ? 100
          : 0;

    const ordersChange =
      yesterdayOrdersCount > 0
        ? ((todayOrdersCount - yesterdayOrdersCount) / yesterdayOrdersCount) *
          100
        : todayOrdersCount > 0
          ? 100
          : 0;

    const monthlyRevenueChange =
      lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : thisMonthRevenue > 0
          ? 100
          : 0;

    const stats = {
      totalOrders,
      totalRevenue,
      totalUsers,
      totalProducts,
      todayRevenue,
      todayOrders: todayOrdersCount,
      pendingOrders,
      changes: {
        revenue: Math.round(revenueChange * 100) / 100,
        orders: Math.round(ordersChange * 100) / 100,
        monthlyRevenue: Math.round(monthlyRevenueChange * 100) / 100,
      },
      periods: {
        today: {
          revenue: todayRevenue,
          orders: todayOrdersCount,
        },
        yesterday: {
          revenue: yesterdayRevenue,
          orders: yesterdayOrdersCount,
        },
        thisMonth: {
          revenue: thisMonthRevenue,
        },
        lastMonth: {
          revenue: lastMonthRevenue,
        },
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error in dashboard stats API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
