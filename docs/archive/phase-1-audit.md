# Phase 1 Audit Snapshot

## Purpose
Captured during the first audit pass (January 2026) to document the production site architecture, outstanding risks, and remediation steps. This file is an archival summary, not an active operations guide.

## Key Observations
- **Static Astro build** with React islands for carousels/sticky CTA/contact form and lightweight `/scripts/*.js` helpers. Navigation is managed via `HomeNavbar` plus `navbar.js`/`anchor-nav.js`.
- **Security/Compliance**: `vercel.json` enforces HSTS, frame, and XSS headers; serverless contact API validates inputs, rate-limits submissions, and logs only sanitized metadata.
- **Performance**: Hero video is large but deferred via metadata-only preload and prefers-reduced-motion guards. All success stories/testimonial/video components defer to `client:idle` hydration.
- **Outstanding Risks**: hero 100svh layout on small screens, Sticky CTA occlusion, heavy React runtime, redundant legacy assets (`assets/js`, `assets/css`, `tmp/`), and leftover documentation now merged.
- **Phase 1 deliverables**: removed legacy assets/docs, added repo-level scripts (`npm run build/test/lint`), enforced sanitized logging for contact form.

