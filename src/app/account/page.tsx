"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Settings, ShoppingBag } from "lucide-react"

export default function AccountPage() {
  const { data: session } = useSession()
  const user = session?.user

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
            <AvatarImage src={user?.image || ""} alt={user?.name || "Avatar"} />
            <AvatarFallback>{user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-xl font-bold">{user?.name || "Пользователь"}</CardTitle>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
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

          <Button variant="destructive" className="w-full" onClick={() => signOut({ callbackUrl: "/" })}>
            Выйти
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
