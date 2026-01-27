# Bloom'n Events Co – Technical Overhaul Report

**Date:** January 2026  
**Scope:** Full front-end/back-end review, responsiveness, performance, security, codebase cleanup  
**Target:** https://www.bloomneventsco.com.au/

---

## Executive Summary

The site has a solid base (Bootstrap 5, Vite, design tokens, semantic HTML) but several issues affect security, performance, accessibility, and maintainability. This report groups findings by category, with proposed fixes and code-level recommendations.

---

## 1. Front-End & Back-End Review

### 1.1 HTML / Markup

| Issue | Severity | Location | Recommendation |
|-------|----------|----------|----------------|
| **Duplicate preload** | Low | `index.html` L90, L94 | Same `logo-wht.png` preloaded twice. Remove one. |
| **Cache-Control meta in `<head>`** | Medium | All pages | `no-cache, no-store, must-revalidate` on every page hurts repeat visits. Prefer HTTP headers (e.g. short max-age for HTML, longer for static assets) and remove meta. |
| **CSP in `<meta>`** | Medium | All pages | CSP in meta has limitations (no `report-uri`, etc.). Prefer HTTP headers only (Vercel `.headers` / `vercel.json`). Remove meta CSP to avoid duplication. |
| **Inconsistent OG/schema image paths** | High | about, contact, structured data | `og:image` and `logo` use `images/logo-wht.png`; actual path is `assets/images/logo-wht.png`. Fix to `https://www.bloomneventsco.com.au/assets/images/logo-wht.png`. |
| **Missing skip-link** | Medium | 404.html, all case-study-*.html | Add `<a href="#main-content" class="skip-link">Skip to main content</a>` and ensure `id="main-content"` on `<main>`. |
| **Redundant `mt-5 mt-5-extra`** | Low | index.html "Why Us" CTA | Use a single spacing class. |
| **Contact form missing honeypot** | High | contact.html, contact-form.js | Backend expects `website` honeypot; form doesn’t send it. Add hidden `website` field, exclude from submission payload, use for bot detection. |

### 1.2 CSS

| Issue | Severity | Location | Recommendation |
|-------|----------|----------|----------------|
| **main.css size** | Medium | `assets/css/main.css` | ~9.3k lines, ~232 KB. Contains tokens, motion, base, components, utilities. Split by concern, use PurgeCSS (or similar) in build, and ensure only used styles ship. |
| **`!important` overuse** | Low | main.css, legacy | e.g. `overflow-x: visible !important`. Prefer specificity and refactors to avoid `!important`. |
| **Breakpoints** | Info | tokens.css, main.css | Breakpoints 576, 768, 992, 1200, 1400 px align with Bootstrap. Use `--breakpoint-*` tokens consistently. |

### 1.3 JavaScript

| Issue | Severity | Location | Recommendation |
|-------|----------|----------|----------------|
| **cache-clear.js blocking** | Medium | index.html | Loaded without `defer`. Runs sync + async cache logic. Use `defer` so it doesn’t block parsing. |
| **Inline gtag / analytics** | High | about, contact, gallery, events, etc. | Only `index.html` uses `analytics-init.js`. Others use inline gtag. Inline scripts conflict with strict CSP (no `unsafe-inline`). Move all analytics to `analytics-init.js` and load it on every page. |
| **Contact form API URL** | Medium | contact-form.js | Hardcodes Railway URL. Use shared config (e.g. `getBackendUrl` / `getContactApiUrl`) so production can use same-origin `/api/contact` (Vercel) or configurable backend. |
| **Message length mismatch** | Medium | contact-form vs api/backend | Client: 10–200 chars; API: 10–2000. Align (e.g. 10–2000) and enforce both client- and server-side. |
| **config.js `getApiUrl`** | Low | config.js | Uses `CHAT_ENDPOINT`; no `getContactApiUrl`. Add `getContactApiUrl` for contact form. |

### 1.4 Accessibility

| Issue | Severity | Location | Recommendation |
|-------|----------|----------|----------------|
| **Skip-link missing** | Medium | 404, case-study-* | Add skip-link and `#main-content` as above. |
| **Navbar toggle** | Info | All | Uses `aria-label="Toggle navigation"`, `aria-controls`, `aria-expanded`. Ensure `aria-expanded` is updated on open/close. |
| **Focus styles** | Info | tokens.css | `--color-focus`, `--color-focus-ring` defined. Verify visible focus on all interactive elements. |
| **Footer accordions** | Low | Index vs others | Index uses `data-bs-parent=".footer-accordion-column"`; case studies use `#footer-accordion-container`. Unify to avoid behaviour differences. |

### 1.5 SEO & Metadata

| Issue | Severity | Location | Recommendation |
|-------|----------|----------|----------------|
| **OG/schema image paths** | High | about, contact, LD+JSON | Use `assets/images/logo-wht.png` (absolute). |
| **Heading hierarchy** | Info | Various | Ensure single `<h1>` per page, logical `<h2>` → `<h3>` order. |
| **Meta descriptions** | Info | All | Unique per page, <160 chars. Already in place; keep audited. |

---

## 2. Responsiveness & UX

### 2.1 Breakpoints

- **1200 px:** Desktop; section padding `clamp(80px, 10vw, 120px)`.
- **992 px:** Small desktop/tablet; padding `clamp(40px, 8vw, 80px)`.
- **768 px:** Tablet; padding `clamp(20px, 5vw, 40px)`, `scroll-behavior: auto`.
- **576 px:** Mobile; container padding `1rem`, carousel breakout.

Layout and grids use Bootstrap; section padding uses `clamp()` appropriately.

### 2.2 Mobile Menu

- Navbar uses `navbar-expand-lg`, `collapse`, `navbar-toggler`; collapses below 992 px.
- Toggle has `aria-label`, `aria-controls`, `aria-expanded`. Ensure JS updates `aria-expanded` when menu opens/closes (Bootstrap does this if markup is correct).

### 2.3 Typography

Use design tokens and responsive scales, e.g.:

```css
/* Example: responsive heading */
.content-heading-large {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
}
```

`tokens.css` already defines `--font-size-*-responsive`; apply these to headings and body where appropriate.

### 2.4 Responsive Images

- **Current:** Many `<img>` use `loading="lazy"`, `decoding="async"`, `width`/`height`. Gallery uses `srcset`/`sizes` on some images; many do not.
- **Recommendation:** Use `srcset` and `sizes` for content images. Example:

```html
<img
  src="assets/images/example.jpg"
  srcset="assets/images/example-480w.jpg 480w,
          assets/images/example-768w.jpg 768w,
          assets/images/example-1200w.jpg 1200w"
  sizes="(max-width: 576px) 100vw, (max-width: 992px) 100vw, 50vw"
  alt="..."
  loading="lazy"
  decoding="async"
  width="1200"
  height="900"
>
```

- Run `npm run optimize-images` and `npm run update-srcset` (or equivalent) to generate variants and wire them up.
- Use `<picture>` with WebP/AVIF where possible (see IMAGE_OPTIMIZATION_GUIDE.md).

---

## 3. Performance & Optimisation

### 3.1 Images

| Issue | Severity | Recommendation |
|-------|----------|----------------|
| **Large originals** | High | Many multi‑MB JPG/PNG in dist. Compress (e.g. Sharp, ImageOptim), generate 480/768/1200/1600 variants. |
| **butterfly-icon.svg** | High | ~443 KB; likely embedded bitmap. Replace with minimal SVG or small PNG. |
| **Hero video** | Medium | `bloomn-hero.mp4` ~31 MB. Use `preload="metadata"`, poster, consider shorter or lower‑res variant for mobile. |
| **WebP/AVIF** | Medium | Use `npm run optimize-images`; serve via `<picture>` with fallback. |
| **Lazy loading** | Info | `loading="lazy"` used; ensure above‑the‑fold hero/logo use `loading="eager"` or omit. |

### 3.2 Scripts & CSS

| Issue | Severity | Recommendation |
|-------|----------|----------------|
| **Render-blocking** | Medium | `cache-clear.js` without `defer`. Add `defer`. Load non‑critical JS with `defer` or `async`. |
| **Bootstrap + main.css** | Medium | Main CSS ~232 KB. Consider critical CSS inline, async load for rest; PurgeCSS to drop unused rules. |
| **GSAP** | Low | Loaded from CDN with `defer`. OK; ensure used only where needed. |

### 3.3 Caching & Hashing

- **Service worker:** `sw.js` uses cache versioning; `cache-clear.js` aligned. Ensure cache version bumped on releases.
- **Build:** Vite hashes assets. Confirm `Cache-Control` headers for `/assets/*` use long max‑age with immutable.

### 3.4 Core Web Vitals

- **LCP:** Optimise hero image/video, preload key assets, reduce main-thread work.
- **INP/CLS:** Avoid layout shifts (explicit `width`/`height` on images, reserve space for async content).
- **Lighthouse:** Run regularly (e.g. CI) via `lighthouse.yml`; fix regressions.

---

## 4. Security Hardening

### 4.1 Headers (Vercel)

`vercel.json` already sets:

- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`

**Recommendations:**

- Add `X-XSS-Protection: 1; mode=block` (legacy but harmless).
- Remove CSP from HTML `<meta>`; use only HTTP headers to avoid duplication and leverage `report-uri` / `report-to` if needed.
- Ensure CSP includes `formsubmit.co` and `form-action` if form posts there.

### 4.2 Backend / API

| Issue | Severity | Location | Recommendation |
|-------|----------|----------|----------------|
| **Email HTML injection** | High | `api/contact.js`, `backend/.../contact.js` | User input (name, message, etc.) inserted into HTML without escaping. Escape (e.g. replace `&`, `<`, `>`, `"`, `'`) or use a template API. |
| **Honeypot** | High | Contact form | Add `website` honeypot; validate server-side and silently reject when set. |
| **Rate limiting** | Info | api/contact, api/chat | In-memory rate limiting; per-instance. For multi-instance deployments, use Redis or similar. |
| **CORS** | Info | api/_utils/cors.js | Origins from env; production restrict to site domain(s). |

### 4.3 Cookies

- Cookie consent uses `localStorage` and `document.cookie` with `SameSite=Strict` and `Secure` when on HTTPS.
- **Note:** `HttpOnly` cannot be set via `document.cookie`; only server-set cookies support it. For consent, client-side storage is acceptable; ensure no sensitive data is stored.

### 4.4 Dependencies

- Run `npm audit` and fix moderate/high/critical issues.
- Keep `vite`, `bootstrap`, `sharp`, etc. up to date.

---

## 5. Codebase Cleanup & Structure

### 5.1 Redundant / Unused

- **Scripts:** Multiple `fix-*`, `update-*` image scripts. Consolidate or remove obsolete ones; keep `optimize-images`, `update-srcset` (or single pipeline).
- **CSS:** `base.css`, `components.css`, `utilities.css`, `legacy.css` exist; `main.css` imports only `tokens.css` and `motion.css`. Either import the rest in `main.css` or remove unused files.
- **Duplicate logic:** Analytics init, font loading, etc. duplicated across pages. Centralise in shared JS and include everywhere.

### 5.2 Obsolete Artefacts

Consider archiving or removing if no longer needed:

- `docs/CSP_REMOVAL_GUIDE.md` (once CSP is fully header-based and inline removed).
- `REFACTORING_REPORT.md`, `IMPLEMENTATION_SUMMARY.md` (fold into README or discard).
- `assets/js/README-CSP.md` (integrate into main docs).
- Redundant `fix-*` / `update-*` scripts after consolidation.

**Do not remove:** README, DESIGN_SYSTEM, PERFORMANCE_OPTIMIZATION, IMAGE_OPTIMIZATION_GUIDE, TESTING_CHECKLIST, DEPLOYMENT, VERCEL_DEPLOYMENT, SECURITY_HEADERS, VALIDATION_PATTERNS, ACCESSIBILITY_IMPROVEMENTS, IMPLEMENTATION_GUIDE, backend/docs.

### 5.3 Suggested Folder Structure

```
/
├── api/                 # Vercel serverless (contact, chat, health)
├── backend/             # Optional Express/Railway backend
├── assets/
│   ├── css/             # tokens, base, components, utilities, main
│   ├── js/              # config, analytics-init, contact-form, main, etc.
│   ├── images/          # Source images; optimized output per pipeline
│   └── partials/        # Navbar, footer snippets if used
├── scripts/             # Build-time: optimize-images, update-srcset, etc.
├── docs/                # Developer and ops documentation
├── .github/workflows/   # CI (deploy, lighthouse, cache, etc.)
├── *.html               # Pages
├── vite.config.js
├── vercel.json
├── sw.js
└── package.json
```

### 5.4 Build Pipeline

- **Vite:** Already used for build; multi-page via `rollupOptions.input`. Keep.
- **PostCSS:** Autoprefixer, cssnano. Keep.
- **Optional:** PurgeCSS, bundle analyser; image optimisation in CI (e.g. `optimize-images`).
- **Deploy:** Vercel (or existing setup). Ensure env vars (e.g. `OPENAI_API_KEY`, SMTP) are set.

---

## 6. Deliverables Checklist

- [x] **Report:** This document.
- [x] **Code changes:** Applied fixes for duplicate preload, cache-clear `defer`, skip-links, honeypot, OG/schema paths, contact API config, email escaping, X-XSS-Protection, cache-clear error logging.
- [ ] **Removal summary:** See §6.1 below; execute after review.
- [ ] **Folder structure:** Align repo with §5.3 when cleaning up.
- [x] **Tooling:** See §7.

### 6.1 Files Changed (Implemented)

| File | Changes |
|------|---------|
| `index.html` | Removed duplicate preload for `logo-wht.png`; added `defer` to `cache-clear.js`; removed redundant `mt-5-extra`. |
| `about.html` | Fixed `og:image`, `twitter:image`, and LD+JSON `logo` to `assets/images/logo-wht.png`. |
| `contact.html` | Fixed `og:image`, `twitter:image`, LD+JSON `image`; added honeypot `website` field; contact-form script `type="module"`. |
| `404.html` | Added skip-link, `main id="main-content"`; fixed OG/twitter image paths. |
| `case-study-*.html` (5 files) | Added skip-link and `main id="main-content"` to all. |
| `assets/js/config.js` | Added `getContactApiUrl()` for contact form. |
| `assets/js/contact-form.js` | Now ES module; uses `getContactApiUrl`, sends `website` honeypot. |
| `assets/js/cache-clear.js` | Replaced silent `catch` with `console.warn`. |
| `api/contact.js` | Added `escapeHtml`; escape all user input in HTML email; `website` in validation. |
| `backend/src/routes/contact.js` | Added `escapeHtml`; escape user input in HTML email. |
| `vercel.json` | Added `X-XSS-Protection: 1; mode=block`. |

### 6.2 Suggested Files to Remove (After Review)

| File(s) | Rationale |
|--------|-----------|
| `scripts/fix-image-paths.js`, `fix-all-image-paths.js`, `fix-picture-elements.js`, `update-html-images.js`, `update-images-html.js` | One-off migration scripts; keep only `optimize-images`, `update-images-srcset`, `generate-srcset` if still used. |
| `assets/js/update-csp.js`, `assets/js/csp-config.js`, `README-CSP.md` | CSP now in headers; remove if unused. |
| `REFACTORING_REPORT.md`, `IMPLEMENTATION_SUMMARY.md` | Redundant with this report and README; archive or delete. |
| `docs/CSP_REMOVAL_GUIDE.md` | Superseded once inline scripts removed; keep until analytics consolidation done. |

---

## 7. Testing & Ongoing Checks

| Area | Tool / Workflow |
|------|------------------|
| **Responsiveness** | Chrome DevTools device modes (375, 768, 992, 1200 px); visual checks. |
| **Performance** | Lighthouse (CI via `.github/workflows/lighthouse.yml` + manual); PageSpeed Insights. |
| **Accessibility** | axe DevTools, WAVE; `npm run check-accessibility`; keyboard nav and screen reader spot-checks. |
| **Security headers** | securityheaders.com; Mozilla Observatory. |
| **Links / SEO** | Check internal links, canonicals, sitemap, robots.txt. |

### 7.1 Recommended CI Additions

- **Lighthouse:** Already in `lighthouse.yml`; ensure it runs on PRs.
- **Accessibility:** Run `npm run check-accessibility` in CI.
- **Dependencies:** `npm audit` (or `npm run audit-deps`) in CI; fail on high/critical.
- **Images:** Run `npm run optimize-images` (and optionally `update-srcset`) before build or in a scheduled workflow.
- **Lint:** `npm run lint-css`; consider ESLint for JS.

### 7.2 Build Pipeline (Current)

- **Vite** build; PostCSS (autoprefixer, cssnano); multi-page HTML; asset hashing.
- **Deploy:** Vercel (or existing setup). Ensure `api/` serverless and env vars (SMTP, `OPENAI_API_KEY`, etc.) are configured.

---

*End of report.*
