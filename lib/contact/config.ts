import { z } from 'zod';

type PublicSettings = Record<string, Record<string, unknown>>;
export type ContactConfig = {
  displayName: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  supportHours: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
};
/** Only the store's configured public settings are used. No invented fallbacks. */
export type ContactOverrides = { whatsappNumber?: string; facebookUrl?: string; instagramUrl?: string; tiktokUrl?: string };
export function getContactConfig(settings: PublicSettings, overrides: ContactOverrides = {}): ContactConfig {
  const email = z.email().safeParse(settings.general?.email);
  const rawPhone = typeof settings.general?.phone === 'string' ? settings.general.phone.trim() : '';
  const phone = /^\+?[\d\s().-]{7,30}$/.test(rawPhone) && rawPhone.replace(/\D/g, '').length >= 7 && rawPhone.replace(/\D/g, '').length <= 15 ? rawPhone : null;
  let whatsapp: string | null = null;
  try {
    const number = overrides.whatsappNumber?.trim().replace(/^\+/, '');
    const url = new URL(number ? `https://wa.me/${number}` : String(settings.social?.whatsapp ?? ''));
    if (url.protocol === 'https:' && !url.username && !url.password && (url.hostname === 'wa.me' || url.hostname === 'api.whatsapp.com') &&
      (/^\/[1-9]\d{6,14}\/?$/.test(url.pathname) || (url.hostname === 'api.whatsapp.com' && /^\+?[1-9]\d{6,14}$/.test(url.searchParams.get('phone') ?? '')))) whatsapp = url.href;
  } catch { /* Missing or invalid destinations remain unpublished. */ }
  function social(value: unknown, hosts: string[]) {
    try { const url = new URL(String(value ?? '')); return url.protocol === 'https:' && !url.username && !url.password && hosts.includes(url.hostname) ? url.href : null; } catch { return null; }
  }
  return { facebook: social(overrides.facebookUrl || settings.social?.facebook, ['facebook.com', 'www.facebook.com', 'm.facebook.com']), instagram: social(overrides.instagramUrl || settings.social?.instagram, ['instagram.com', 'www.instagram.com']), tiktok: social(overrides.tiktokUrl || settings.social?.tiktok, ['tiktok.com', 'www.tiktok.com']), displayName: 'SoftHaven Sri Lanka', email: email.success ? email.data : null, phone, whatsapp, supportHours: null };
}
