'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode, useCallback } from "react";
import { toast } from "sonner";
import { Cart, CartContextType } from "@/lib/types/cart";
import { cartService } from "@/lib/services/cart";
import { productService } from "@/lib/services/product";

const CartContext = createContext<CartContextType | null>(null);

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
    const [cart, setCartState] = useState<Cart | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const setCartData = useCallback((newCartData: Cart | null) => {
        console.log("[CartProvider] setCartData called with:", newCartData?.id || null);
        setCartState(newCartData);
    }, []);

    const createNewCart = useCallback(async (): Promise<Cart | null> => {
        console.log("[CartProvider] createNewCart - Attempting to create new cart");
        try {
            const newCart = await cartService.createCart();
            if (newCart) {
                if (typeof window !== "undefined") {
                    localStorage.setItem("cart_id", newCart.id);
                }
                setCartData(newCart);
                console.log("[CartProvider] createNewCart - New cart created and saved:", newCart.id);
                return newCart;
            }
            console.warn("[CartProvider] createNewCart - No cart returned from service.");
            setCartData(null);
            return null;
        } catch (error) {
            console.error("[CartProvider] createNewCart - Error creating cart:", error);
            toast.error("Не удалось создать корзину.");
            setCartData(null);
            return null;
        }
    }, [setCartData]);

    const retrieveCart = useCallback(async (cartId: string): Promise<Cart | null> => {
        console.log("[CartProvider] retrieveCart - Attempting to retrieve existing cart:", cartId);
        try {
            const existingCart = await cartService.getCart(cartId);
            if (existingCart) {
                setCartData(existingCart);
                console.log("[CartProvider] retrieveCart - Cart successfully retrieved:", existingCart.id);
                return existingCart;
            }
            console.warn("[CartProvider] retrieveCart - Cart not found, creating new one");
            if (typeof window !== "undefined") {
                localStorage.removeItem("cart_id");
            }
            return await createNewCart();
        } catch (error) {
            console.error("[CartProvider] retrieveCart - Error retrieving cart:", error);
            toast.error("Не удалось загрузить данные корзины.");
            setCartData(null);
            return null;
        }
    }, [createNewCart, setCartData]);

    const ensureCart = useCallback(async (): Promise<Cart | null> => {
        console.log("[CartProvider] ensureCart called");
        setIsLoading(true);
        let resultCart: Cart | null = null;
        try {
            if (cart?.id) {
                console.log("[CartProvider] ensureCart - Using existing cart from state");
                return cart;
            }

            const storedCartId = typeof window !== "undefined" ? localStorage.getItem("cart_id") : null;
            if (storedCartId) {
                console.log("[CartProvider] ensureCart - Found cart_id in localStorage");
                resultCart = await retrieveCart(storedCartId);
            } else {
                console.log("[CartProvider] ensureCart - No cart_id in localStorage, creating new cart");
                resultCart = await createNewCart();
            }
        } catch (e) {
            console.error("[CartProvider] ensureCart - Error during retrieve/create:", e);
            setCartData(null);
        } finally {
            setIsLoading(false);
            console.log("[CartProvider] ensureCart finished. isLoading set to false. Resulting cart ID:", resultCart?.id);
        }
        return resultCart;
    }, [cart, retrieveCart, createNewCart, setCartData]);

    useEffect(() => {
        ensureCart();
    }, [ensureCart]);

    const addItem = useCallback(async (variantId: string, quantity: number) => {
        console.log("[CartProvider] addItem called for variant:", variantId, "quantity:", quantity);
        let currentCart = cart;
        if (!currentCart?.id) {
            console.log("[CartProvider] addItem - Cart not available, ensuring cart first");
            currentCart = await ensureCart();
        }

        if (!currentCart?.id) {
            console.error("[CartProvider] addItem - No cart available after ensureCart");
            toast.error("Не удалось получить или создать корзину. Товар не добавлен.");
            return;
        }

        setIsLoading(true);
        try {
            const productData = await productService.getProductWithVariant(variantId);
            if (!productData) {
                throw new Error("Product or variant not found");
            }

            const { product, variant } = productData;
            const updatedCart = await cartService.addItem(currentCart.id, {
                variant_id: variantId,
                product_id: product.id,
                quantity,
                price: variant.price,
                title: `${product.title} - ${variant.title}`,
                thumbnail: product.thumbnail,
            });
            setCartData(updatedCart);
            console.log("[CartProvider] addItem - Successfully added item to cart:", updatedCart.id);
        } catch (error) {
            console.error("[CartProvider] addItem - Error adding item:", error);
            toast.error("Не удалось добавить товар в корзину.");
        } finally {
            setIsLoading(false);
        }
    }, [cart, ensureCart, setCartData]);

    const removeItem = useCallback(async (itemId: string) => {
        console.log("[CartProvider] removeItem called for itemId:", itemId);
        let currentCart = cart;
        if (!currentCart?.id) {
            console.log("[CartProvider] removeItem - Cart not available, ensuring cart first");
            currentCart = await ensureCart();
        }

        if (!currentCart?.id) {
            console.error("[CartProvider] removeItem - No cart available after ensureCart");
            toast.error("Корзина не найдена. Невозможно удалить товар.");
            return;
        }

        setIsLoading(true);
        try {
            const updatedCart = await cartService.removeItem(currentCart.id, itemId);
            setCartData(updatedCart);
            console.log("[CartProvider] removeItem - Successfully removed item with itemId:", itemId);
        } catch (error) {
            console.error("[CartProvider] removeItem - Error removing item:", error);
            toast.error("Не удалось удалить товар из корзины.");
        } finally {
            setIsLoading(false);
        }
    }, [cart, ensureCart, setCartData]);

    const updateItemQuantity = useCallback(async (itemId: string, quantity: number) => {
        console.log("[CartProvider] updateItemQuantity called for itemId:", itemId, "quantity:", quantity);
        let currentCart = cart;
        if (!currentCart?.id) {
            console.log("[CartProvider] updateItemQuantity - Cart not available, ensuring cart first");
            currentCart = await ensureCart();
        }

        if (!currentCart?.id) {
            console.error("[CartProvider] updateItemQuantity - No cart available after ensureCart");
            toast.error("Корзина не найдена. Невозможно обновить товар.");
            return;
        }

        if (quantity <= 0) {
            await removeItem(itemId);
            return;
        }

        setIsLoading(true);
        try {
            const updatedCart = await cartService.updateItemQuantity(currentCart.id, itemId, quantity);
            setCartData(updatedCart);
            console.log("[CartProvider] updateItemQuantity - Successfully updated quantity for itemId:", itemId);
        } catch (error) {
            console.error("[CartProvider] updateItemQuantity - Error updating quantity:", error);
            toast.error("Не удалось обновить количество товара.");
        } finally {
            setIsLoading(false);
        }
    }, [cart, ensureCart, setCartData, removeItem]);

    const totalItems = useMemo(() => {
        return cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
    }, [cart]);

    const value = useMemo(
        () => ({
            cart,
            setCartData,
            isLoading,
            totalItems,
            addItem,
            updateItemQuantity,
            removeItem,
        }),
        [cart, setCartData, isLoading, totalItems, addItem, updateItemQuantity, removeItem]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};