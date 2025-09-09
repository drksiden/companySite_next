import { redirect } from "next/navigation";

import { createServerClient } from "@/lib/supabaseServer";

export default async function PrivatePage() {
  const supabase = await createServerClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  return <p>Hello {data.user.email}</p>;
}
