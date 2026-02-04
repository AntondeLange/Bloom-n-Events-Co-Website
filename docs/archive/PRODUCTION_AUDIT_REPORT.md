# Production Audit & Cleanup Report
**Date:** 2026-01-25  
**Scope:** Astro codebase compliance audit  
**Objective:** Remove risk, enforce alignment with Architecture & Compliance Constitution

---

## Phase 1: System Map

### Architecture Overview

**Framework:** Astro 5.16.15 (static-first)  
**Styling:** Tailwind CSS 4.1.18 via @tailwindcss/vite  
**TypeScript:** Strict mode enabled (`astro/tsconfigs/strict`)  
**React:** 19.2.3 (islands only via @astrojs/react 4.4.2)

**Build Output:** Static HTML (15 pages + index)  
**Deployment Target:** Vercel (assumed, based on vercel.json at root)

### Folder Structure

```
astro/
├── src/
│   ├── components/
│   │   ├── Header.astro          # Navbar (fixed top/bottom)
│   │   ├── Footer.astro          # Footer with links
│   │   ├── Seo.astro             # Meta tags, OG, Twitter
│   │   └── react/                # React islands (6 components)
│   ├── layouts/
│   │   └── BaseLayout.astro      # Global layout, accordion script
│   ├── lib/
│   │   ├── constants.ts          # SITE, CONTACT
│   │   └── seo.ts                # SEO helpers
│   ├── pages/                    # 15 static pages
│   └── styles/
│       └── global.css            # Tailwind + custom CSS (2767 lines)
└── public/
    └── assets/images/            # Static assets
```

### React Islands Inventory

| Component | Usage | Hydration | Justification |
|-----------|-------|-----------|---------------|
| `ContactForm` | contact.astro | `client:idle` | ✅ Form validation, submit, focus management |
| `ImageCarousel` | gallery, about, case studies, capabilities | `client:idle` / `client:load` | ⚠️ Auto-advance carousel - could be CSS-only with reduced motion |
| `SuccessStoriesCarousel` | Most pages | `client:load` / `client:idle` | ⚠️ Complex transform-based carousel - justified but heavy |
| `TestimonialsCarousel` | index, case studies | `client:idle` | ⚠️ Auto-advance carousel - needs reduced motion |
| `StickyMobileCTA` | Most pages | `client:idle` | ✅ Scroll detection for mobile CTA |
| `NavbarScrollHandler` | Header (home only) | `client:idle` | ❌ Returns null, pure side-effect - should be vanilla JS |

### Static vs Interactive Pages

**Fully Static (no client JS):**
- policies.astro
- tandcs.astro
- (others may have carousels but are still static-first)

**Pages with React Islands:**
- index.astro: SuccessStoriesCarousel, TestimonialsCarousel, StickyMobileCTA
- about.astro: 3x ImageCarousel, StickyMobileCTA
- contact.astro: ContactForm
- gallery.astro: 3x ImageCarousel, SuccessStoriesCarousel, StickyMobileCTA
- capabilities.astro: ImageCarousel, SuccessStoriesCarousel, StickyMobileCTA
- All case-study pages: ImageCarousel, TestimonialsCarousel, SuccessStoriesCarousel, StickyMobileCTA
- events/workshops/displays.astro: SuccessStoriesCarousel, StickyMobileCTA

---

## Phase 1: Violations Detected

### ❌ HARD VIOLATIONS (Must Fix)

#### 1. Portfolio Dropdown Keyboard Inaccessibility
**Location:** `src/components/Header.astro` lines 62-90  
**Issue:** Portfolio dropdown uses CSS `group-hover:block` only. Keyboard users cannot open it.  
**WCAG 2.1.1 Keyboard (Level A):** All functionality must be operable via keyboard.  
**Real-world impact:** Keyboard-only users (screen readers, motor disabilities) cannot access Events, Workshops, Displays, or Capabilities from desktop nav.  
**Fix:** Convert to `<button>` with `aria-expanded`, keyboard handlers (Enter/Space), and focus management.

#### 2. Missing `prefers-reduced-motion` Support
**Location:** 
- `src/components/islands/ImageCarousel.tsx` (auto-advance)
- `src/components/react/TestimonialsCarousel.tsx` (auto-advance)
- `src/pages/index.astro` (hero video autoplay)
- `src/styles/global.css` (scroll-behavior: smooth)

**Issue:** Auto-advancing carousels and smooth scrolling ignore user motion preferences.  
**WCAG 2.3.3 Animation from Interactions (Level AAA), 2.2.2 Pause, Stop, Hide (Level A):** Must respect `prefers-reduced-motion: reduce`.  
**Real-world impact:** Users with vestibular disorders, motion sensitivity, or cognitive disabilities may experience nausea, dizziness, or distraction. Legal risk under accessibility laws.  
**Fix:** 
- Check `window.matchMedia('(prefers-reduced-motion: reduce)')` in carousels; pause auto-advance if true.
- Wrap `scroll-behavior: smooth` in `@media (prefers-reduced-motion: no-preference)`.
- Add `prefers-reduced-motion` check for hero video autoplay.

#### 3. Accordion Buttons Missing `aria-expanded` on Collapsed State
**Location:** `src/pages/events.astro`, `workshops.astro`, `displays.astro`  
**Issue:** Collapsed accordion buttons (faq2-faq5) lack `aria-expanded="false"`. Only faq1 has `aria-expanded="true"`.  
**WCAG 4.1.2 Name, Role, Value (Level A):** Screen readers need accurate state.  
**Real-world impact:** Screen reader users may not know accordion is collapsed.  
**Fix:** Add `aria-expanded="false"` to all collapsed accordion buttons.

### ⚠️ RISKY / FRAGILE (Should Fix)

#### 4. NavbarScrollHandler as React Island
**Location:** `src/components/react/NavbarScrollHandler.tsx`  
**Issue:** Returns `null`, pure side-effect. No UI, no React-specific features.  
**Risk:** Unnecessary React hydration overhead (~0.86 kB gzip) for vanilla JS functionality.  
**Fix:** Convert to vanilla `<script>` in BaseLayout or Header, conditionally included for home page.

#### 5. Accordion Script Runs on Every Page
**Location:** `src/layouts/BaseLayout.astro` lines 59-178  
**Issue:** Inline accordion script executes on all pages, even those without accordions (e.g., index, contact, gallery).  
**Risk:** Unnecessary DOM queries and event listener setup on pages without accordions. Minor performance waste.  
**Fix:** Conditionally include script only on pages with accordions, or lazy-load on first accordion button query.

#### 6. `console.error` in Production Code
**Location:** `src/layouts/BaseLayout.astro` line 85  
**Issue:** `console.error('Accordion target not found:', targetId);` in production.  
**Risk:** Exposes internal errors to users, potential information leakage.  
**Fix:** Remove or gate behind development mode check.

#### 7. Duplicate `preconnect` for cdn.jsdelivr.net
**Location:** `src/layouts/BaseLayout.astro` lines 34-35  
**Issue:** Two identical `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />` tags.  
**Risk:** Redundant network hint, minor waste.  
**Fix:** Remove duplicate.

#### 8. Missing Keyboard Navigation for Carousels
**Location:** `src/components/islands/ImageCarousel.tsx`  
**Issue:** Carousel has prev/next buttons but no arrow key support.  
**WCAG 2.1.1 Keyboard:** Users expect arrow keys to navigate carousels.  
**Risk:** Keyboard users must tab to buttons instead of using arrow keys.  
**Fix:** Add `onKeyDown` handler for ArrowLeft/ArrowRight.

### 🧹 CLEANUP / SIMPLIFICATION

#### 9. SuccessStoriesCarousel Card Semantics
**Location:** `src/components/react/SuccessStoriesCarousel.tsx` lines 200-223  
**Issue:** Card has `role="button"`, `tabIndex={0}`, `onClick`, `onKeyDown`, but also contains an `<a>`. Nested interactive elements.  
**Risk:** Confusing semantics for screen readers. Card acts as button (changes carousel index) but also contains link (goes to case study).  
**Fix:** Remove card-level interactivity; only the link should be interactive. Or separate "focus card" from "navigate to case study" actions.

#### 10. Video Autoplay Without Reduced Motion Check
**Location:** `src/pages/index.astro` line 23  
**Issue:** Hero video has `autoplay` but no check for `prefers-reduced-motion`.  
**Risk:** Violates motion preferences.  
**Fix:** Add `prefers-reduced-motion` check; pause or hide video if reduced motion preferred.

---

## Phase 2: Cleanup Plan

### Priority 1: Hard Violations (Launch Blockers)

1. **Portfolio Dropdown Keyboard Access** (Header.astro)
   - Intent: Make Portfolio dropdown keyboard-accessible
   - Files: `src/components/Header.astro`
   - Risk: Low (additive change, no breaking)
   - Fix: Convert `<span>` to `<button>`, add `aria-expanded`, keyboard handlers, focus trap
   - Verification: Test with keyboard navigation, screen reader

2. **Reduced Motion Support** (Multiple files)
   - Intent: Respect user motion preferences
   - Files: 
     - `src/components/islands/ImageCarousel.tsx`
     - `src/components/react/TestimonialsCarousel.tsx`
     - `src/styles/global.css`
     - `src/pages/index.astro`
   - Risk: Low (additive, progressive enhancement)
   - Fix: Add `prefers-reduced-motion` checks, pause auto-advance, disable smooth scroll
   - Verification: Test with `prefers-reduced-motion: reduce` in DevTools

3. **Accordion `aria-expanded`** (Events, Workshops, Displays pages)
   - Intent: Complete ARIA state for accordions
   - Files: `src/pages/events.astro`, `workshops.astro`, `displays.astro`
   - Risk: None (additive)
   - Fix: Add `aria-expanded="false"` to collapsed buttons
   - Verification: Screen reader test, ARIA validator

### Priority 2: Risky Issues

4. **NavbarScrollHandler → Vanilla JS** (Header.astro)
   - Intent: Remove unnecessary React island
   - Files: `src/components/Header.astro`, delete `src/components/react/NavbarScrollHandler.tsx`
   - Risk: Low (functionality unchanged)
   - Fix: Extract logic to vanilla `<script>` in Header, conditionally for home
   - Verification: Build succeeds, functionality works, bundle size reduced

5. **Accordion Script Conditional Loading** (BaseLayout.astro)
   - Intent: Only load accordion script when needed
   - Files: `src/layouts/BaseLayout.astro`
   - Risk: Low (lazy-loading is safe)
   - Fix: Lazy-load script on first accordion button query, or pass prop to conditionally include
   - Verification: Script only runs on pages with accordions

6. **Remove `console.error`** (BaseLayout.astro)
   - Intent: Clean production code
   - Files: `src/layouts/BaseLayout.astro`
   - Risk: None
   - Fix: Remove or gate behind `import.meta.env.DEV`
   - Verification: No console output in production build

7. **Remove Duplicate Preconnect** (BaseLayout.astro)
   - Intent: Clean redundant tags
   - Files: `src/layouts/BaseLayout.astro`
   - Risk: None
   - Fix: Remove duplicate line 35
   - Verification: Single preconnect tag in output

8. **Carousel Arrow Key Support** (ImageCarousel.tsx)
   - Intent: Improve keyboard UX
   - Files: `src/components/islands/ImageCarousel.tsx`
   - Risk: Low (additive)
   - Fix: Add `onKeyDown` handler for ArrowLeft/ArrowRight on carousel container
   - Verification: Keyboard navigation test

### Priority 3: Cleanup

9. **SuccessStoriesCarousel Card Semantics** (SuccessStoriesCarousel.tsx)
   - Intent: Fix nested interactive elements
   - Files: `src/components/react/SuccessStoriesCarousel.tsx`
   - Risk: Medium (UX change - card click behavior may change)
   - Fix: Remove card-level button semantics; only link is interactive
   - Verification: Screen reader test, keyboard navigation

10. **Video Reduced Motion** (index.astro)
    - Intent: Respect motion preferences for video
    - Files: `src/pages/index.astro`
    - Risk: Low (additive)
    - Fix: Add `prefers-reduced-motion` check, pause/hide video if reduced
    - Verification: Test with reduced motion preference

---

## Phase 3: Verification Checklist

After cleanup, verify:

- [ ] TypeScript: `npx tsc --noEmit` passes
- [ ] Build: `npm run build` succeeds
- [ ] No console errors in production
- [ ] Keyboard navigation works (Tab, Enter, Space, Arrow keys)
- [ ] Screen reader test (VoiceOver/NVDA) - all interactive elements announced
- [ ] `prefers-reduced-motion: reduce` - carousels pause, smooth scroll disabled
- [ ] Portfolio dropdown opens/closes with keyboard
- [ ] All accordions have `aria-expanded` on all buttons
- [ ] Bundle size reduced (NavbarScrollHandler removed)
- [ ] No duplicate preconnect tags in HTML output

---

## Remaining Risks (Post-Cleanup)

**Acceptable:**
- React islands for carousels (justified: complex transform logic, auto-advance)
- ContactForm as React (justified: validation, focus management, submit handling)
- StickyMobileCTA as React (justified: scroll detection)

**Unavoidable:**
- External fonts (Google Fonts) - required for brand typography
- Bootstrap Icons CDN - required for iconography
- Client-side hydration for interactive components (Astro islands pattern)

**Next Steps (If Time Permits):**
- Consider CSS-only carousel alternatives for non-critical galleries
- Evaluate if SuccessStoriesCarousel could use CSS scroll-snap instead of transforms
- Add automated a11y testing (axe-core, Lighthouse CI)

---

---

## Phase 2: Cleanup Execution Summary

### ✅ Completed Fixes

1. **Portfolio Dropdown Keyboard Accessibility** ✅
   - Converted `<span>` to `<button>` with `aria-expanded`, keyboard handlers (Enter/Space/Escape/ArrowDown)
   - Added focus management and outside-click handling
   - Files: `src/components/Header.astro`, `src/styles/global.css`

2. **Reduced Motion Support** ✅
   - Added `prefers-reduced-motion` checks to `ImageCarousel` and `TestimonialsCarousel` (pause auto-advance)
   - Wrapped `scroll-behavior: smooth` in `@media (prefers-reduced-motion: no-preference)`
   - Added video autoplay check on home page (pauses if reduced motion)
   - Files: `src/components/islands/ImageCarousel.tsx`, `TestimonialsCarousel.tsx`, `src/styles/global.css`, `src/pages/index.astro`

3. **Accordion `aria-expanded`** ✅
   - Added `aria-expanded="false"` to all collapsed accordion buttons
   - Files: `src/pages/events.astro`, `workshops.astro`, `displays.astro`

4. **NavbarScrollHandler → Vanilla JS** ✅
   - Converted React island to vanilla `<script>` in Header
   - Deleted `src/components/react/NavbarScrollHandler.tsx`
   - Files: `src/components/Header.astro`

5. **Removed `console.error` and Duplicate Preconnect** ✅
   - Removed `console.error` from accordion script
   - Removed duplicate `<link rel="preconnect" href="https://cdn.jsdelivr.net">`
   - Files: `src/layouts/BaseLayout.astro`

6. **Carousel Arrow Key Support** ✅
   - Added `onKeyDown` handler for ArrowLeft/ArrowRight on `ImageCarousel`
   - Added `tabIndex={0}`, `role="region"`, `aria-roledescription="carousel"`
   - Files: `src/components/islands/ImageCarousel.tsx`

7. **SuccessStoriesCarousel Nested Interactive Elements** ✅
   - Removed card-level `role="button"`, `tabIndex`, `onClick`, `onKeyDown`
   - Only the link is now interactive (removed `handleCardClick`)
   - Files: `src/components/react/SuccessStoriesCarousel.tsx`

### Build Verification

- ✅ TypeScript: `npx tsc --noEmit` passes
- ✅ Build: `npm run build` succeeds (16 pages)
- ✅ No linter errors

**Status:** Phase 2 complete. Ready for Phase 3 verification.
