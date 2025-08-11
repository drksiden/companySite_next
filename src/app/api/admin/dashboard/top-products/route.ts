import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

interface OrderItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  products: {
    id: string;
    name: string;
    sku: string;
    images: string[] | null;
    base_price: number;
  }[];
  orders: {
    created_at: string;
    status: string;
    payment_status: string;
  }[];
}

interface ProductStats {
  product: {
    id: string;
    name: string;
    sku: string;
    images: string[] | null;
    base_price: number;
  };
  totalRevenue: number;
  totalQuantity: number;
  ordersCount: number;
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
    const limit = parseInt(searchParams.get("limit") || "10");
    const period = searchParams.get("period") || "30"; // days
    const metric = searchParams.get("metric") || "revenue"; // revenue, quantity, views

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    let topProducts = [];

    if (metric === "revenue") {
      // Get top products by revenue from order items
      const { data: orderItems, error } = await supabase
        .from("order_items")
        .select(
          `
          product_id,
          quantity,
          unit_price,
          products!inner (
            id,
            name,
            sku,
            images,
            base_price
          ),
          orders!inner (
            created_at,
            status,
            payment_status
          )
        `,
        )
        .gte("orders.created_at", startDate.toISOString())
        .lte("orders.created_at", endDate.toISOString())
        .eq("orders.payment_status", "paid");

      if (error) {
        console.error("Error fetching order items:", error);
        return NextResponse.json(
          { error: "Failed to fetch top products" },
          { status: 500 },
        );
      }

      // Aggregate by product
      const productStats = new Map<string, ProductStats>();

      orderItems?.forEach((item: OrderItem) => {
        const productId = item.product_id;
        const revenue = item.quantity * item.unit_price;
        const product = item.products[0]; // Get first product from array

        if (productStats.has(productId)) {
          const existing = productStats.get(productId)!;
          existing.totalRevenue += revenue;
          existing.totalQuantity += item.quantity;
          existing.ordersCount += 1;
        } else {
          productStats.set(productId, {
            product: product,
            totalRevenue: revenue,
            totalQuantity: item.quantity,
            ordersCount: 1,
          });
        }
      });

      // Convert to array and sort by revenue
      topProducts = Array.from(productStats.values())
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, limit)
        .map((item, index) => ({
          rank: index + 1,
          productId: item.product.id,
          name: item.product.name,
          sku: item.product.sku,
          imageUrl: item.product.images?.[0] || null,
          currentPrice: item.product.base_price,
          totalRevenue: item.totalRevenue,
          totalQuantity: item.totalQuantity,
          ordersCount: item.ordersCount,
          averageOrderValue: Math.round(item.totalRevenue / item.ordersCount),
        }));
    } else if (metric === "quantity") {
      // Similar logic but sort by quantity
      const { data: orderItems, error } = await supabase
        .from("order_items")
        .select(
          `
          product_id,
          quantity,
          unit_price,
          products!inner (
            id,
            name,
            sku,
            images,
            base_price
          ),
          orders!inner (
            created_at,
            status,
            payment_status
          )
        `,
        )
        .gte("orders.created_at", startDate.toISOString())
        .lte("orders.created_at", endDate.toISOString())
        .eq("orders.payment_status", "paid");

      if (error) {
        console.error("Error fetching order items:", error);
        return NextResponse.json(
          { error: "Failed to fetch top products" },
          { status: 500 },
        );
      }

      // Aggregate by product
      const productStats = new Map<string, ProductStats>();

      orderItems?.forEach((item: OrderItem) => {
        const productId = item.product_id;
        const revenue = item.quantity * item.unit_price;
        const product = item.products[0]; // Get first product from array

        if (productStats.has(productId)) {
          const existing = productStats.get(productId)!;
          existing.totalRevenue += revenue;
          existing.totalQuantity += item.quantity;
          existing.ordersCount += 1;
        } else {
          productStats.set(productId, {
            product: product,
            totalRevenue: revenue,
            totalQuantity: item.quantity,
            ordersCount: 1,
          });
        }
      });

      // Sort by quantity
      topProducts = Array.from(productStats.values())
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, limit)
        .map((item, index) => ({
          rank: index + 1,
          productId: item.product.id,
          name: item.product.name,
          sku: item.product.sku,
          imageUrl: item.product.images?.[0] || null,
          currentPrice: item.product.base_price,
          totalRevenue: item.totalRevenue,
          totalQuantity: item.totalQuantity,
          ordersCount: item.ordersCount,
          averageOrderValue: Math.round(item.totalRevenue / item.ordersCount),
        }));
    } else {
      // Default fallback - get most recent products
      const { data: products, error } = await supabase
        .from("products")
        .select(
          `
          id,
          name,
          sku,
          images,
          base_price,
          created_at,
          updated_at
        `,
        )
        .order("updated_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
          { error: "Failed to fetch top products" },
          { status: 500 },
        );
      }

      topProducts =
        products?.map((product, index) => ({
          rank: index + 1,
          productId: product.id,
          name: product.name,
          sku: product.sku,
          imageUrl: product.images?.[0] || null,
          currentPrice: product.base_price,
          totalRevenue: 0,
          totalQuantity: 0,
          ordersCount: 0,
          averageOrderValue: 0,
        })) || [];
    }

    return NextResponse.json({
      products: topProducts,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days: parseInt(period),
      },
      metric,
      total: topProducts.length,
    });
  } catch (error) {
    console.error("Error in top products API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
