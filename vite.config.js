/**
 * Vite Build Configuration
 * Optimizes and bundles assets for production
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html'),
        gallery: resolve(__dirname, 'gallery.html'),
        events: resolve(__dirname, 'events.html'),
        workshops: resolve(__dirname, 'workshops.html'),
        displays: resolve(__dirname, 'displays.html'),
        capabilities: resolve(__dirname, 'capabilities.html'),
        team: resolve(__dirname, 'team.html'),
        tandcs: resolve(__dirname, 'tandcs.html'),
        policies: resolve(__dirname, 'policies.html'),
        '404': resolve(__dirname, '404.html'),
        'case-study-centuria-connect140': resolve(__dirname, 'case-study-centuria-connect140.html'),
        'case-study-hawaiian-forrestfield': resolve(__dirname, 'case-study-hawaiian-forrestfield.html'),
        'case-study-hawaiian-neighbourhood-nibbles': resolve(__dirname, 'case-study-hawaiian-neighbourhood-nibbles.html'),
        'case-study-centuria-50th-birthday': resolve(__dirname, 'case-study-centuria-50th-birthday.html'),
        'case-study-centuria-breast-cancer': resolve(__dirname, 'case-study-centuria-breast-cancer.html')
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    cssCodeSplit: false,
    assetsInlineLimit: 4096
  },
  plugins: [
    createHtmlPlugin({
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './assets')
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
