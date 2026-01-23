/**
 * PostCSS Configuration
 * Processes CSS with autoprefixer and cssnano
 */

export default {
  plugins: {
    autoprefixer: {},
    cssnano: {
      preset: ['default', {
        discardComments: {
          removeAll: true
        }
      }]
    }
  }
};
