"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Settings, ShoppingBag } from "lucide-react"

export default function AccountPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const userName = user?.user_metadata?.name || user?.user_metadata?.full_name;
  const userEmail = user?.email;
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <motion.div
      className="flex items-center justify-center min-h-screen px-4 bg-background"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="w-full max-w-md rounded-2xl shadow-lg border">
        <CardHeader className="text-center">
          <Avatar className="mx-auto w-20 h-20 mb-4">
            <AvatarImage src={avatarUrl || ""} alt={userName || "Avatar"} />
            <AvatarFallback>{userName?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-xl font-bold">{userName || "Пользователь"}</CardTitle>
          <p className="text-sm text-muted-foreground">{userEmail}</p>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4">
          <Link href="/account/settings">
            <Button variant="secondary" className="w-full flex gap-2 items-center">
              <Settings className="h-4 w-4" />
              Настройки профиля
            </Button>
          </Link>

          <Link href="/account/orders">
            <Button variant="secondary" className="w-full flex gap-2 items-center">
              <ShoppingBag className="h-4 w-4" />
              Мои заказы
            </Button>
          </Link>

          <Button variant="destructive" className="w-full" onClick={handleSignOut}>
            Выйти
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
