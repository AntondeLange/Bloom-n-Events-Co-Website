# Bloom'n Events Co Performance Audit (Local Build)

## Stack & Hosting
- Framework: Astro 5 static site with React islands.
- Hosting target: Vercel (see `vercel.json`) with static output in `astro/dist`.

## Measurement Method
- Lighthouse/PSI could not be executed from this environment (no networked browser access).
- A local asset audit was run from the built HTML to estimate request counts and transfer sizes.
- Raw tables are in `docs/perf-audit-baseline.md` and `docs/perf-audit-after.md`.

## Baseline (Local Asset Audit)
See `docs/perf-audit-baseline.md`.

## After (Local Asset Audit)
See `docs/perf-audit-after.md`.

## Transfer Size Reduction (Local, Uncompressed)
- `/`: 30.81 → 1.48 MB (‑95.2%)
- `/about/`: 53.90 → 10.71 MB (‑80.1%)
- `/capabilities/`: 6.91 → 2.47 MB (‑64.2%)
- `/events/`: 16.88 → 2.04 MB (‑87.9%)
- `/gallery/`: 42.76 → 8.01 MB (‑81.3%)
- `/contact/`: 1.97 → 0.40 MB (‑79.8%)

## Baseline Bottlenecks (Observed)
- Hero video (~30 MB) referenced on home.
- Multiple 3–4 MB JPEGs in gallery/case studies.
- Render‑blocking Google Fonts + Bootstrap Icons CSS.
- Large background image applied site‑wide.

## Fixes Implemented
- Image pipeline with responsive JPEG/PNG, plus AVIF/WebP variants and stripped metadata.
- `srcset` + `sizes` across primary templates and carousels.
- Hero/LCP images: eager + `fetchpriority=high` and scoped preload only.
- Carousel images: first slide prioritized; others lazy.
- Hero video deferred until idle, preventing initial 30 MB transfer.
- Async stylesheet loading for Google Fonts and Bootstrap Icons (no render‑blocking).
- Cache headers for immutable assets + short cache for HTML in `vercel.json`.
- Canonical routing with `.html` redirects, canonical tags, and sitemap alignment.

## CWV/Lighthouse Status
- Lighthouse/PSI not run in this environment.
- Use the commands below after deployment to verify LCP/INP/CLS targets.

### Recommended Lighthouse/PSI Commands
```bash
# Local build (requires Chrome)
npx lighthouse https://www.bloomneventsco.com.au/ --form-factor=mobile --only-categories=performance --output=html --output-path=./lighthouse-home-mobile.html

# Repeat for:
# /about, /capabilities, /events, /gallery, /contact
```

## Automated Checks Added
- `node scripts/perf-audit-local.mjs` (local asset audit)
- `node scripts/perf-budget.mjs` (budget thresholds)
- `node scripts/check-links.mjs` (broken local links)
- `node scripts/check-seo.mjs` (canonical + .html checks)

## Rollback & Deploy Plan
- Rollback: revert `vercel.json`, `astro/src/layouts/BaseLayout.astro`, `astro/src/components/OptimizedImage.astro`, `astro/src/components/react/OptimizedImage.tsx`, and generated image variants under `astro/public/assets/images/*-w.*`.
- Deploy: build locally, run `npm run perf:audit`, `npm run perf:budget`, `npm run seo:check`, `npm run links:check`, then deploy to staging → production.
