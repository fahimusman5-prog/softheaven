'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const key = 'softhaven-wishlist-v1';
const WishlistContext = createContext<{ ids: string[]; toggle: (id: string) => void }>({ ids: [], toggle: () => {} });

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    const read = () => {
      try {
        const value: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
        setIds(Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []);
      } catch { /* Saving remains usable in memory when browser storage is unavailable. */ }
    };
    const sync = (event: StorageEvent) => { if (event.key === key || event.key === null) read(); };
    read();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const toggle = (id: string) => {
    const next = ids.includes(id) ? ids.filter((saved) => saved !== id) : [...ids, id];
    setIds(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* In-memory fallback. */ }
  };
  return <WishlistContext.Provider value={{ ids, toggle }}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => useContext(WishlistContext);
