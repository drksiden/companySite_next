import { ContentLayout } from "@/components/admin-panel/content-layout";
import { WarehouseManagerClient } from "@/components/admin/WarehouseManagerClient";
import { createServerClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export default async function WarehousePage() {
  const supabase = await createServerClient();

  // Проверка авторизации
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Проверка роли
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "super_admin", "manager"].includes(profile.role)) {
    redirect("/admin");
  }

  return (
    <ContentLayout title="Управление складом">
      <div className="container mx-auto py-6">
        <WarehouseManagerClient />
      </div>
    </ContentLayout>
  );
}

