import {
  Tag,
  Users,
  Settings,
  Bookmark,
  SquarePen,
  LayoutGrid,
  LayoutDashboard,
  LucideIcon,
  ShoppingBag,
  BarChart3,
  FileText,
  Palette,
  Folder,
  Package,
  Bell,
  Shield,
  Newspaper,
  MessageSquare,
  Warehouse,
  FileSpreadsheet,
  Eye,
  Globe,
  CreditCard,
  Truck,
  Database
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/admin",
          label: "Главная",
          icon: LayoutDashboard
        }
      ]
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "",
          label: "Каталог",
          icon: Package,
          submenus: [
            {
            href: "/admin/catalog",
            label: "Главная",
            icon: Package,
            },
            {
              href: "/admin/catalog/products",
              label: "Товары",
              icon: ShoppingBag,
            },
            {
              href: "/admin/catalog/categories",
              label: "Категории",
              icon: Folder
            },
            {
              href: "/admin/catalog/brands",
              label: "Бренды",
              icon: Tag
            },
            {
              href: "/admin/catalog/collections",
              label: "Коллекции",
              icon: Palette
            },
            {
              href: "/admin/catalog/bulk-price-update",
              label: "Обновление цен",
              icon: FileSpreadsheet
            }
          ]
        },
      ]
    },
    {
      groupLabel: "",
      menus: [
        { label: "Новости", href: "/admin/news", icon: Newspaper },
        { label: "Склад", href: "/admin/warehouse", icon: Warehouse },
        { label: "Запросы клиентов", href: "/admin/contact-requests", icon: MessageSquare },
        { label: "Пользователи", href: "/admin/users", icon: Users },
      ]
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "",
          label: "Настройки",
          icon: Settings,
          submenus: [
            { label: "Общие", href: "/admin/settings?tab=general", icon: Globe },
            { label: "Отображение", href: "/admin/settings?tab=display", icon: Eye },
            { label: "Уведомления", href: "/admin/settings?tab=notifications", icon: Bell },
            { label: "Оплата", href: "/admin/settings?tab=payments", icon: CreditCard },
            { label: "Доставка", href: "/admin/settings?tab=shipping", icon: Truck },
            { label: "Безопасность", href: "/admin/settings?tab=security", icon: Shield },
            { label: "Админка", href: "/admin/settings?tab=admin", icon: Database },
          ]
        },
      ]
    }
  ];
}
