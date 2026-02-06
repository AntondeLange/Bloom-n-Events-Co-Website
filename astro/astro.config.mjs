// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  // Marketing site: maximize CDN caching, reduce server/runtime work.
  output: "static",
  // Reduce HTML bytes over the wire.
  compressHTML: true,

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react()],
});
