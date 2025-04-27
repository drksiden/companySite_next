'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { Menu, ShoppingCart, User, Sun, Moon } from 'lucide-react';
import { COMPANY_NAME_SHORT } from '@/data/constants';
import { useEffect, useState } from 'react';

// Используем motion.header
const MotionHeader = motion.header;

interface User {
  email: string;
}

export function Header() {
  const { theme, setTheme } = useTheme();
  const cart = { itemCount: 0 };
  const user: User | null = null;

  // Guard theme switching for client side only
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Set mounted to true after the first render on the client side
  }, []);

  const navItems: { href: string; label: string }[] = [
    { href: '/catalog', label: 'Каталог' },
    { href: '/services', label: 'Услуги' },
    { href: '/about', label: 'О нас' },
    { href: '/contact', label: 'Контакты' },
  ];

  if (!mounted) return null; // Render nothing during SSR

  return (
    <MotionHeader
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-card text-foreground border-b border-border shadow-lg"
    >
      <div className="container mx-auto flex items-center justify-between px-6 py-5">
        {/* Логотип */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logos/teko-logo.svg"
            alt={COMPANY_NAME_SHORT}
            width={160}
            height={48}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>

        {/* Навигация для Desktop */}
        <nav className="hidden md:flex items-center gap-3">
          <NavigationMenu>
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={item.href}
                      className="rounded-lg px-4 py-2 text-base font-medium text-foreground transition-all duration-300 hover:bg-accent/30 hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Корзина */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative bg-card border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300"
              >
                <ShoppingCart className="h-5 w-5" />
                {cart.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {cart.itemCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card border-border text-foreground">
              <DropdownMenuItem asChild>
                <Link href="/cart" className="w-full">
                  Посмотреть корзину
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Пользователь */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="bg-card border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300"
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card border-border text-foreground">
              {user ? (
                <>
                  <DropdownMenuItem>{user.email ?? 'Пользователь'}</DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="w-full">
                      Аккаунт
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Выйти</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/login" className="w-full">
                      Войти
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/register" className="w-full">
                      Регистрация
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Смена темы */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="bg-card border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </nav>

        {/* Мобильное меню (бургер) */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="outline"
              size="icon"
              className="bg-card border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 bg-card text-foreground border-l border-border">
            <VisuallyHidden>
              <SheetTitle>Меню навигации</SheetTitle>
              <SheetDescription>Навигационное меню для выбора разделов сайта</SheetDescription>
            </VisuallyHidden>

            <nav className="mt-6 flex flex-col gap-4">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  asChild
                  className="justify-start text-base text-foreground hover:bg-accent hover:text-primary"
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ))}

              <Button
                variant="outline"
                asChild
                className="justify-start border-border text-foreground hover:bg-accent hover:text-primary"
              >
                <Link href="/cart">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Корзина ({cart.itemCount})
                </Link>
              </Button>

              {user ? (
                <>
                  <Button
                    variant="ghost"
                    className="justify-start text-base text-foreground hover:bg-accent hover:text-primary"
                  >
                    {user.email ?? 'Пользователь'}
                  </Button>
                  <Button
                    variant="ghost"
                    asChild
                    className="justify-start text-base text-foreground hover:bg-accent hover:text-primary"
                  >
                    <Link href="/account">Аккаунт</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-base text-foreground hover:bg-accent hover:text-primary"
                  >
                    Выйти
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    asChild
                    className="justify-start text-base text-foreground hover:bg-accent hover:text-primary"
                  >
                    <Link href="/login">Войти</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    asChild
                    className="justify-start text-base text-foreground hover:bg-accent hover:text-primary"
                  >
                    <Link href="/register">Регистрация</Link>
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="justify-start border-border text-foreground hover:bg-accent hover:text-primary text-base"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="mr-2 h-5 w-5" />
                    Светлая тема
                  </>
                ) : (
                  <>
                    <Moon className="mr-2 h-5 w-5" />
                    Темная тема
                  </>
                )}
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </MotionHeader>
  );
}
