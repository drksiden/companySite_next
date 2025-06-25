'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/providers/cart';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Check, 
  Loader2,
  Package
} from 'lucide-react';
import { toast } from 'sonner';

interface AddToCartButtonProps {
  productId: string;
  variantId?: string;
  price: number;
  title: string;
  thumbnail?: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link';
  showQuantityControls?: boolean;
  disabled?: boolean;
}

export function AddToCartButton({
  productId,
  variantId,
  price,
  title,
  thumbnail,
  className,
  size = 'default',
  variant = 'default',
  showQuantityControls = false,
  disabled = false
}: AddToCartButtonProps) {
  const { cart, addItem, updateItemQuantity, removeItem, isLoading } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Находим товар в корзине
  const cartItem = cart?.items.find(item => 
    item.product_id === productId && 
    (!variantId || item.variant_id === variantId)
  );
  
  const isInCart = !!cartItem;
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = async () => {
    if (disabled || isLoading) return;

    setIsAdding(true);
    try {
      await addItem(variantId || productId, 1);
      
      // Показываем успешное состояние
      setShowSuccess(true);
      toast.success(`${title} добавлен в корзину`, {
        action: {
          label: "Перейти в корзину",
          onClick: () => window.location.href = '/cart'
        }
      });
      
      // Сбрасываем состояние успеха через 2 секунды
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      toast.error('Не удалось добавить товар в корзину');
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuantityChange = async (newQuantity: number) => {
    if (!cartItem) return;
    
    if (newQuantity <= 0) {
      await removeItem(cartItem.id);
      toast.success('Товар удален из корзины');
    } else {
      await updateItemQuantity(cartItem.id, newQuantity);
    }
  };

  // Размеры кнопок
  const sizeClasses = {
    default: 'h-10 px-4',
    sm: 'h-8 px-3 text-sm',
    lg: 'h-12 px-6 text-lg',
    icon: 'h-10 w-10'
  };

  // Если товар в корзине и показываем контролы количества
  if (isInCart && showQuantityControls) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={isLoading}
          className="w-8 h-8 p-0"
        >
          <Minus className="w-4 h-4" />
        </Button>
        
        <Badge variant="secondary" className="px-3 py-1 min-w-[3rem] text-center">
          {quantity}
        </Badge>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={isLoading}
          className="w-8 h-8 p-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleAddToCart}
      disabled={disabled || isLoading || isAdding}
      className={`relative overflow-hidden ${sizeClasses[size]} ${className}`}
    >
      <AnimatePresence mode="wait">
        {isAdding ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            Добавление...
          </motion.div>
        ) : showSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2 text-green-600"
          >
            <Check className="w-4 h-4" />
            Добавлено!
          </motion.div>
        ) : isInCart ? (
          <motion.div
            key="in-cart"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            В корзине ({quantity})
          </motion.div>
        ) : (
          <motion.div
            key="add"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            В корзину
          </motion.div>
        )}
      </AnimatePresence>

      {/* Анимация успешного добавления */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 bg-green-500 rounded-md flex items-center justify-center"
          >
            <Check className="w-6 h-6 text-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}

// Компонент быстрого добавления в корзину (для карточек товаров)
interface QuickAddToCartProps {
  productId: string;
  variantId?: string;
  price: number;
  title: string;
  thumbnail?: string;
  className?: string;
}

export function QuickAddToCart({
  productId,
  variantId,
  price,
  title,
  thumbnail,
  className
}: QuickAddToCartProps) {
  const { cart, addItem, isLoading } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  
  const cartItem = cart?.items.find(item => 
    item.product_id === productId && 
    (!variantId || item.variant_id === variantId)
  );
  
  const isInCart = !!cartItem;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault(); // Предотвращаем переход на страницу товара
    e.stopPropagation();
    
    if (isLoading || isAdding) return;

    setIsAdding(true);
    try {
      await addItem(variantId || productId, 1);
      toast.success(`${title} добавлен в корзину`);
    } catch (error) {
      toast.error('Не удалось добавить товар');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.button
      onClick={handleQuickAdd}
      disabled={isLoading || isAdding}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`
        absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm 
        rounded-full shadow-lg border border-gray-200 
        flex items-center justify-center
        opacity-0 group-hover:opacity-100 transition-all duration-200
        hover:bg-white hover:shadow-xl
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      <AnimatePresence mode="wait">
        {isAdding ? (
          <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
        ) : isInCart ? (
          <Check className="w-5 h-5 text-green-600" />
        ) : (
          <Plus className="w-5 h-5 text-gray-600" />
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// Компонент мини-корзины для Header (улучшенная версия)
export function MiniCartButton() {
  const { cart, totalItems, isLoading } = useCart();

  return (
    <Button variant="ghost" size="icon" className="relative" asChild>
      <motion.a 
        href="/cart"
        whileTap={{ scale: 0.95 }}
      >
        <ShoppingCart className="w-5 h-5" />
        <AnimatePresence>
          {totalItems > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              {totalItems > 99 ? '99+' : totalItems}
            </motion.div>
          )}
        </AnimatePresence>
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-3 h-3 animate-spin" />
          </div>
        )}
      </motion.a>
    </Button>
  );
}