"use client";
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Watch } from '../types';
import { CartItem, cartLineId, clampQuantity, makeCartItem, parseCart, refreshCart, consumeCart } from '../services/catalog/cart';
export type { CartItem } from '../services/catalog/cart';
interface CartContextType {
  cartItems: CartItem[]; isHydrated: boolean;
  addToCart: (watch: Watch, variantId?: string) => boolean;
  updateQuantity: (lineId: string, quantity: number) => void;
  refreshCartPrices: (watches: Watch[]) => void;
  removeFromCart: (lineId: string) => void; clearCart: () => void;
  consumePurchasedOrder: (orderId: string, items: { watchId: string; variantId?: string; quantity: number }[]) => void;
}
const CART_KEY = 'ariwatch_cart_v3', PURCHASES_KEY = 'ariwatch_cart_purchases';
const CartContext = createContext<CartContextType | undefined>(undefined);
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const purchasedOrders = useRef(new Set<string>());
  useEffect(() => {
    try {
      setCartItems(parseCart(localStorage.getItem(CART_KEY) || localStorage.getItem('ariwatch_cart_v2') || '[]'));
      const stored: unknown = JSON.parse(localStorage.getItem(PURCHASES_KEY) || '[]');
      if (Array.isArray(stored)) purchasedOrders.current = new Set(stored.filter(id => typeof id === 'string'));
    } catch { /* The in-memory cart remains usable when storage is unavailable. */ }
    setIsHydrated(true);
  }, []);
  useEffect(() => {
    if (isHydrated) try { localStorage.setItem(CART_KEY, JSON.stringify(cartItems)); } catch { /* Keep the in-memory cart. */ }
  }, [cartItems, isHydrated]);
  const addToCart = useCallback((watch: Watch, variantId?: string) => {
    const line = makeCartItem(watch, variantId);
    if (!line) return false;
    setCartItems(previous => previous.some(item => item.lineId === line.lineId)
      ? previous.map(item => item.lineId === line.lineId ? { ...line, quantity: clampQuantity(item.quantity + 1, line.stockQuantity) } : item)
      : [...previous, line]);
    return true;
  }, []);
  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    setCartItems(previous => previous.map(item => item.lineId === lineId ? { ...item, quantity: clampQuantity(quantity, item.stockQuantity) } : item));
  }, []);
  const refreshCartPrices = useCallback((watches: Watch[]) => setCartItems(previous => refreshCart(previous, watches)), []);
  const removeFromCart = useCallback((lineId: string) => setCartItems(previous => previous.filter(item => item.lineId !== lineId)), []);
  const clearCart = useCallback(() => setCartItems([]), []);
  const consumePurchasedOrder = useCallback((orderId: string, items: { watchId: string; variantId?: string; quantity: number }[]) => {
    if (!isHydrated || purchasedOrders.current.has(orderId)) return;
    purchasedOrders.current.add(orderId);
    try { localStorage.setItem(PURCHASES_KEY, JSON.stringify(Array.from(purchasedOrders.current).slice(-200))); } catch { /* Keep session deduplication. */ }
    setCartItems(previous => consumeCart(previous, items));
  }, [isHydrated]);
  return <CartContext.Provider value={{ cartItems, isHydrated, addToCart, updateQuantity, refreshCartPrices, removeFromCart, clearCart, consumePurchasedOrder }}>{children}</CartContext.Provider>;
}
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
