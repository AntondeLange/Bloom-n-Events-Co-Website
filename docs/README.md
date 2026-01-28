# 🌸 Bloom'n Events Co Website
Professional event production + displays, built with Astro and React islands.

## Structure
- **Frontend (`astro/`)**: Static Astro build with shared layout, React islands for carousels and forms, and dedicated `/scripts` for nav, accordion, and video helpers.
- **Serverless (`api/`)**: Vercel functions for the contact form (validated, rate-limited, PII-safe) and supporting utilities (rateLimit, CORS, env). Keep secrets in `.env` or Vercel settings.
- **Chatbot backend (`backend/`)**: Separate Express + OpenAI proxy hosted via Railway or similar; not part of the static build but included for reference.

## Getting Started
1. `npm install` (root) installs the workspace and backend deps.
2. `npm run dev` / `npm run preview` / `npm run build` delegate to `astro/`.
3. `npm run lint` runs `astro check` (requires `@astrojs/check` + `typescript`).
4. `npm run clean` removes `astro/dist` for a fresh build.

## Documentation
- **Operational guide:** `docs/guide.md` consolidates performance, accessibility, image, security, validation, and design-system guidance in one place. It also references the static-only build strategy and required scripts.
- **Audit archive:** `docs/archive/phase-1-audit.md` retains the Phase 1 findings for historical context.

