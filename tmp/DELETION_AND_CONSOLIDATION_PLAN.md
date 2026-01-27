# Deletion and Consolidation Plan
**Bloom'n Events Co Website**  
**Date:** January 26, 2026  
**Status:** PLANNING ONLY - No changes executed

---

## EXECUTIVE SUMMARY

This plan identifies files, folders, comments, and documentation to be removed or consolidated to achieve:
- Single build system (Astro only)
- Eliminated duplicate content
- Reduced documentation bloat
- Cleaner codebase structure

**Total Items Identified:**
- **Files to Delete:** 30 files
- **Folders to Delete:** 2 folders (with contents)
- **Comments to Remove:** ~50+ instances across multiple files
- **Markdown Files:** 18 files (remove/merge/archive)

---

## 1. FILES TO DELETE

### 1.1 Root HTML Files (14 files) - ❌ DUPLICATE OF ASTRO PAGES

**Rationale:** These duplicate Astro pages in `astro/src/pages/`. Astro is the primary build system.

**Files:**
1. `index.html`
2. `about.html`
3. `contact.html`
4. `gallery.html`
5. `events.html`
6. `workshops.html`
7. `displays.html`
8. `capabilities.html`
9. `team.html`
10. `tandcs.html`
11. `policies.html`
12. `404.html`
13. `case-study-centuria-connect140.html`
14. `case-study-hawaiian-forrestfield.html`
15. `case-study-hawaiian-neighbourhood-nibbles.html`
16. `case-study-centuria-50th-birthday.html`
17. `case-study-centuria-breast-cancer.html`

**Note:** Verify Astro pages exist for all before deletion.

---

### 1.2 Root Build Configuration Files (3 files) - ❌ CONFLICTING WITH ASTRO

**Rationale:** Root Vite build conflicts with Astro build. Astro is primary.

**Files:**
1. `vite.config.js` - Root Vite configuration
2. `package.json` - Root package.json (if only used for Vite)
3. `package-lock.json` - Root package-lock.json (if only used for Vite)

**Note:** Verify `package.json` isn't used for other purposes (e.g., scripts, backend).

---

### 1.3 Legacy/Unused Configuration Files (4 files) - ⚠️ UNUSED

**Rationale:** These are not used by Vercel deployment or Astro build.

**Files:**
1. `.htaccess` - Apache config (Vercel doesn't use Apache)
2. `Dockerfile` (root) - Docker config (Vercel doesn't use Docker for static sites)
3. `postcss.config.js` - PostCSS config (if Tailwind v4 handles this)
4. `manifest.json` (root) - PWA manifest (if not used by Astro)

**Note:** Verify `manifest.json` is not referenced by Astro before deletion.

---

### 1.4 Service Worker (1 file) - ❌ MISMATCHED

**Rationale:** References root HTML files that won't exist after cleanup.

**Files:**
1. `sw.js` - Service worker with hardcoded root HTML paths

**Note:** Either delete (if PWA not required) or update to reference Astro build output.

---

### 1.5 Legacy Scripts Directory (8 files) - 🧹 ONE-TIME MIGRATION SCRIPTS

**Rationale:** One-time migration/utility scripts that shouldn't live in production repo.

**Files:**
1. `scripts/fix-all-image-paths.js`
2. `scripts/fix-image-paths.js`
3. `scripts/fix-picture-elements.js`
4. `scripts/generate-srcset.js`
5. `scripts/optimize-images.js`
6. `scripts/update-html-images.js`
7. `scripts/update-images-html.js`
8. `scripts/update-images-srcset.js`

**Note:** If any are used in build process, move to `tools/` or integrate into Astro build.

---

### 1.6 Root Assets - JavaScript Files (Conditional)

**Rationale:** If Astro is primary, root `assets/js/` files may be unused.

**Files to Verify Before Deletion:**
1. `assets/js/main.js` (2843 lines) - Check if used by Astro
2. `assets/js/contact-form.js` - Duplicate of React ContactForm
3. `assets/js/analytics-init.js` - Check if Astro uses this
4. `assets/js/cookie-consent.js` - Check if Astro uses this
5. `assets/js/gtag-init.js` - Check if Astro uses this
6. `assets/js/structured-data-init.js` - Check if Astro uses this
7. `assets/js/structured-data.js` - Check if Astro uses this
8. `assets/js/font-loader.js` - Check if Astro uses this
9. `assets/js/footer-accordion.js` - Check if Astro uses this
10. `assets/js/cache-clear.js` - Check if Astro uses this
11. `assets/js/config.js` - Check if Astro uses this
12. `assets/js/logger.js` - Check if Astro uses this
13. `assets/js/utils.js` - Check if Astro uses this
14. `assets/js/animations.js` - Check if Astro uses this
15. `assets/js/performance-monitoring.js` - Check if Astro uses this
16. `assets/js/video-optimization.js` - Check if Astro uses this
17. `assets/js/copyright-year.js` - Check if Astro uses this
18. `assets/js/csp-config.js` - Check if Astro uses this
19. `assets/js/update-csp.js` - Check if Astro uses this
20. `assets/js/analytics.js` - Check if Astro uses this

**Action:** Audit which files are actually used by Astro pages before deletion.

---

### 1.7 Root Assets - CSS Files (Conditional)

**Rationale:** If Astro is primary, root `assets/css/` may be unused.

**Files to Verify Before Deletion:**
1. `assets/css/main.css` - Check if Astro uses this
2. `assets/css/critical.css` - Check if Astro uses this
3. `assets/css/base.css` - Check if Astro uses this
4. `assets/css/components.css` - Check if Astro uses this
5. `assets/css/legacy.css` - Likely unused
6. `assets/css/motion.css` - Check if Astro uses this
7. `assets/css/tokens.css` - Check if Astro uses this
8. `assets/css/utilities.css` - Check if Astro uses this

**Action:** Verify Astro uses `astro/src/styles/global.css` instead.

---

### 1.8 Root Assets - HTML Partials (3 files) - ❌ DUPLICATE

**Rationale:** Astro has Header.astro and Footer.astro components.

**Files:**
1. `assets/partials/footer.html`
2. `assets/partials/navbar-default.html`
3. `assets/partials/navbar-home.html`

**Note:** Verify these aren't used by any remaining files before deletion.

---

### 1.9 Root Assets - Loader SVGs (2 files) - ⚠️ VERIFY USAGE

**Rationale:** Check if these are used by Astro.

**Files:**
1. `assets/loader/logo_loader_WORKING.svg`
2. `assets/loader/logo_loader.svg`

**Action:** Verify usage before deletion.

---

## 2. FOLDERS TO DELETE

### 2.1 Scripts Directory - 🧹 LEGACY UTILITY SCRIPTS

**Path:** `scripts/`

**Contents:** 8 JavaScript files (listed in section 1.5)

**Rationale:** One-time migration scripts that don't belong in production repo.

**Action:** Delete entire directory after verifying no build process depends on it.

---

### 2.2 Temporary Documentation - 📁 ARCHIVE OR DELETE

**Path:** `tmp/`

**Contents:**
- `tmp/PHASE_1_PRODUCTION_AUDIT.md` (keep until Phase 2 complete)
- `tmp/TECHNICAL_OVERHAUL_REPORT.md` (archive)

**Rationale:** Temporary/historical reports.

**Action:** 
- Keep `PHASE_1_PRODUCTION_AUDIT.md` until cleanup complete
- Archive `TECHNICAL_OVERHAUL_REPORT.md` to `docs/archive/` or delete

---

## 3. COMMENTS TO REMOVE

### 3.1 Obvious/Redundant Comments

**Files and Locations:**

#### `astro/src/layouts/BaseLayout.astro`
- **Line 57:** `<!-- Custom accordion JS - works without Bootstrap CSS -->` → Remove (obvious from code)
- **Line 60:** `// Find all accordion buttons` → Remove (obvious)
- **Line 64-67:** `// Retry after a short delay if elements aren't ready` → Keep (explains non-obvious retry logic)
- **Line 71:** `// Remove any existing listeners by cloning` → Keep (explains non-obvious pattern)
- **Line 178:** `<!-- Anchor Navigation: smooth scroll and active link highlighting -->` → Remove (obvious from code)

#### `astro/src/components/Header.astro`
- **Line 216:** `// Navbar scroll handler: moves navbar from bottom to top on scroll (home page only)` → Keep (explains purpose)
- **Line 221:** `// Only run on home page (navbar starts at bottom)` → Keep (explains conditional logic)
- **Line 234:** `// Scrolled past threshold - move to top` → Remove (obvious)
- **Line 237:** `// Update main padding: remove bottom, add top` → Remove (obvious)
- **Line 243:** `// At top - keep at bottom` → Remove (obvious)
- **Line 246:** `// Update main padding: remove top, add bottom` → Remove (obvious)
- **Line 260:** `// Check initial position` → Remove (obvious)

#### `astro/src/pages/index.astro`
- **Line 37:** `// Respect prefers-reduced-motion: pause video autoplay if user prefers reduced motion` → Keep (explains accessibility decision)
- **Line 43:** `// Autoplay blocked by browser - user can play manually` → Keep (explains error handling)

#### `astro/src/components/react/ContactForm.tsx`
- **Line 2-6:** Header comment block → Keep (justifies React usage)
- **Line 27:** `// Handle ESC key to close modal` → Keep (explains non-obvious behavior)
- **Line 361:** `// Honeypot: leave empty; bots that fill it are rejected server-side` → Keep (explains security measure)

#### `astro/src/components/react/SuccessStoriesCarousel.tsx`
- **Line 2-6:** Header comment block → Keep (justifies React usage)
- **Line 97:** `// Only scroll on user interaction, not on initial mount` → Keep (explains non-obvious behavior)
- **Line 129:** `// Mark initial mount as complete after first render` → Keep (explains state management)

#### `assets/js/main.js` (if kept)
- **Line 1-14:** Header comment block → Keep (explains architecture)
- **Line 20:** `// Performance optimization: Use requestIdleCallback for non-critical tasks` → Keep (explains performance decision)
- **Line 29:** `// Debounce function for performance optimization` → Remove (obvious from function name)
- **Line 42:** `// Throttle function for scroll events` → Remove (obvious from function name)
- **Line 56-58:** Hero parallax comment block → Keep (explains feature)
- **Line 90:** `// Prevent browser scroll restoration on page load` → Keep (explains non-obvious behavior)
- **Line 95:** `// Clear any hash from URL that might cause unwanted scrolling` → Keep (explains non-obvious behavior)

**General Rule:**
- **Remove:** Comments that restate what the code obviously does
- **Keep:** Comments that explain *why* (accessibility, performance, security, non-obvious behavior)
- **Keep:** Comments that justify architectural decisions (React usage, inline scripts)

---

### 3.2 Commented-Out Code

**Action:** Search for commented-out code blocks and remove them entirely.

**Files to Check:**
- All `.astro` files
- All `.tsx` files
- All `.js` files in `assets/js/`
- All `.ts` files

**Patterns to Search:**
- `// const ...` (commented variable declarations)
- `// function ...` (commented functions)
- `<!-- ... -->` (commented HTML in Astro files)
- `/* ... */` (commented CSS blocks)

---

## 4. MARKDOWN FILES - REMOVAL/MERGE/ARCHIVE PLAN

### 4.1 KEEP (3 files) - Essential Documentation

**Rationale:** Single source of truth for each system.

1. **`README.md`** (root)
   - **Action:** Consolidate essential info from other docs
   - **Keep Sections:**
     - Project overview
     - Quick start
     - Architecture (Astro-first)
     - Deployment (Vercel)
     - Contributing guidelines

2. **`astro/README.md`**
   - **Action:** Keep as-is (Astro-specific setup)
   - **Keep Sections:**
     - Astro commands
     - Component structure
     - Design system reference

3. **`backend/README.md`**
   - **Action:** Keep as-is (Backend setup)
   - **Keep Sections:**
     - Backend setup
     - Environment variables
     - API endpoints

---

### 4.2 REMOVE (9 files) - Redundant/Outdated

**Rationale:** Information superseded by consolidated README or no longer relevant.

1. **`DEPLOYMENT.md`**
   - **Action:** Merge essential deployment steps into root `README.md`, then delete
   - **Content to Merge:** Vercel deployment steps, environment setup

2. **`VERCEL_DEPLOYMENT.md`**
   - **Action:** Merge into root `README.md` deployment section, then delete
   - **Content to Merge:** Vercel-specific configuration

3. **`IMPLEMENTATION_SUMMARY.md`**
   - **Action:** Delete (historical implementation notes)

4. **`REFACTORING_REPORT.md`**
   - **Action:** Delete (historical refactoring notes)

5. **`TESTING_CHECKLIST.md`**
   - **Action:** Delete (if not actively used) OR move to `.github/` if used in CI/CD

6. **`docs/IMPLEMENTATION_GUIDE.md`**
   - **Action:** Delete (superseded by README)

7. **`docs/README.md`**
   - **Action:** Delete (if docs/ directory is emptied)

8. **`assets/js/README-CSP.md`**
   - **Action:** Delete (CSP info should be in main README if needed)

9. **`docs/CSP_REMOVAL_GUIDE.md`**
   - **Action:** Delete (historical guide, CSP is implemented)

---

### 4.3 ARCHIVE (2 files) - Historical Reports

**Rationale:** Keep for reference but move out of main documentation.

**Action:** Create `docs/archive/` directory and move:

1. **`tmp/TECHNICAL_OVERHAUL_REPORT.md`**
   - **Action:** Move to `docs/archive/TECHNICAL_OVERHAUL_REPORT.md`

2. **`astro/tmp/PRODUCTION_AUDIT_REPORT.md`**
   - **Action:** Move to `docs/archive/PRODUCTION_AUDIT_REPORT.md` (if different from Phase 1 audit)

**Note:** `tmp/PHASE_1_PRODUCTION_AUDIT.md` should remain in `tmp/` until Phase 2 cleanup is complete, then archive.

---

### 4.4 MERGE (4 files) - Consolidate into README

**Rationale:** Information should be in main README, not separate files.

1. **`PERFORMANCE_OPTIMIZATION.md`**
   - **Action:** Merge performance section into root `README.md`
   - **Content to Merge:** Core Web Vitals targets, optimization strategies

2. **`IMAGE_OPTIMIZATION_GUIDE.md`**
   - **Action:** Merge image optimization section into root `README.md`
   - **Content to Merge:** Image formats, lazy loading, srcset usage

3. **`DESIGN_SYSTEM.md`**
   - **Action:** Merge design tokens section into root `README.md` OR keep if actively referenced
   - **Content to Merge:** Color palette, typography, spacing system

4. **`docs/ACCESSIBILITY_IMPROVEMENTS.md`**
   - **Action:** Merge accessibility section into root `README.md`
   - **Content to Merge:** WCAG compliance, accessibility features

---

### 4.5 REVIEW (4 files) - Verify if Still Needed

**Rationale:** May contain relevant information but need verification.

1. **`docs/SECURITY_HEADERS.md`**
   - **Action:** Review content
   - **Decision:** If current security headers are documented, merge into README. If outdated, delete.

2. **`docs/VALIDATION_PATTERNS.md`**
   - **Action:** Review content
   - **Decision:** If validation patterns are still used, merge into README. If outdated, delete.

3. **`backend/ENV_VARIABLES.md`**
   - **Action:** Review content
   - **Decision:** If different from `backend/.env.example`, keep. Otherwise, delete (`.env.example` is sufficient).

4. **`tmp/PHASE_1_PRODUCTION_AUDIT.md`**
   - **Action:** Keep until Phase 2 complete
   - **Decision:** After cleanup, archive to `docs/archive/`

---

## 5. SUMMARY BY CATEGORY

### 5.1 Files to Delete (30+ files)

**Critical (Must Delete):**
- 17 root HTML files (duplicates)
- 3 root build config files (Vite)
- 1 service worker (mismatched)
- 8 legacy scripts
- 3 HTML partials

**Conditional (Verify First):**
- 20+ root JavaScript files
- 8 root CSS files
- 2 loader SVGs
- 4 unused config files

### 5.2 Folders to Delete (2 folders)

- `scripts/` (8 files)
- `tmp/` (after archiving, 1 file remains temporarily)

### 5.3 Comments to Remove (~50+ instances)

- Obvious/redundant comments: ~30 instances
- Commented-out code: Unknown (needs search)

### 5.4 Markdown Files (18 files)

- **Keep:** 3 files (README.md, astro/README.md, backend/README.md)
- **Remove:** 9 files (redundant/outdated)
- **Archive:** 2 files (historical reports)
- **Merge:** 4 files (into README.md)
- **Review:** 4 files (verify if still needed)

---

## 6. EXECUTION ORDER

### Phase 1: Verification (Before Deletion)

1. **Verify Astro pages exist for all root HTML files**
2. **Verify root assets are not used by Astro**
3. **Verify no build process depends on scripts/**
4. **Verify package.json isn't used for other purposes**
5. **Backup critical files before deletion**

### Phase 2: Safe Deletions (No Dependencies)

1. Delete `scripts/` directory
2. Delete `tmp/TECHNICAL_OVERHAUL_REPORT.md` (after archiving)
3. Delete redundant markdown files (after merging)
4. Remove obvious/redundant comments

### Phase 3: Conditional Deletions (After Verification)

1. Delete root HTML files (after verifying Astro equivalents)
2. Delete root build config files (after verifying no dependencies)
3. Delete root assets (after verifying Astro doesn't use them)
4. Delete unused config files

### Phase 4: Documentation Consolidation

1. Merge markdown files into README.md
2. Archive historical reports
3. Update README.md with consolidated information
4. Delete merged markdown files

---

## 7. RISK ASSESSMENT

### Low Risk Deletions
- `scripts/` directory (one-time migration scripts)
- Redundant markdown files (after merging)
- Obvious comments

### Medium Risk Deletions
- Root HTML files (verify Astro equivalents first)
- Root build config files (verify no dependencies)
- Root assets (verify Astro doesn't use them)

### High Risk Deletions
- `package.json` (root) - May be used by other systems
- `manifest.json` - May be referenced by Astro
- Service worker - May be required for PWA

**Mitigation:** Always verify before deletion. Use git to track changes and enable easy rollback.

---

## 8. VALIDATION CHECKLIST

Before executing deletions, verify:

- [ ] All root HTML files have Astro equivalents
- [ ] Root assets are not referenced by Astro pages
- [ ] No build process depends on `scripts/` directory
- [ ] `package.json` (root) is not used for other purposes
- [ ] `manifest.json` is not referenced by Astro
- [ ] Service worker is not required for PWA
- [ ] All markdown content is merged/archived before deletion
- [ ] Git commit created before bulk deletions
- [ ] Backup of critical files created

---

## END OF PLAN

**Status:** ✅ **PLANNING COMPLETE**  
**Next Step:** Review plan, execute verification phase, then proceed with deletions in order.

**Estimated Impact:**
- **Files Removed:** 30-50 files
- **Folders Removed:** 2 folders
- **Comments Cleaned:** ~50+ instances
- **Documentation Consolidated:** 18 files → 3 files
- **Repository Size Reduction:** ~20-30% (estimated)
