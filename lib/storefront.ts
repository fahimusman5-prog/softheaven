import 'server-only';
import { getSupabaseConfig } from '@/lib/supabase/config';
import { createClient } from '@supabase/supabase-js';
import { cache } from 'react';
import type { Product } from '@/lib/data';
import type { SoftHavenCollection } from '@/lib/collections';
export const publicClient = () =>
  createClient(
    getSupabaseConfig().url,
    getSupabaseConfig().key,
    {
      auth: { persistSession: false },
      global: {
        fetch: (url, init) => fetch(url, { ...init, cache: 'no-store' }),
      },
    },
  );
export const getStorefront = cache(async () => {
  const db = publicClient();
  const results = await Promise.all([
    db
      .from('products')
      .select('*,categories(name),product_variants(*)')
      .eq('status', 'published')
      .order('created_at')
      .limit(500),
    db
      .from('collections')
      .select('*,product_collections(product_id)')
      .eq('active', true)
      .order('sort_order')
      .limit(100),
    db
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('sort_order')
      .limit(100),
    db.from('hero_slides').select('*').order('sort_order').limit(50),
    db.from('homepage_sections').select('*').order('sort_order').limit(100),
    db.from('site_settings').select('id,value').eq('public', true),
    db
      .from('site_navigation')
      .select('*')
      .eq('active', true)
      .order('sort_order')
      .limit(50),
  ]);
  for (const r of results)
    if (r.error)
      throw new Error('Unable to load storefront data: ' + r.error.message);
  const [p, c, cats, slides, sections, settings, navigation] = results;
  const products: Product[] = (p.data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    price: Number(r.price),
    compareAt: r.compare_at == null ? undefined : Number(r.compare_at),
    category: r.categories?.name ?? '',
    color: r.product_variants?.[0]?.color ?? '',
    description: r.description,
    shortDescription: r.short_description,
    newArrival: r.new_arrival,
    bestSeller: r.best_seller,
    image: r.image ?? '',
    images: r.images,
    details: r.details,
    featured: r.featured,
    seoTitle: r.seo_title ?? undefined,
    seoDescription: r.seo_description ?? undefined,
    variants: (r.product_variants ?? [])
      .filter((v: { active: boolean }) => v.active)
      .sort(
        (a: { sort_order: number }, b: { sort_order: number }) =>
          a.sort_order - b.sort_order,
      )
      .map(
        (v: {
          id: string;
          color: string;
          image: string | null;
          price: number | null;
          compare_at: number | null;
          sku: string;
          stock: number;
          low_stock_threshold: number;
          active: boolean;
        }) => ({
          id: v.id,
          color: v.color,
          image: v.image ?? r.image ?? '',
          price: Number(v.price ?? r.price),
          compareAt: v.compare_at == null ? undefined : Number(v.compare_at),
          sku: v.sku,
          stock: v.stock,
          lowStockThreshold: v.low_stock_threshold,
          active: v.active,
        }),
      ),
  }));
  const collections: SoftHavenCollection[] = (c.data ?? []).map((r) => ({
    slug: r.slug,
    name: r.name,
    seoTitle: r.seo_title ?? undefined,
    seoDescription: r.seo_description ?? undefined,
    description: r.description,
    featured: r.featured,
    symbol: '♡',
    tone: 'cream',
    productIds: r.product_collections.map(
      (p: { product_id: string }) => p.product_id,
    ),
    image: r.image ?? undefined,
    imageAlt: r.name,
  }));
  return {
    products,
    collections,
    categories: cats.data ?? [],
    slides: slides.data ?? [],
    sections: Object.fromEntries((sections.data ?? []).map((s) => [s.id, s])),
    settings: Object.fromEntries(
      (settings.data ?? []).map((s) => [s.id, s.value]),
    ),
    navigation: navigation.data ?? [],
  };
});
