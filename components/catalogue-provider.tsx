'use client';
import { createContext, useContext } from 'react';
import type { Product } from '@/lib/data';
import type { SoftHavenCollection } from '@/lib/collections';
export type Catalogue = {
  products: Product[];
  collections: SoftHavenCollection[];
  categories: Array<{ name: string; slug: string }>;
  sections: Record<string, Record<string, any>>;
  settings: Record<string, Record<string, any>>;
  navigation: Array<{
    id: string;
    label: string;
    url: string;
    placement: string;
  }>;
};
const Context = createContext<Catalogue | null>(null);
export function CatalogueProvider({
  value,
  children,
}: {
  value: Catalogue;
  children: React.ReactNode;
}) {
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useCatalogue() {
  const c = useContext(Context);
  if (!c) throw new Error('Catalogue provider is missing');
  return c;
}
