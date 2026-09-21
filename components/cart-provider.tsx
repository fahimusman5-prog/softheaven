'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Product } from '@/lib/data';

export type CartLine = { product: Product; quantity: number };
type CartContextValue = { lines: CartLine[]; count: number; subtotal: number; add: (product: Product) => void; update: (id: string, quantity: number) => void; remove: (id: string) => void; clear: () => void };
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  useEffect(() => { const saved = window.localStorage.getItem('softhaven-cart'); if (saved) setLines(JSON.parse(saved)); }, []);
  useEffect(() => { window.localStorage.setItem('softhaven-cart', JSON.stringify(lines)); }, [lines]);
  const value = useMemo(() => ({ lines, count: lines.reduce((sum, line) => sum + line.quantity, 0), subtotal: lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0), add: (product: Product) => setLines((current) => { const existing = current.find((line) => line.product.id === product.id); return existing ? current.map((line) => line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { product, quantity: 1 }]; }), update: (id: string, quantity: number) => setLines((current) => quantity < 1 ? current.filter((line) => line.product.id !== id) : current.map((line) => line.product.id === id ? { ...line, quantity: Math.min(quantity, 12) } : line)), remove: (id: string) => setLines((current) => current.filter((line) => line.product.id !== id)), clear: () => setLines([]) }), [lines]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export const useCart = () => { const context = useContext(CartContext); if (!context) throw new Error('useCart must be used inside CartProvider'); return context; };
