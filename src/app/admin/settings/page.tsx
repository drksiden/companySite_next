"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AdminSettingsPanel } from "@/hooks/useAdminSettings";
import { ContentLayout } from "@/components/admin-panel/content-layout";

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

interface DisplaySettings {
  show_stock_status: boolean;
  show_quantity: boolean;
  show_made_to_order: boolean;
  made_to_order_text: string;
  in_stock_text: string;
  out_of_stock_text: string;
  low_stock_threshold: number;
  show_low_stock_warning: boolean;
  low_stock_text: string;
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

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams?.get("tab") || "general";
  const [saving, setSaving] = useState(false);
  const [loadingDisplaySettings, setLoadingDisplaySettings] = useState(true);

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

  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    show_stock_status: true,
    show_quantity: true,
    show_made_to_order: true,
    made_to_order_text: "На заказ",
    in_stock_text: "В наличии",
    out_of_stock_text: "Нет в наличии",
    low_stock_threshold: 5,
    show_low_stock_warning: true,
    low_stock_text: "Осталось мало",
  });

  // Загружаем все настройки при монтировании
  useEffect(() => {
    const loadAllSettings = async () => {
      try {
        // Загружаем настройки отображения
        const displayResponse = await fetch("/api/admin/settings/display");
        if (displayResponse.ok) {
          const data = await displayResponse.json();
          if (data.success && data.settings) {
            setDisplaySettings(data.settings);
          }
        }

        // Загружаем общие настройки
        const generalResponse = await fetch("/api/admin/settings/general");
        if (generalResponse.ok) {
          const data = await generalResponse.json();
          if (data.success && data.settings) {
            setGeneralSettings(data.settings);
          }
        }

        // Загружаем настройки уведомлений
        const notificationsResponse = await fetch("/api/admin/settings/display?key=notifications");
        if (notificationsResponse.ok) {
          const data = await notificationsResponse.json();
          if (data.success && data.settings) {
            setNotificationSettings(data.settings);
          }
        }

        // Загружаем настройки оплаты
        const paymentsResponse = await fetch("/api/admin/settings/display?key=payments");
        if (paymentsResponse.ok) {
          const data = await paymentsResponse.json();
          if (data.success && data.settings) {
            setPaymentSettings(data.settings);
          }
        }

        // Загружаем настройки доставки
        const shippingResponse = await fetch("/api/admin/settings/display?key=shipping");
        if (shippingResponse.ok) {
          const data = await shippingResponse.json();
          if (data.success && data.settings) {
            setShippingSettings(data.settings);
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoadingDisplaySettings(false);
      }
    };

    loadAllSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const errors: string[] = [];

      // Сохраняем общие настройки
      const generalResponse = await fetch("/api/admin/settings/general", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings: generalSettings }),
      });

      if (!generalResponse.ok) {
        errors.push("Общие настройки");
      }

      // Сохраняем настройки отображения
      const displayResponse = await fetch("/api/admin/settings/display", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings: displaySettings }),
      });

      if (!displayResponse.ok) {
        errors.push("Настройки отображения");
      }

      // Сохраняем настройки уведомлений (используем display_settings таблицу)
      const notificationsResponse = await fetch("/api/admin/settings/display", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          settings: notificationSettings,
          setting_key: "notifications" 
        }),
      });

      if (!notificationsResponse.ok) {
        errors.push("Настройки уведомлений");
      }

      // Сохраняем настройки оплаты
      const paymentsResponse = await fetch("/api/admin/settings/display", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          settings: paymentSettings,
          setting_key: "payments" 
        }),
      });

      if (!paymentsResponse.ok) {
        errors.push("Настройки оплаты");
      }

      // Сохраняем настройки доставки
      const shippingResponse = await fetch("/api/admin/settings/display", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          settings: shippingSettings,
          setting_key: "shipping" 
        }),
      });

      if (!shippingResponse.ok) {
        errors.push("Настройки доставки");
      }

      if (errors.length > 0) {
        throw new Error(`Не удалось сохранить: ${errors.join(", ")}`);
      }

      toast.success("Настройки сохранены", {
        description: "Все изменения успешно применены",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Ошибка", {
        description: error instanceof Error ? error.message : "Не удалось сохранить настройки",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ContentLayout title="Настройки">
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
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="general">Общие</TabsTrigger>
            <TabsTrigger value="display">Отображение</TabsTrigger>
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

          {/* Настройки отображения */}
          <TabsContent value="display" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="mr-2 h-5 w-5" />
                  Настройки отображения товаров
                </CardTitle>
                <CardDescription>
                  Управление отображением статусов наличия и информации о товарах
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingDisplaySettings ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
                    <p className="text-muted-foreground">Загрузка настроек...</p>
                  </div>
                ) : (
                  <>
                    <SettingsSection
                      title="Отображение статусов"
                      description="Настройте, какие статусы и информация отображаются для товаров"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Показывать статус наличия</Label>
                            <p className="text-sm text-muted-foreground">
                              Отображать информацию о наличии товара
                            </p>
                          </div>
                          <Switch
                            checked={displaySettings.show_stock_status}
                            onCheckedChange={(checked) =>
                              setDisplaySettings((prev) => ({
                                ...prev,
                                show_stock_status: checked,
                              }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Показывать количество</Label>
                            <p className="text-sm text-muted-foreground">
                              Отображать количество товара в наличии
                            </p>
                          </div>
                          <Switch
                            checked={displaySettings.show_quantity}
                            onCheckedChange={(checked) =>
                              setDisplaySettings((prev) => ({
                                ...prev,
                                show_quantity: checked,
                              }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Показывать статус "На заказ"</Label>
                            <p className="text-sm text-muted-foreground">
                              Отображать товары со статусом "На заказ"
                            </p>
                          </div>
                          <Switch
                            checked={displaySettings.show_made_to_order}
                            onCheckedChange={(checked) =>
                              setDisplaySettings((prev) => ({
                                ...prev,
                                show_made_to_order: checked,
                              }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Предупреждение о низком остатке</Label>
                            <p className="text-sm text-muted-foreground">
                              Показывать предупреждение, когда товара осталось мало
                            </p>
                          </div>
                          <Switch
                            checked={displaySettings.show_low_stock_warning}
                            onCheckedChange={(checked) =>
                              setDisplaySettings((prev) => ({
                                ...prev,
                                show_low_stock_warning: checked,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </SettingsSection>

                    <Separator />

                    <SettingsSection
                      title="Тексты статусов"
                      description="Настройте тексты, которые отображаются для различных статусов товаров"
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="in_stock_text">Текст "В наличии"</Label>
                          <Input
                            id="in_stock_text"
                            value={displaySettings.in_stock_text}
                            onChange={(e) =>
                              setDisplaySettings((prev) => ({
                                ...prev,
                                in_stock_text: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="out_of_stock_text">Текст "Нет в наличии"</Label>
                          <Input
                            id="out_of_stock_text"
                            value={displaySettings.out_of_stock_text}
                            onChange={(e) =>
                              setDisplaySettings((prev) => ({
                                ...prev,
                                out_of_stock_text: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="made_to_order_text">Текст "На заказ"</Label>
                          <Input
                            id="made_to_order_text"
                            value={displaySettings.made_to_order_text}
                            onChange={(e) =>
                              setDisplaySettings((prev) => ({
                                ...prev,
                                made_to_order_text: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="low_stock_text">Текст "Осталось мало"</Label>
                          <Input
                            id="low_stock_text"
                            value={displaySettings.low_stock_text}
                            onChange={(e) =>
                              setDisplaySettings((prev) => ({
                                ...prev,
                                low_stock_text: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </SettingsSection>

                    <Separator />

                    <SettingsSection
                      title="Пороги и лимиты"
                      description="Настройте пороговые значения для предупреждений"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="low_stock_threshold">
                          Порог низкого остатка (шт.)
                        </Label>
                        <Input
                          id="low_stock_threshold"
                          type="number"
                          min="0"
                          value={displaySettings.low_stock_threshold}
                          onChange={(e) =>
                            setDisplaySettings((prev) => ({
                              ...prev,
                              low_stock_threshold: parseInt(e.target.value) || 0,
                            }))
                          }
                        />
                        <p className="text-sm text-muted-foreground">
                          При остатке ниже этого значения будет показываться предупреждение
                        </p>
                      </div>
                    </SettingsSection>
                  </>
                )}
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
    </ContentLayout>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <ContentLayout title="Настройки">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
        </div>
      </ContentLayout>
    }>
      <SettingsPageContent />
    </Suspense>
  );
}
