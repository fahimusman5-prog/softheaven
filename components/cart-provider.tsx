'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Product } from '@/lib/data';
import { STORE_CURRENCY } from '@/lib/format';

export type CartLine = { product: Product; quantity: number };
type PersistedCart = { version: 2; currency: typeof STORE_CURRENCY; lines: CartLine[] };
type CartContextValue = { lines: CartLine[]; count: number; subtotal: number; add: (product: Product) => void; update: (id: string, quantity: number) => void; remove: (id: string) => void; clear: () => void };
const CartContext = createContext<CartContextValue | null>(null);
const CART_STORAGE_KEY = 'softhaven-cart-v2';
const LEGACY_CART_STORAGE_KEY = 'softhaven-cart';

function isPersistedCart(value: unknown): value is PersistedCart {
  if (!value || typeof value !== 'object') return false;
  const cart = value as Partial<PersistedCart>;
  return cart.version === 2 && cart.currency === STORE_CURRENCY && Array.isArray(cart.lines);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const hasHydrated = useRef(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (isPersistedCart(parsed)) setLines(parsed.lines);
      } else if (window.localStorage.getItem(LEGACY_CART_STORAGE_KEY)) {
        window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
      }
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
    } finally {
      hasHydrated.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated.current) return;
    const persisted: PersistedCart = { version: 2, currency: STORE_CURRENCY, lines };
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(persisted));
  }, [lines]);

  const value = useMemo(() => ({
    lines,
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
    add: (product: Product) => setLines((current) => {
      const existing = current.find((line) => line.product.id === product.id);
      return existing ? current.map((line) => line.product.id === product.id ? { ...line, quantity: Math.min(12, line.quantity + 1) } : line) : [...current, { product, quantity: 1 }];
    }),
    update: (id: string, quantity: number) => setLines((current) => quantity < 1 ? current.filter((line) => line.product.id !== id) : current.map((line) => line.product.id === id ? { ...line, quantity: Math.min(quantity, 12) } : line)),
    remove: (id: string) => setLines((current) => current.filter((line) => line.product.id !== id)),
    clear: () => setLines([]),
  }), [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
};
