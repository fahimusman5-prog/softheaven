import { defineConfig, type IndexHtmlTransformContext } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [{ ...react(), transformIndexHtml(html: string, _context: IndexHtmlTransformContext) { const siteUrl = (process.env.VITE_SITE_URL || '').trim().replace(/\/$/, ''); return siteUrl ? html.replaceAll('href="/"', `href="${siteUrl}/"`).replaceAll('"url":"/"', `"url":"${siteUrl}/"`) : html; } }],
  css: { minify: false },
  server: { hmr: false },
});
