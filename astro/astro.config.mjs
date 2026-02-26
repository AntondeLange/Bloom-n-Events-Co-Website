import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

export default defineConfig({
  adapter: vercel(),
  site: 'https://www.bloomneventsco.com.au',
  trailingSlash: 'never',
  compressHTML: true,
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [react()],
});
