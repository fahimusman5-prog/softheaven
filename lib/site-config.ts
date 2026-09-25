/**
 * Public contact points are intentionally kept in one place.
 *
 * The repository currently contains no verified phone, WhatsApp, Instagram,
 * Facebook, TikTok, or email destination, so those values stay null instead of becoming fake
 * public links. The About page falls back to the real contact route until the
 * brand supplies approved destinations.
 */
export const siteConfig = {
  brand: {
    name: 'ANTZ SoftHaven',
    location: 'Sri Lanka',
  },
  contact: {
    email: null as string | null,
    phone: null as string | null,
  },
  social: {
    whatsapp: null as string | null,
    instagram: null as string | null,
    facebook: null as string | null,
    tiktok: null as string | null,
  },
} as const;
