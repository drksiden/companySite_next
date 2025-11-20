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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");
    const type = searchParams.get("type") || "revenue"; // revenue, orders, users

    // Calculate date range
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Generate array of dates
    const dates: Date[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }

    if (type === "revenue") {
      // Get revenue data by day
      const { data: orders, error } = await supabase
        .from("orders")
        .select("total, created_at, payment_status")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .eq("payment_status", "paid");

      if (error) {
        console.error("Error fetching revenue data:", error);
        return NextResponse.json(
          { error: "Failed to fetch revenue data" },
          { status: 500 }
        );
      }

      // Aggregate by day
      const revenueByDay = new Map<string, number>();
      dates.forEach((date) => {
        const dateStr = date.toISOString().split("T")[0];
        revenueByDay.set(dateStr, 0);
      });

      orders?.forEach((order) => {
        const orderDate = new Date(order.created_at);
        const dateStr = orderDate.toISOString().split("T")[0];
        const current = revenueByDay.get(dateStr) || 0;
        revenueByDay.set(dateStr, current + (order.total || 0));
      });

      const chartData = dates.map((date) => {
        const dateStr = date.toISOString().split("T")[0];
        return {
          date: dateStr,
          revenue: revenueByDay.get(dateStr) || 0,
          label: date.toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "short",
          }),
        };
      });

      return NextResponse.json({ data: chartData, type: "revenue" });
    }

    if (type === "orders") {
      // Get orders data by day
      const { data: orders, error } = await supabase
        .from("orders")
        .select("id, created_at, status")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (error) {
        console.error("Error fetching orders data:", error);
        return NextResponse.json(
          { error: "Failed to fetch orders data" },
          { status: 500 }
        );
      }

      // Aggregate by day
      const ordersByDay = new Map<string, number>();
      dates.forEach((date) => {
        const dateStr = date.toISOString().split("T")[0];
        ordersByDay.set(dateStr, 0);
      });

      orders?.forEach((order) => {
        const orderDate = new Date(order.created_at);
        const dateStr = orderDate.toISOString().split("T")[0];
        const current = ordersByDay.get(dateStr) || 0;
        ordersByDay.set(dateStr, current + 1);
      });

      const chartData = dates.map((date) => {
        const dateStr = date.toISOString().split("T")[0];
        return {
          date: dateStr,
          orders: ordersByDay.get(dateStr) || 0,
          label: date.toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "short",
          }),
        };
      });

      return NextResponse.json({ data: chartData, type: "orders" });
    }

    if (type === "users") {
      // Get users data by day
      const { data: users, error } = await supabase
        .from("user_profiles")
        .select("id, created_at")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (error) {
        console.error("Error fetching users data:", error);
        return NextResponse.json(
          { error: "Failed to fetch users data" },
          { status: 500 }
        );
      }

      // Aggregate by day
      const usersByDay = new Map<string, number>();
      dates.forEach((date) => {
        const dateStr = date.toISOString().split("T")[0];
        usersByDay.set(dateStr, 0);
      });

      users?.forEach((user) => {
        const userDate = new Date(user.created_at);
        const dateStr = userDate.toISOString().split("T")[0];
        const current = usersByDay.get(dateStr) || 0;
        usersByDay.set(dateStr, current + 1);
      });

      const chartData = dates.map((date) => {
        const dateStr = date.toISOString().split("T")[0];
        return {
          date: dateStr,
          users: usersByDay.get(dateStr) || 0,
          label: date.toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "short",
          }),
        };
      });

      return NextResponse.json({ data: chartData, type: "users" });
    }

    return NextResponse.json(
      { error: "Invalid type parameter" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in chart data API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

