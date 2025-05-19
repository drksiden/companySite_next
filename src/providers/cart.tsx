'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode, useCallback } from "react";
import { sdk } from "@/lib/sdk";
import { useRegion } from "./region";
import { HttpTypes } from "@medusajs/types";
import { toast } from "sonner";

type MedusaCart = HttpTypes.StoreCart;
type MedusaLineItem = HttpTypes.StoreCartLineItem;

interface CartContextType {
    cart: MedusaCart | null;
    setCartData: (cart: MedusaCart | null) => void;
    isLoading: boolean;
    totalItems: number;
    addItem: (variantId: string, quantity: number) => Promise<void>;
    updateItemQuantity: (lineId: string, quantity: number) => Promise<void>;
    removeItem: (lineId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
    const [cart, setCartState] = useState<MedusaCart | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { region } = useRegion();
    const [currentRegionIdForCart, setCurrentRegionIdForCart] = useState<string | null>(null);

    const setCartData = useCallback((newCartData: MedusaCart | null) => {
        console.log("[CartProvider] setCartData called with:", newCartData?.id || null);
        setCartState(newCartData);
    }, []);

    const createNewCartLocal = useCallback(async (currentRegionId: string): Promise<MedusaCart | null> => {
        if (!currentRegionId) {
            console.warn("[CartProvider] createNewCartLocal - Region ID not provided, cannot create cart.");
            setCartData(null);
            return null;
        }
        console.log("[CartProvider] createNewCartLocal - Attempting to create new cart for region:", currentRegionId);
        try {
            const { cart: newCart } = await sdk.store.cart.create({ region_id: currentRegionId });
            if (newCart) {
                if (typeof window !== "undefined") {
                    localStorage.setItem("cart_id", newCart.id);
                }
                setCartData(newCart);
                console.log("[CartProvider] createNewCartLocal - New cart created and saved:", newCart.id);
                return newCart;
            }
            console.warn("[CartProvider] createNewCartLocal - No cart returned from SDK.");
            setCartData(null);
            return null;
        } catch (error) {
            console.error("[CartProvider] createNewCartLocal - Error creating cart:", error);
            toast.error("Не удалось создать корзину.");
            setCartData(null);
            return null;
        }
    }, [setCartData]);

    const retrieveCartLocal = useCallback(async (cartId: string, currentRegionId: string): Promise<MedusaCart | null> => {
        if (!currentRegionId) {
            console.warn("[CartProvider] retrieveCartLocal - Region ID not provided, cannot retrieve cart.");
            setCartData(null);
            return null;
        }
        console.log("[CartProvider] retrieveCartLocal - Attempting to retrieve existing cart:", cartId);
        try {
            const { cart: existingCart } = await sdk.store.cart.retrieve(cartId);
            if (existingCart) {
                if (existingCart.region_id !== currentRegionId) {
                    console.warn("[CartProvider] retrieveCartLocal - Cart region mismatch. Removing old, creating new.");
                    if (typeof window !== "undefined") {
                        localStorage.removeItem("cart_id");
                    }
                    return await createNewCartLocal(currentRegionId);
                }
                setCartData(existingCart);
                console.log("[CartProvider] retrieveCartLocal - Cart successfully retrieved:", existingCart.id);
                return existingCart;
            }
            console.warn("[CartProvider] retrieveCartLocal - No cart returned from SDK.");
            return await createNewCartLocal(currentRegionId);
        } catch (error: any) {
            console.error("[CartProvider] retrieveCartLocal - Error retrieving cart:", cartId, error);
            if (error?.response?.status === 404 || error?.message?.includes("not found") || error?.type === 'not_found') {
                console.warn("[CartProvider] retrieveCartLocal - Cart not found (404), removing cart_id.");
                if (typeof window !== "undefined") {
                    localStorage.removeItem("cart_id");
                }
                return await createNewCartLocal(currentRegionId);
            }
            toast.error("Не удалось загрузить данные корзины.");
            setCartData(null);
            return null;
        }
    }, [createNewCartLocal, setCartData]);

    const ensureCart = useCallback(async (currentRegionId: string | null): Promise<MedusaCart | null> => {
        console.log("[CartProvider] ensureCart called. Target Region ID:", currentRegionId);

        if (!currentRegionId) {
            console.warn("[CartProvider] ensureCart - Region ID not available. Cannot ensure cart.");
            setCartData(null);
            setIsLoading(false);
            return null;
        }

        setIsLoading(true);
        let resultCart: MedusaCart | null = null;
        try {
            if (cart?.id && cart.region_id === currentRegionId) {
                console.log("[CartProvider] ensureCart - Using existing cart from state for the correct region.");
                return cart;
            }

            const storedCartId = typeof window !== "undefined" ? localStorage.getItem("cart_id") : null;
            if (storedCartId) {
                console.log("[CartProvider] ensureCart - Found cart_id in localStorage, attempting to retrieve for region:", currentRegionId);
                resultCart = await retrieveCartLocal(storedCartId, currentRegionId);
            } else {
                console.log("[CartProvider] ensureCart - No cart_id in localStorage, creating new cart for region:", currentRegionId);
                resultCart = await createNewCartLocal(currentRegionId);
            }
        } catch (e) {
            console.error("[CartProvider] ensureCart - Error during retrieve/create:", e);
            setCartData(null);
        } finally {
            setIsLoading(false);
            console.log("[CartProvider] ensureCart finished. isLoading set to false. Resulting cart ID:", resultCart?.id);
        }
        return resultCart;
    }, [cart, retrieveCartLocal, createNewCartLocal, setCartData]);

    useEffect(() => {
        const activeRegionId = region?.id || null;
        console.log("[CartProvider] useEffect [region] triggered. Active Region ID:", activeRegionId, "Current cart's region:", cart?.region_id);

        if (activeRegionId) {
            if (!cart || cart.region_id !== activeRegionId || currentRegionIdForCart !== activeRegionId) {
                console.log("[CartProvider] useEffect [region] - Conditions met to call ensureCart for region:", activeRegionId);
                ensureCart(activeRegionId);
                setCurrentRegionIdForCart(activeRegionId);
            } else {
                console.log("[CartProvider] useEffect [region] - Cart is already set for region or no action needed. isLoading:", isLoading);
                if (isLoading) setIsLoading(false);
            }
        } else {
            console.log("[CartProvider] useEffect [region] - No active region. Clearing cart.");
            if (cart !== null) setCartData(null);
            if (isLoading) setIsLoading(false);
            setCurrentRegionIdForCart(null);
        }
    }, [region, cart, isLoading, ensureCart, currentRegionIdForCart, setCartData]);

    const addItem = useCallback(async (variantId: string, quantity: number) => {
        console.log("[CartProvider] addItem called for variant:", variantId, "quantity:", quantity);
        let currentCart = cart;
        if (!currentCart?.id || (region && currentCart.region_id !== region.id)) {
            console.log("[CartProvider] addItem - Cart not available or region mismatch, ensuring cart first for region:", region?.id);
            currentCart = await ensureCart(region?.id || null);
        }

        if (!currentCart?.id) {
            console.error("[CartProvider] addItem - No cart available after ensureCart");
            toast.error("Не удалось получить или создать корзину. Товар не добавлен.");
            return;
        }

        setIsLoading(true);
        try {
            const { cart: updatedCart } = await sdk.store.cart.createLineItem(currentCart.id, { 
                variant_id: variantId, 
                quantity 
            });
            setCartData(updatedCart);
            console.log("[CartProvider] addItem - Successfully added item to cart:", updatedCart.id);
        } catch (error) {
            console.error("[CartProvider] addItem - Error adding item:", error);
            toast.error("Не удалось добавить товар в корзину.");
        } finally {
            setIsLoading(false);
        }
    }, [cart, region, ensureCart, setCartData]);

    const removeItem = useCallback(async (lineId: string) => {
        console.log("[CartProvider] removeItem called for lineId:", lineId);
        let currentCart = cart;
        if (!currentCart?.id || (region && currentCart.region_id !== region.id)) {
            console.log("[CartProvider] removeItem - Cart not available or region mismatch, ensuring cart first for region:", region?.id);
            currentCart = await ensureCart(region?.id || null);
        }

        if (!currentCart?.id) {
            console.error("[CartProvider] removeItem - No cart available after ensureCart");
            toast.error("Корзина не найдена. Невозможно удалить товар.");
            return;
        }

        setIsLoading(true);
        try {
            const { parent: updatedCart } = await sdk.store.cart.deleteLineItem(currentCart.id, lineId);
            setCartData(updatedCart);
            console.log("[CartProvider] removeItem - Successfully removed item with lineId:", lineId);
        } catch (error) {
            console.error("[CartProvider] removeItem - Error removing item:", error);
            toast.error("Не удалось удалить товар из корзины.");
        } finally {
            setIsLoading(false);
        }
    }, [cart, region, ensureCart, setCartData]);

    const updateItemQuantity = useCallback(async (lineId: string, quantity: number) => {
        console.log("[CartProvider] updateItemQuantity called for lineId:", lineId, "quantity:", quantity);
        let currentCart = cart;
        if (!currentCart?.id || (region && currentCart.region_id !== region.id)) {
            console.log("[CartProvider] updateItemQuantity - Cart not available or region mismatch, ensuring cart first for region:", region?.id);
            currentCart = await ensureCart(region?.id || null);
        }

        if (!currentCart?.id) {
            console.error("[CartProvider] updateItemQuantity - No cart available after ensureCart");
            toast.error("Корзина не найдена. Невозможно обновить товар.");
            return;
        }

        if (quantity <= 0) {
            await removeItem(lineId);
            return;
        }

        setIsLoading(true);
        try {
            const { cart: updatedCart } = await sdk.store.cart.updateLineItem(currentCart.id, lineId, { quantity });
            setCartData(updatedCart);
            console.log("[CartProvider] updateItemQuantity - Successfully updated quantity for lineId:", lineId);
        } catch (error) {
            console.error("[CartProvider] updateItemQuantity - Error updating quantity:", error);
            toast.error("Не удалось обновить количество товара.");
        } finally {
            setIsLoading(false);
        }
    }, [cart, region, ensureCart, setCartData, removeItem]);

    const totalItems = useMemo(() => {
        return cart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    }, [cart]);

    const contextValue: CartContextType = useMemo(() => ({
        cart,
        setCartData,
        isLoading,
        totalItems,
        addItem,
        updateItemQuantity,
        removeItem,
    }), [cart, setCartData, isLoading, totalItems]);

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (context === null) {
        throw new Error("useCart должен использоваться внутри CartProvider");
    }
    return context;
};