# Operational Guide

### Overview
- **Architecture**: Static Astro build with Tailwind + React islands; `BaseLayout` wires navbar/footer/SEO and inlines only the required scripts (`accordion.js`, `navbar.js`, `anchor-nav.js`, `hero-video.js`).
- **Routes**: `index`, `about`, `events`, `workshops`, `displays`, `capabilities`, gallery/case studies, `team`, `contact`, `policies`, `tandcs` — all pre-rendered and hydrated with client islands only where interactivity is needed.
- **APIs**: `api/contact` handles form submissions with validation, honeypot, rate limiting, and sanitized logging; `backend/` hosts the chatbot proxy (OpenAI) for separate deployments.

### Performance & Core Web Vitals
- **Hero-focused media**: The homepage loads a 1920×1080 video, so we rely on `preload=metadata`, `prefers-reduced-motion`, and the option to fall back to the poster when autoplay is blocked.
- **React islands**: Keep `client:idle` for `StickyMobileCTA`, `SuccessStoriesCarousel`, `TestimonialsCarousel`, `AboutImageCarousel`, and the `ContactForm`. The shared React runtime (~186 KB gzip) is the biggest JS cost, so avoid adding extra islands unless necessary.
- **Scripts & fonts**: Load Google Fonts with `display=swap`, bootstrap icons via CDN with integrity, and keep all site-specific JS in `/scripts` to stay CSP-compatible.
- **Optimization checks**: `npm run build` should succeed; `npm run lint` runs `astro check` (requires `@astrojs/check` + `typescript`).

### Accessibility & Interaction
- **Semantic structure**: Each page has `main`, `section`, and heading landmarks; nav uses `aria-label` and dynamic classes to signal active states.
- **Forms**: React contact form validates client-side, shows accessible alerts, traps focus inside the modal, and returns focus to the submit button after errors.
- **Motion**: Carousels respect `prefers-reduced-motion` by pausing auto-advance and skipping animations in reduced-motion mode.
- **Keyboard work**: Dropdowns and carousels expose `aria-controls`/`aria-label`s plus `focus` states handled via small helper scripts.

### Image & Media Strategy
- **Hero video**: Always accompany the loop with an `img` fallback, `poster`, and `autoplay` guard for reduced motion/theater.
- **Carousels/portfolios**: Deliver responsive `srcset`/`sizes` for every slide (see `gallery`, `about`, case studies). Keep `loading=lazy`, `decoding=async`, and `width`/`height` attributes for layout stability.
- **Contact hero**: Use `object-fit: cover`, position background layers carefully to avoid painting cost on mobile (avoid `background-attachment: fixed` below 992px).

### Security & Compliance
- **Headers**: `vercel.json` enforces HSTS, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, and a restrictive Permissions-Policy.
- **CSP**: Added `Content-Security-Policy` in Vercel headers (default 'self', inline script/style allowances, fonts from Google, connects to OpenAI/GA, frames for Facebook/widgets). Inline JSON-LD scripts remain marked `is:inline`, so the policy stays functional without `unsafe-inline` for the rest of the site.
- **API hygiene**: `api/contact` uses `escapeHtml` for email payloads, rate limiting, and sanitizes logs (no PII). Always keep SMTP creds outside git and prefer `getEnv` helpers.
- **CSP**: Scripts live outside HTML where possible; for inline JSON-LD, explicitly mark with `is:inline` to satisfy Astro’s lint hints.

### Validation & Spam Defense
- **Client/server validation parity**: The React form enforces required fields, length limits, and email format; the server repeats the checks via `validateContactForm`.
- **Honeypot + rate limit**: The hidden `website` input traps bots; server-side rate limiter allows five submissions per 15m per IP with retry headers.

### Design Tokens & Patterns
- `global.css` defines custom properties (`--color-gold`, `--color-charcoal`, `--color-champers`, `--font-display`, `--font-sans`) plus reusable classes (`.btn-gold`, `.hero-cta`, `.anchor-nav`, `.sticky-mobile-cta`). Keep any changes centralized here and add new tokens with clear names.
- Use Tailwind utilities only when the class names match the design system (e.g., `max-w-7xl`, `px-4`, `gap-4`). Reserve bespoke utilities for component-specific overrides.

### Deployment & Testing
- Root scripts (`npm run dev/preview/build/lint/check`) delegate to `astro/` workspace. `clean` removes `astro/dist` to guarantee fresh builds.
- Always run `npm run lint` before merging to catch unused props or missing `is:inline` directives; build output should remain static-only.
- After updates, verify hero nav behavior, sticky CTA visibility, and contact form submission manually in Chrome’s mobile emulator (320–375px + tablets).

## Launch Verification Checklist

1. **Build & type safety**  
   - `npm run build` → successful static output (no warnings).  
   - `npm run lint` / `astro check` run clean (already run per phase).  
2. **Repo hygiene**  
   - `git status` reports only tracked source changes (no generated junk).  
   - `rg -n "assets/js|assets/css|PHASE|RESPONSIVE|AUDIT" .` returns only historical doc references that were cleaned; no active code references remain.  
3. **Serverless/API safety**  
   - `POST /api/contact` (simulated via node) validates data, rate-limits apply, and logs only metadata (request ID / timestamp / error category).  
4. **Responsive verification**  
   - Hero height capped on narrow screens, sticky CTA adds padding at bottom, and contact page uses scalable spacing per viewport breakpoints.  
5. **Accessibility functional checks**  
   - Keyboard nav works with visible focus states; contact form modal traps focus and restores it after closing; reduced-motion respects user settings.  
6. **Performance sanity check**  
   - Carousels hydrate on `client:visible`, hero video only loads as metadata, sticky nav/CTA transitions remain stable; React runtime only loads when islands render.  
7. **SEO/indexability**  
   - `robots.txt`, `sitemap.xml`, and canonical/JSON-LD tags exist; structured data scripts marked `is:inline`.  
8. **Security headers & CSP**  
   - `vercel.json` enforces HSTS, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy, and CSP (no broad `unsafe-inline` beyond the inline JSON-LD it allows).  
