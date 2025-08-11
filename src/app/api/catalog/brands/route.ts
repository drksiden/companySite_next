import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: brands, error } = await supabase
      .from("brands")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch brands" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: brands || [],
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
