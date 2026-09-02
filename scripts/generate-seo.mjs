import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const siteUrl = (process.env.VITE_SITE_URL || process.env.SITE_URL || '').trim().replace(/\/$/, '');
const publicDir = join(process.cwd(), 'public');
mkdirSync(publicDir, { recursive: true });
const paths = ['/', '/shop', '/collections', '/about', '/contact', '/shipping', '/returns', '/privacy', '/terms'];
const sitemap = siteUrl && /^https:\/\//i.test(siteUrl)
  ? `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${siteUrl}${path}</loc></url>`).join('')}</urlset>`
  : '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" />';
const robots = `User-agent: *\nAllow: /\nDisallow: /checkout\nDisallow: /order-confirmed\nDisallow: /admin\n${siteUrl && /^https:\/\//i.test(siteUrl) ? `Sitemap: ${siteUrl}/sitemap.xml\n` : ''}`;
writeFileSync(join(publicDir, 'sitemap.xml'), sitemap + '\n');
writeFileSync(join(publicDir, 'robots.txt'), robots);
