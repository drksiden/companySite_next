"use client"

import { useEffect, useState } from "react"
import { sdk } from "@/lib/sdk"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [company, setCompany] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    sdk.store.customer
      .retrieve()
      .then(({ customer }) => {
        setFirstName(customer.first_name || "")
        setLastName(customer.last_name || "")
        setCompany(customer.company_name || "")
        setPhone(customer.phone || "")
      })
      .catch(() => {
        toast.error("Не удалось загрузить профиль")
      })
      .finally(() => setLoading(false))
  }, [])

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    try {
      await sdk.store.customer.update({
        first_name: firstName,
        last_name: lastName,
        company_name: company,
        phone,
      })
      toast.success("Профиль обновлён")
    } catch {
      toast.error("Ошибка при обновлении")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Редактирование профиля</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleEdit}>
            <Input
              placeholder="Имя"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              placeholder="Фамилия"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <Input
              placeholder="Компания"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <Input
              placeholder="Телефон"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Сохранить
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
