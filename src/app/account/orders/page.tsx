"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AccountOrdersPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchUser() {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      if (!ignore) {
        setUser(data?.user || null);
        setLoading(false);
      }
    }
    fetchUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });
    return () => {
      ignore = true;
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!user) {
    return <div>Пожалуйста, войдите в аккаунт</div>;
  }

  return <div>Мои заказы</div>;
}
