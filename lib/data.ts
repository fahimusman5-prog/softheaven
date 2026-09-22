export type ProductVariant = {
  id: string;
  color: string;
  image: string;
  images?: string[];
  price: number;
  compareAt?: number;
  stock?: number;
  sku?: string;
  active?: boolean;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAt?: number;
  category: string;
  color: string;
  description: string;
  image: string;
  details: string[];
  variants?: ProductVariant[];
};

export const images = {
  bear: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoNpZ3pda5MRNTC1FprksKz1HgskSdB00NrhLSPIthI2fSm7Gf3j29t4Ccw0mqP6TN-Zqpec0ZbKFDyRSa4EBO4hvRVrLUbAUpPijGZSbQgzUDIHLMg2xt6Bi1zbEbu01wr8epPuyebpKIeTE1y72I_KjbnD1BtzSii8PwxISMweTHJ5nALZwX9ytjQffLiww7QR9fqNOXSeSFPZgJWs1am2cGC5XM3O0WSibY8jQsJPLUrNUnIlqp-g',
  bunny: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAq6PN4A9UAW29113m1hn5WCsHzzyPBdvXAs4dDEJqU_3Fa9Jfz2NuZ4tJl4zNC4dY2i8ewFDpiF8-HrAeBQR1IWTvCavgdPvr9X1Xj4GwJfuOySLQyDnhhNBq0jWDjaMcNI6_MepEWjjckVNblbEwxg31sJ_YWuzyVeE0hNHz4w1e7KRcWpzVboFIUjRxO37Jic3TykOOymN_uhC2aeDoM6yxfvR3vRyRInGaY6F9DcZh2XeN5imzS2Q',
  sloth: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBisABVjjQ0Qcg0ck-KUQf-Of_kZZVc3uZmAjJYU54YjPi_luImQ6Zp7nljKTR7AXPUIKohBtrcN_Ygsi2QZCelHeV46t3Gc683Y3JlRKiHLUAMJFODt1WgRHlMQl4ycs6BjJ82YjmRy-cIAuXpDWraIGmnsBaJem4NdlD8qhv6oh8lx67iJ6xFiu6AGMRpoO9freQ50uWlLo7E2F4feNZu-j_E4M5KIOScm52X-RQ7mPbBO8FSZiHQoA',
  heart: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0BGQY-vP9huRR7jGNldF39oxGLB4z090u9E70VUYW16kZWufcB43oTephMTHLI76PAOP1DstGWY07dZY6hPLlzvartnJENQee1R5OqHa_UzaXltbB7cbxQDZsByDrc6z6Ke_rkrsya902KQFNEphQyUX8SZsj8IMlytm2FcJRqPFmagmCbFJh5aJ5mn38aOrDWYbYHhu1F3tm1XYopqmAXor0W3RFB-S0LO9jLDZEMR5bCUmkdLSU3A',
  gift: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXdJ3VujKAboQltkaIoDSsWdN3Fa5hfUOFwFZcAtPsGF5lcKjYfH9TTe7ZPs9e2tExoXv3P0mAIMeDW_uv831hNAWUhoew31eZBB3vv_XW4mdeArdk_IC6NerghQf_IEiGIqxMoiHCqVh84LT6ao5tEHboXdg_02oIIUfT2ajgbtIwnWvWHoBekG02csQule2BUFHRhXMA9dR15AJML6ETwGXAfBP8txr359EHQj6jA6BbyrZAOrNDXg',
};

/*
 * These catalog numbers are the existing storefront values. The repository does
 * not contain an authoritative LKR price list, so the migration preserves the
 * numeric values instead of inventing an exchange-rate conversion; replace them
 * with approved rupee amounts when the source price list is available.
 */
export const products: Product[] = [
  { id: 'aurelius', slug: 'aurelius-heritage-bear', name: 'The Aurelius Heritage Bear', price: 88, compareAt: 115, category: 'Teddy Bear Collection', color: 'Honey Caramel', image: images.bear, description: 'A grounded sensory instrument for softer rooms, slower evenings, and better hugs.', details: ['0.8 Denier Cloud Fleece', 'Weighted Micro-Glass Core', 'French Double-Lock Seams', 'Brass Ear-Stamp №'] },
  { id: 'celeste', slug: 'celeste-cloud-bunny', name: 'Celeste Cloud Bunny', price: 72, category: 'Soft Animal Friends', color: 'Cloud Cream', image: images.bunny, description: 'A quiet, cloud-soft companion with a little extra room for tenderness.', details: ['Hypoallergenic fibers', 'Hand-finished features', 'Lavender-safe lining'] },
  { id: 'oliver', slug: 'oliver-sleeping-sloth', name: 'Oliver Sleeping Sloth', price: 64, category: 'Soft Animal Friends', color: 'Oatmeal', image: images.sloth, description: 'The gentle reminder to take the long way home.', details: ['Weighted paws', 'Machine-safe finish', 'Calming tactile texture'] },
  { id: 'amour', slug: 'amour-velvet-heart-bear', name: 'Amour Velvet Heart Bear', price: 78, category: 'Love & Gifting', color: 'Rosewood', image: images.heart, description: 'A velvet-hearted keepsake for the person who makes every room warmer.', details: ['Velvet-touch outer', 'Gift inscription card', 'Keepsake presentation box'] },
];

export const findProduct = (slug: string) => products.find((product) => product.slug === slug) ?? products[0];

export function getProductVariants(product: Product): ProductVariant[] {
  const variants = product.variants?.filter((variant) => variant.active !== false);
  if (variants?.length) return variants;

  return [{
    id: `${product.id}-default`,
    color: product.color,
    image: product.image,
    images: [product.image],
    price: product.price,
    compareAt: product.compareAt,
  }];
}
