import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createServerClient();

    // Check if user is authenticated and is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: orderId } = await params;

    // Fetch order with related data
    const { data: order, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          product_id,
          quantity,
          price,
          total,
          products (
            id,
            name,
            slug,
            thumbnail,
            images
          )
        )
      `,
      )
      .eq("id", orderId)
      .single();

    if (error) {
      console.error("Error fetching order:", error);
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch order" },
        { status: 500 },
      );
    }

    // Transform order items to match frontend format
    const transformedOrder = {
      ...order,
      items: (order.order_items || []).map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        productName: item.products?.name || "Unknown Product",
        productImage: item.products?.thumbnail || item.products?.images?.[0],
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      })),
    };

    return NextResponse.json({ order: transformedOrder });
  } catch (error) {
    console.error("Error in order detail API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}


