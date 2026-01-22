/**
 * Vite Build Configuration
 * 
 * Optimizes assets, bundles JavaScript, minifies CSS, and generates
 * production-ready files with cache-busting hashes.
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // Add other HTML pages as needed
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html'),
        gallery: resolve(__dirname, 'gallery.html'),
        events: resolve(__dirname, 'events.html'),
        workshops: resolve(__dirname, 'workshops.html'),
        displays: resolve(__dirname, 'displays.html'),
        capabilities: resolve(__dirname, 'capabilities.html'),
        team: resolve(__dirname, 'team.html'),
        policies: resolve(__dirname, 'policies.html'),
        tandcs: resolve(__dirname, 'tandcs.html'),
        'case-study-centuria-50th-birthday': resolve(__dirname, 'case-study-centuria-50th-birthday.html'),
        'case-study-centuria-connect140': resolve(__dirname, 'case-study-centuria-connect140.html'),
        'case-study-centuria-breast-cancer': resolve(__dirname, 'case-study-centuria-breast-cancer.html'),
        'case-study-hawaiian-forrestfield': resolve(__dirname, 'case-study-hawaiian-forrestfield.html'),
        'case-study-hawaiian-neighbourhood-nibbles': resolve(__dirname, 'case-study-hawaiian-neighbourhood-nibbles.html'),
        '404': resolve(__dirname, '404.html'),
      },
      output: {
        // Asset naming with hash for cache busting
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|webp|avif)$/.test(assetInfo.name)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          if (/\.css$/.test(assetInfo.name)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
    createHtmlPlugin({
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
      },
    }),
  ],
  css: {
    devSourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 4173,
    open: true,
  },
});
