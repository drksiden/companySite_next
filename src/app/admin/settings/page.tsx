"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Globe,
  Mail,
  Bell,
  Shield,
  Database,
  CreditCard,
  Truck,
  Users,
  Store,
  Save,
  RefreshCw,
  Upload,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AdminSettingsPanel } from "@/hooks/useAdminSettings";

// Типы для настроек
interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;
  contactPhone: string;
  timezone: string;
  currency: string;
  language: string;
  maintenanceMode: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  orderNotifications: boolean;
  stockNotifications: boolean;
  userRegistrationNotifications: boolean;
  systemNotifications: boolean;
}

interface PaymentSettings {
  enableCreditCards: boolean;
  enableCash: boolean;
  enableBankTransfer: boolean;
  enableKaspi: boolean;
  testMode: boolean;
}

interface ShippingSettings {
  freeShippingThreshold: number;
  standardShippingCost: number;
  expressShippingCost: number;
  estimatedDeliveryDays: number;
}

// Анимационные варианты
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

// Компонент секции настроек
const SettingsSection = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    {children}
  </div>
);

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);

  // Состояния настроек
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    siteName: "Мой интернет-магазин",
    siteDescription: "Лучшие товары по доступным ценам",
    siteUrl: "https://mystore.kz",
    contactEmail: "info@mystore.kz",
    contactPhone: "+7 777 123 4567",
    timezone: "Asia/Almaty",
    currency: "KZT",
    language: "ru",
    maintenanceMode: false,
  });

  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      emailNotifications: true,
      orderNotifications: true,
      stockNotifications: true,
      userRegistrationNotifications: false,
      systemNotifications: true,
    });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    enableCreditCards: true,
    enableCash: true,
    enableBankTransfer: false,
    enableKaspi: true,
    testMode: true,
  });

  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    freeShippingThreshold: 50000,
    standardShippingCost: 2000,
    expressShippingCost: 5000,
    estimatedDeliveryDays: 3,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      // Здесь будет логика сохранения настроек
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Настройки сохранены", {
        description: "Все изменения успешно применены",
      });
    } catch (error) {
      toast.error("Ошибка", {
        description: "Не удалось сохранить настройки",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Заголовок */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Настройки системы
          </h1>
          <p className="text-muted-foreground">
            Управляйте общими настройками вашего интернет-магазина
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Экспорт
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Сохранить
          </Button>
        </div>
      </motion.div>

      {/* Основной контент */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">Общие</TabsTrigger>
            <TabsTrigger value="notifications">Уведомления</TabsTrigger>
            <TabsTrigger value="payments">Оплата</TabsTrigger>
            <TabsTrigger value="shipping">Доставка</TabsTrigger>
            <TabsTrigger value="security">Безопасность</TabsTrigger>
            <TabsTrigger value="admin">Админка</TabsTrigger>
          </TabsList>

          {/* Общие настройки */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="mr-2 h-5 w-5" />
                  Информация о магазине
                </CardTitle>
                <CardDescription>
                  Основная информация о вашем интернет-магазине
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <SettingsSection
                  title="Основные данные"
                  description="Название и описание вашего магазина"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Название сайта</Label>
                      <Input
                        id="siteName"
                        value={generalSettings.siteName}
                        onChange={(e) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            siteName: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siteUrl">URL сайта</Label>
                      <Input
                        id="siteUrl"
                        value={generalSettings.siteUrl}
                        onChange={(e) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            siteUrl: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Описание</Label>
                    <Textarea
                      id="siteDescription"
                      value={generalSettings.siteDescription}
                      onChange={(e) =>
                        setGeneralSettings((prev) => ({
                          ...prev,
                          siteDescription: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>
                </SettingsSection>

                <Separator />

                <SettingsSection
                  title="Контактная информация"
                  description="Контактные данные для связи с клиентами"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={generalSettings.contactEmail}
                        onChange={(e) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            contactEmail: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Телефон</Label>
                      <Input
                        id="contactPhone"
                        value={generalSettings.contactPhone}
                        onChange={(e) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            contactPhone: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </SettingsSection>

                <Separator />

                <SettingsSection
                  title="Локализация"
                  description="Настройки региона и языка"
                >
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Часовой пояс</Label>
                      <Select
                        value={generalSettings.timezone}
                        onValueChange={(value) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            timezone: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Almaty">
                            Алматы (UTC+6)
                          </SelectItem>
                          <SelectItem value="Asia/Astana">
                            Астана (UTC+6)
                          </SelectItem>
                          <SelectItem value="Europe/Moscow">
                            Москва (UTC+3)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Валюта</Label>
                      <Select
                        value={generalSettings.currency}
                        onValueChange={(value) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            currency: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KZT">Тенге (₸)</SelectItem>
                          <SelectItem value="USD">Доллар ($)</SelectItem>
                          <SelectItem value="EUR">Евро (€)</SelectItem>
                          <SelectItem value="RUB">Рубль (₽)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Язык</Label>
                      <Select
                        value={generalSettings.language}
                        onValueChange={(value) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            language: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ru">Русский</SelectItem>
                          <SelectItem value="kz">Казахский</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </SettingsSection>

                <Separator />

                <SettingsSection
                  title="Режим обслуживания"
                  description="Временно отключить сайт для обновлений"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Режим обслуживания</Label>
                      <p className="text-sm text-muted-foreground">
                        Сайт будет недоступен для обычных пользователей
                      </p>
                    </div>
                    <Switch
                      checked={generalSettings.maintenanceMode}
                      onCheckedChange={(checked) =>
                        setGeneralSettings((prev) => ({
                          ...prev,
                          maintenanceMode: checked,
                        }))
                      }
                    />
                  </div>
                  {generalSettings.maintenanceMode && (
                    <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                      <span className="text-sm text-yellow-800">
                        Сайт находится в режиме обслуживания
                      </span>
                    </div>
                  )}
                </SettingsSection>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Уведомления */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Настройки уведомлений
                </CardTitle>
                <CardDescription>
                  Управление уведомлениями и оповещениями
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <SettingsSection
                  title="Email уведомления"
                  description="Настройка отправки уведомлений по электронной почте"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email уведомления</Label>
                        <p className="text-sm text-muted-foreground">
                          Общее включение/отключение email уведомлений
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            emailNotifications: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Уведомления о заказах</Label>
                        <p className="text-sm text-muted-foreground">
                          Уведомления о новых заказах и их статусах
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.orderNotifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            orderNotifications: checked,
                          }))
                        }
                        disabled={!notificationSettings.emailNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Уведомления об остатках</Label>
                        <p className="text-sm text-muted-foreground">
                          Предупреждения о низких остатках товаров
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.stockNotifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            stockNotifications: checked,
                          }))
                        }
                        disabled={!notificationSettings.emailNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Регистрация пользователей</Label>
                        <p className="text-sm text-muted-foreground">
                          Уведомления о регистрации новых пользователей
                        </p>
                      </div>
                      <Switch
                        checked={
                          notificationSettings.userRegistrationNotifications
                        }
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            userRegistrationNotifications: checked,
                          }))
                        }
                        disabled={!notificationSettings.emailNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Системные уведомления</Label>
                        <p className="text-sm text-muted-foreground">
                          Уведомления об ошибках и системных событиях
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.systemNotifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            systemNotifications: checked,
                          }))
                        }
                        disabled={!notificationSettings.emailNotifications}
                      />
                    </div>
                  </div>
                </SettingsSection>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Оплата */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Способы оплаты
                </CardTitle>
                <CardDescription>
                  Настройка доступных способов оплаты
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <SettingsSection
                  title="Доступные способы оплаты"
                  description="Выберите способы оплаты, доступные покупателям"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <div>
                          <Label>Банковские карты</Label>
                          <p className="text-sm text-muted-foreground">
                            Visa, MasterCard
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={paymentSettings.enableCreditCards}
                        onCheckedChange={(checked) =>
                          setPaymentSettings((prev) => ({
                            ...prev,
                            enableCreditCards: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Database className="h-5 w-5 text-primary" />
                        <div>
                          <Label>Kaspi Pay</Label>
                          <p className="text-sm text-muted-foreground">
                            Оплата через Kaspi
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={paymentSettings.enableKaspi}
                        onCheckedChange={(checked) =>
                          setPaymentSettings((prev) => ({
                            ...prev,
                            enableKaspi: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <Label>Наличные</Label>
                          <p className="text-sm text-muted-foreground">
                            Оплата при доставке
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={paymentSettings.enableCash}
                        onCheckedChange={(checked) =>
                          setPaymentSettings((prev) => ({
                            ...prev,
                            enableCash: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-primary" />
                        <div>
                          <Label>Банковский перевод</Label>
                          <p className="text-sm text-muted-foreground">
                            Перевод на счет
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={paymentSettings.enableBankTransfer}
                        onCheckedChange={(checked) =>
                          setPaymentSettings((prev) => ({
                            ...prev,
                            enableBankTransfer: checked,
                          }))
                        }
                      />
                    </div>
                  </div>
                </SettingsSection>

                <Separator />

                <SettingsSection
                  title="Режим тестирования"
                  description="Настройки для тестирования платежей"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Тестовый режим</Label>
                      <p className="text-sm text-muted-foreground">
                        Платежи не будут обрабатываться реально
                      </p>
                    </div>
                    <Switch
                      checked={paymentSettings.testMode}
                      onCheckedChange={(checked) =>
                        setPaymentSettings((prev) => ({
                          ...prev,
                          testMode: checked,
                        }))
                      }
                    />
                  </div>
                  {paymentSettings.testMode && (
                    <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Info className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm text-blue-800">
                        Включен тестовый режим платежей
                      </span>
                    </div>
                  )}
                </SettingsSection>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Доставка */}
          <TabsContent value="shipping" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="mr-2 h-5 w-5" />
                  Настройки доставки
                </CardTitle>
                <CardDescription>
                  Управление способами и стоимостью доставки
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <SettingsSection
                  title="Стоимость доставки"
                  description="Настройка цен на различные виды доставки"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="freeShipping">
                        Бесплатная доставка от (₸)
                      </Label>
                      <Input
                        id="freeShipping"
                        type="number"
                        value={shippingSettings.freeShippingThreshold}
                        onChange={(e) =>
                          setShippingSettings((prev) => ({
                            ...prev,
                            freeShippingThreshold: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedDays">
                        Время доставки (дни)
                      </Label>
                      <Input
                        id="estimatedDays"
                        type="number"
                        value={shippingSettings.estimatedDeliveryDays}
                        onChange={(e) =>
                          setShippingSettings((prev) => ({
                            ...prev,
                            estimatedDeliveryDays: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="standardShipping">
                        Обычная доставка (₸)
                      </Label>
                      <Input
                        id="standardShipping"
                        type="number"
                        value={shippingSettings.standardShippingCost}
                        onChange={(e) =>
                          setShippingSettings((prev) => ({
                            ...prev,
                            standardShippingCost: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expressShipping">
                        Экспресс доставка (₸)
                      </Label>
                      <Input
                        id="expressShipping"
                        type="number"
                        value={shippingSettings.expressShippingCost}
                        onChange={(e) =>
                          setShippingSettings((prev) => ({
                            ...prev,
                            expressShippingCost: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>
                </SettingsSection>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Безопасность */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Настройки безопасности
                </CardTitle>
                <CardDescription>
                  Управление безопасностью и доступом к системе
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Настройки безопасности
                  </h3>
                  <p className="text-muted-foreground">
                    Функции безопасности будут доступны в следующих обновлениях
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Настройки админки */}
          <TabsContent value="admin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Настройки админки
                </CardTitle>
                <CardDescription>
                  Управление автообновлением и кэшированием данных в
                  административной панели
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminSettingsPanel />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
