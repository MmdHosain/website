"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Watch } from '../types';

export interface CartItem extends Watch {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (watch: Watch) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('ariwatch_cart');
    if (stored) {
      try {
        setCartItems(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  const addToCart = (watch: Watch) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === watch.id);
      const updated = existing
        ? prev.map(item => item.id === watch.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...prev, { ...watch, quantity: 1 }];
      localStorage.setItem('ariwatch_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('ariwatch_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('ariwatch_cart');
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
