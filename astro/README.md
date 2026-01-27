# Bloom'n Events Co – Astro site

Static-first marketing site: **Astro**, **Tailwind CSS**, **TypeScript**. React is used only for the contact form (client-side validation, submit, focus).

## Structure

```
src/
├── components/
│   ├── Header.astro, Footer.astro, Seo.astro   # Astro only
│   └── react/
│       └── ContactForm.tsx                     # React island (client:idle)
├── layouts/
│   └── BaseLayout.astro                        # Global CSS, SEO, skip link, header/footer
├── lib/
│   ├── constants.ts                            # Site name, base URL, contact info
│   └── seo.ts                                  # SEO helpers
├── pages/
│   ├── index.astro, about.astro, contact.astro
│   └── (future: gallery, case-studies, etc.)
└── styles/
    └── global.css                              # Tailwind + @theme design tokens
```

## Commands

| Command           | Action                          |
| ----------------- | ------------------------------- |
| `npm run dev`     | Dev server at `localhost:4321`  |
| `npm run build`   | Static build → `dist/`          |
| `npm run preview` | Preview production build        |

## Design system

Colors, fonts, and spacing live in `src/styles/global.css` via Tailwind v4 `@theme`:

- **Colors:** `gold`, `charcoal`, `champers`, `blush`, `cream`
- **Fonts:** Dancing Script (display), Montserrat (body)

## Contact form & API

The form submits to `POST /api/contact`. You must provide this endpoint via your host:

- **Vercel:** add `api/contact.js` (or `pages/api/contact.ts`) as a serverless function.
- **Netlify:** add `netlify/functions/contact.ts` (or form submission).

Request body: `{ firstName, lastName, email, phone, company, message, website }`. `website` is a honeypot; reject submissions where it is non-empty.

## SEO

Every page uses `BaseLayout` with `title`, `description`, and `path`. `Seo.astro` outputs canonical, OG, and Twitter meta tags. Set `SITE.baseUrl` in `src/lib/constants.ts` for your production domain.
