/**
 * PostCSS Configuration
 * 
 * Processes CSS with autoprefixer and cssnano for production builds
 */

export default {
  plugins: {
    autoprefixer: {},
    cssnano: {
      preset: ['default', {
        discardComments: {
          removeAll: true,
        },
        normalizeWhitespace: true,
      }],
    },
  },
};
