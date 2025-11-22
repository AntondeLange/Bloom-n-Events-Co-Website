# Caching Headers Configuration

## For Static Site Hosting (Vercel, Netlify, GitHub Pages)

Since this is a static site, caching headers are typically set by the hosting provider. However, you can configure them:

### Vercel Configuration

Create a `vercel.json` file in the root:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    },
    {
      "source": "/images/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)\\.(css|js)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)\\.(html)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, must-revalidate"
        }
      ]
    },
    {
      "source": "/(.*)\\.(svg|png|jpg|jpeg|gif|webp|ico)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Netlify Configuration

Create a `_headers` file in the root or `public` directory:

```
# HTML files - 1 hour cache
/*.html
  Cache-Control: public, max-age=3600, must-revalidate

# CSS and JS - 1 year cache
/*.css
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000, immutable

# Images - 1 year cache
/images/*
  Cache-Control: public, max-age=31536000, immutable

/*.svg
  Cache-Control: public, max-age=31536000, immutable

/*.png
  Cache-Control: public, max-age=31536000, immutable

/*.jpg
  Cache-Control: public, max-age=31536000, immutable

/*.webp
  Cache-Control: public, max-age=31536000, immutable
```

### GitHub Pages

GitHub Pages doesn't support custom headers easily. Consider using:
- Cloudflare Pages (supports headers)
- Vercel (recommended)
- Netlify

### CDN Configuration

If using Cloudflare or similar CDN:
- Enable "Browser Cache TTL" for static assets
- Set HTML to "Respect Existing Headers"
- Enable "Auto Minify" for CSS/JS

### Recommended Cache Strategy

- **HTML**: 1 hour (needs to be fresh for content updates)
- **CSS/JS**: 1 year (versioned files, immutable)
- **Images**: 1 year (immutable, use versioned filenames if updating)
- **Fonts**: 1 year (immutable)

### Cache Busting

For files that change frequently:
1. Use versioned filenames (e.g., `styles-v2.css`)
2. Add query parameters (e.g., `?v=2`)
3. Use service worker for version management

### Testing

After deployment, verify headers:
```bash
curl -I https://your-domain.com/styles.css
curl -I https://your-domain.com/images/logo.png
```

