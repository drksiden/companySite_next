"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  Eye,
  Palette,
  MousePointer,
  Smartphone,
  Monitor,
  Tablet,
  Code,
  Settings,
  Users,
  BarChart3,
  Package,
  ShoppingBag,
  FileText,
  Shield,
  Bell,
  Home,
  ChevronRight,
  Star,
  Heart,
  Layers,
} from "lucide-react";
import { Sidebar } from "./Sidebar";

const showcaseFeatures = [
  {
    id: "animations",
    title: "Плавные анимации",
    description: "Современные Framer Motion анимации с stagger эффектами",
    icon: Zap,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "glassmorphism",
    title: "Glassmorphism эффекты",
    description: "Полупрозрачные элементы с backdrop-blur",
    icon: Layers,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "responsive",
    title: "Responsive дизайн",
    description: "Адаптивная панель для всех устройств",
    icon: Smartphone,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
];

const devicePresets = {
  mobile: { width: 375, height: 667, name: "Mobile" },
  tablet: { width: 768, height: 1024, name: "Tablet" },
  desktop: { width: 1200, height: 800, name: "Desktop" },
};

export function SidebarShowcase() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDevice, setCurrentDevice] =
    useState<keyof typeof devicePresets>("desktop");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const demoSteps = [
    { action: "collapse", label: "Сворачивание панели" },
    { action: "expand", label: "Разворачивание панели" },
    { action: "mobile", label: "Мобильная версия" },
    { action: "desktop", label: "Десктопная версия" },
  ];

  const resetDemo = () => {
    setIsPlaying(false);
    setSidebarOpen(true);
    setSidebarCollapsed(false);
    setCurrentDevice("desktop");
  };

  const deviceIcons = {
    mobile: Smartphone,
    tablet: Tablet,
    desktop: Monitor,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="p-3 bg-gradient-to-br from-primary to-accent rounded-2xl"
            >
              <Sparkles className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Улучшенная боковая панель
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Демонстрация современного дизайна, плавных анимаций и улучшенного
            пользовательского опыта
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {showcaseFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${feature.bgColor}`}>
                        <IconComponent className={`h-5 w-5 ${feature.color}`} />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Интерактивная демонстрация</CardTitle>
                  <CardDescription>
                    Попробуйте различные настройки и посмотрите, как работает
                    боковая панель
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={isPlaying ? "secondary" : "default"}
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Пауза
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Демо
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={resetDemo}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Сброс
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">Предпросмотр</TabsTrigger>
                  <TabsTrigger value="settings">Настройки</TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {Object.entries(devicePresets).map(([key, device]) => {
                        const IconComponent =
                          deviceIcons[key as keyof typeof deviceIcons];
                        return (
                          <Button
                            key={key}
                            variant={
                              currentDevice === key ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              setCurrentDevice(
                                key as keyof typeof devicePresets,
                              )
                            }
                          >
                            <IconComponent className="h-4 w-4 mr-2" />
                            {device.name}
                          </Button>
                        );
                      })}
                    </div>
                    <Badge variant="secondary">
                      {devicePresets[currentDevice].width} ×{" "}
                      {devicePresets[currentDevice].height}
                    </Badge>
                  </div>

                  <div className="border rounded-lg overflow-hidden bg-muted/20">
                    <div
                      className="mx-auto bg-background transition-all duration-500 relative"
                      style={{
                        width: Math.min(
                          devicePresets[currentDevice].width,
                          1000,
                        ),
                        height: Math.min(
                          devicePresets[currentDevice].height,
                          600,
                        ),
                      }}
                    >
                      <div className="h-full flex">
                        <Sidebar
                          sidebarOpen={sidebarOpen}
                          setSidebarOpen={setSidebarOpen}
                        />
                        <div className="flex-1 p-6 bg-muted/10">
                          <div className="space-y-4">
                            <h2 className="text-2xl font-bold">
                              Контент страницы
                            </h2>
                            <p className="text-muted-foreground">
                              Это демонстрационная область контента. Боковая
                              панель слева показывает различные состояния и
                              анимации.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                              <Card className="p-4">
                                <h3 className="font-semibold mb-2">
                                  Статистика
                                </h3>
                                <div className="text-2xl font-bold text-primary">
                                  1,234
                                </div>
                              </Card>
                              <Card className="p-4">
                                <h3 className="font-semibold mb-2">
                                  Пользователи
                                </h3>
                                <div className="text-2xl font-bold text-green-500">
                                  856
                                </div>
                              </Card>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Состояние панели
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="sidebar-open">Панель открыта</Label>
                          <Switch
                            id="sidebar-open"
                            checked={sidebarOpen}
                            onCheckedChange={setSidebarOpen}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="sidebar-collapsed">
                            Свернутая панель
                          </Label>
                          <Switch
                            id="sidebar-collapsed"
                            checked={sidebarCollapsed}
                            onCheckedChange={setSidebarCollapsed}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
