import { defineConfig, type IndexHtmlTransformContext } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [{ ...react(), transformIndexHtml(html: string, _context: IndexHtmlTransformContext) { const siteUrl = (process.env.VITE_SITE_URL || process.env.SITE_URL || '').trim().replace(/\/$/, ''); return siteUrl ? html.replaceAll('__SITE_URL__', siteUrl) : html.replace(/\s*<link data-site-canonical rel="canonical" href="__SITE_URL__\/" \/>/, '').replace(',"url":"__SITE_URL__/"', ''); } }],
  css: { minify: false },
  server: { hmr: false },
});
