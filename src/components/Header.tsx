'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { ShoppingCart, User } from 'lucide-react';
import medusa from '@/lib/medusa';
import { useEffect, useState } from 'react';

export function Header() {
  const [cart, setCart] = useState<{ itemCount: number }>({ itemCount: 0 });
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { cart } = await medusa.carts.retrieve();
        setCart({ itemCount: cart.items.length });
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };
    const fetchUser = async () => {
      try {
        const { customer } = await medusa.customers.retrieve();
        setUser({ email: customer.email });
      } catch (error) {
        setUser(null);
      }
    };
    fetchCart();
    fetchUser();
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-background border-b sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Your Store
        </Link>
        <nav className="flex gap-4 items-center">
          <Button variant="ghost" asChild>
            <Link href="/catalog">Catalog</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/services">Services</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/about">About</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/contact">Contact</Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <ShoppingCart className="h-4 w-4" />
                {cart.itemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-primary-foreground rounded-full h-4 w-4 text-xs">
                    {cart.itemCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Link href="/cart">View Cart</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {user ? (
                <>
                  <DropdownMenuItem>{user.email}</DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/account">Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => medusa.auth.logout()}>
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem>
                    <Link href="/login">Login</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/register">Register</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </motion.header>
  );
}