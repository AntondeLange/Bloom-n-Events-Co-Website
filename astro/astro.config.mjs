// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
  site: 'https://www.bloomneventsco.com.au',
  trailingSlash: 'never',
  // Reduce HTML bytes over the wire.
  compressHTML: true,

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react()],
});
