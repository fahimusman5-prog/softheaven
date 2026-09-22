'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Product, ProductVariant } from '@/lib/data';
import { getProductVariants } from '@/lib/data';
import { STORE_CURRENCY } from '@/lib/format';

export type CartLine = { product: Product; variant: ProductVariant; quantity: number };
type PersistedCart = { version: 3; currency: typeof STORE_CURRENCY; lines: CartLine[] };
type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (product: Product, variant?: ProductVariant) => void;
  update: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const CART_STORAGE_KEY = 'softhaven-cart-v3';
const PREVIOUS_CART_STORAGE_KEY = 'softhaven-cart-v2';
const LEGACY_CART_STORAGE_KEY = 'softhaven-cart';

export function getCartLineId(product: Product, variant: ProductVariant) {
  return `${product.id}:${variant.id}`;
}

function normalizeCartLines(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((rawLine) => {
    if (!rawLine || typeof rawLine !== 'object') return [];
    const line = rawLine as { product?: Product; variant?: ProductVariant; quantity?: number };
    if (!line.product?.id) return [];

    const variant = line.variant?.id ? line.variant : getProductVariants(line.product)[0];
    if (!variant) return [];

    const quantity = Math.min(12, Math.max(1, Math.floor(Number(line.quantity) || 1)));
    return [{ product: line.product, variant, quantity }];
  });
}

function readPersistedCart(value: unknown): CartLine[] | null {
  if (!value || typeof value !== 'object') return null;
  const cart = value as { version?: number; currency?: string; lines?: unknown };
  if ((cart.version !== 3 && cart.version !== 2) || cart.currency !== STORE_CURRENCY) return null;
  return normalizeCartLines(cart.lines);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const hasHydrated = useRef(false);

  useEffect(() => {
    try {
      const current = window.localStorage.getItem(CART_STORAGE_KEY);
      const previous = window.localStorage.getItem(PREVIOUS_CART_STORAGE_KEY);
      const source = current ?? previous;

      if (source) {
        const parsed: unknown = JSON.parse(source);
        const normalized = readPersistedCart(parsed);
        if (normalized) setLines(normalized);
      }

      window.localStorage.removeItem(PREVIOUS_CART_STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
      window.localStorage.removeItem(PREVIOUS_CART_STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
    } finally {
      hasHydrated.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated.current) return;
    const persisted: PersistedCart = { version: 3, currency: STORE_CURRENCY, lines };
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(persisted));
  }, [lines]);

  const value = useMemo<CartContextValue>(() => ({
    lines,
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: lines.reduce((sum, line) => sum + line.variant.price * line.quantity, 0),
    add: (product, selectedVariant) => setLines((current) => {
      const variant = selectedVariant ?? getProductVariants(product)[0];
      if (!variant) return current;
      const id = getCartLineId(product, variant);
      const existing = current.find((line) => getCartLineId(line.product, line.variant) === id);
      return existing
        ? current.map((line) => getCartLineId(line.product, line.variant) === id ? { ...line, quantity: Math.min(12, line.quantity + 1) } : line)
        : [...current, { product, variant, quantity: 1 }];
    }),
    update: (id, quantity) => setLines((current) => quantity < 1
      ? current.filter((line) => getCartLineId(line.product, line.variant) !== id)
      : current.map((line) => getCartLineId(line.product, line.variant) === id ? { ...line, quantity: Math.min(Math.floor(quantity), 12) } : line)),
    remove: (id) => setLines((current) => current.filter((line) => getCartLineId(line.product, line.variant) !== id)),
    clear: () => setLines([]),
  }), [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
};
