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
  MessageSquare
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
            }
          ]
        },
      ]
    },
    {
      groupLabel: "",
      menus: [
//        { label: "Заказы", href: "/admin/orders", icon: FileText },
        { label: "Новости", href: "/admin/news", icon: Newspaper },
        { label: "Запросы клиентов", href: "/admin/contact-requests", icon: MessageSquare },
        { label: "Пользователи", href: "/admin/users", icon: Users },
//        { label: "Аналитика", href: "/admin/analytics", icon: BarChart3 },
      ]
    },
/*    {
      groupLabel: "",
      menus: [
        {
          href: "",
          label: "Настройки",
          icon: Settings,
          submenus: [
            { label: "Общие", href: "/admin/settings", icon: Settings },
            {
              label: "Уведомления",
              href: "/admin/settings/notifications",
              icon: Bell,
            },
            { label: "Безопасность", href: "/admin/settings/security", icon: Shield },
                ]
              },
      ]
    }*/
  ];
}
