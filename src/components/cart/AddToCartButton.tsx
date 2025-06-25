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
  price?: number;
  title?: string;
  thumbnail?: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link';
  showQuantityControls?: boolean;
  disabled?: boolean;
  maxQuantity?: number;
}

export function AddToCartButton({
  productId,
  variantId,
  className,
  size = 'default',
  variant = 'default',
  showQuantityControls = false,
  disabled = false,
  maxQuantity
}: AddToCartButtonProps) {
  const { addItem, updateItemQuantity, removeItem, getItem, isLoading } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Находим товар в корзине
  const cartItem = getItem(productId, variantId);
  const isInCart = !!cartItem;
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = async () => {
    if (disabled || isLoading || isAdding) return;

    setIsAdding(true);
    try {
      await addItem(productId, variantId, 1);
      
      // Показываем успешное состояние
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      // Ошибка уже обработана в контексте
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuantityChange = async (newQuantity: number) => {
    if (!cartItem) return;
    
    if (newQuantity <= 0) {
      removeItem(cartItem.id);
    } else if (maxQuantity && newQuantity > maxQuantity) {
      toast.error(`Максимальное количество: ${maxQuantity}`);
    } else {
      updateItemQuantity(cartItem.id, newQuantity);
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
          disabled={isLoading || (maxQuantity ? quantity >= maxQuantity : false)}
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
  className?: string;
}

export function QuickAddToCart({ productId, variantId, className }: QuickAddToCartProps) {
  const { addItem, hasItem, isLoading } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  
  const isInCart = hasItem(productId, variantId);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading || isAdding) return;

    setIsAdding(true);
    try {
      await addItem(productId, variantId, 1);
    } catch (error) {
      // Ошибка уже обработана в контексте
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