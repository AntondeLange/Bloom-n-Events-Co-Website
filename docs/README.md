# 🌸 Bloom'n Events Co Website
Professional event production + displays, built with Astro and React islands.

## Structure
- **Frontend (`astro/`)**: Astro pages with React islands for interactive components and dedicated `/scripts` helpers.
- **Serverless API (`astro/src/pages/api`)**: Vercel-routed Astro endpoints for contact/chat/health with CORS, env loading, and rate limiting utilities.
- **Chatbot backend (`backend/`)**: Separate Express + OpenAI proxy hosted via Railway or similar; retained as a parallel deployment path/reference.

## Getting Started
1. `npm install` (root) installs the workspace and backend deps.
2. `npm run dev` / `npm run preview` / `npm run build` delegate to `astro/`.
3. `npm run lint` runs `astro check` (requires `@astrojs/check` + `typescript`).
4. `npm run clean` removes `astro/dist` for a fresh build.

## Documentation
- **Operational guide:** `docs/guide.md` consolidates performance, accessibility, image, security, validation, and design-system guidance in one place.
- **Audit archive:** `docs/archive/phase-1-audit.md` retains the Phase 1 findings for historical context.
