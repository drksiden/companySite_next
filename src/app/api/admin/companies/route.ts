// src/app/api/admin/companies/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createServerClient } from "@/lib/supabaseServer";
import { Company } from "@/lib/services/admin/user"; // Assuming Company type is defined or imported

// GET /api/admin/companies - List all companies
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: companies, error } = await createAdminClient()
      .from("companies") // Assuming public.companies is accessible
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching companies:", error);
      return NextResponse.json(
        { message: "Error fetching companies", error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(companies as Company[], { status: 200 });
  } catch (error: any) {
    console.error("Unexpected error in GET /api/admin/companies:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 },
    );
  }
}
