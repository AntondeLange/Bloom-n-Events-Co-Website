# CSP `'unsafe-inline'` Removal Guide

## Overview

This guide documents the process for removing `'unsafe-inline'` from Content Security Policy directives, which is a critical security improvement to prevent XSS attacks.

## Current Status

- **script-src:** Contains `'unsafe-inline'` ⚠️
- **style-src:** Contains `'unsafe-inline'` ⚠️

## Why Remove `'unsafe-inline'`?

`'unsafe-inline'` allows inline scripts and styles, which can be exploited for XSS attacks. Removing it forces all scripts and styles to be in external files, making the site more secure.

## Step-by-Step Removal Process

### Phase 1: Audit Inline Content

1. **Find all inline scripts:**
   ```bash
   grep -r "<script>" *.html | grep -v "src="
   grep -r "onclick=" *.html
   grep -r "javascript:" *.html
   ```

2. **Find all inline styles:**
   ```bash
   grep -r "<style>" *.html
   grep -r "style=" *.html | head -20
   ```

### Phase 2: Move Inline Scripts

#### Structured Data (JSON-LD)
- **Status:** ✅ Safe to keep inline
- **Reason:** JSON-LD is data, not executable code
- **Action:** No change needed

#### Event Handlers
- **Status:** ⚠️ Need to move
- **Examples:** `onclick`, `onload`, `onsubmit`
- **Action:** Convert to event listeners in external JS files

#### Inline Script Blocks
- **Status:** ⚠️ Need to move
- **Action:** Extract to external `.js` files

### Phase 3: Move Inline Styles

#### Critical CSS
- **Status:** ⚠️ Performance vs Security trade-off
- **Current:** Inline in `<head>` for performance
- **Options:**
  1. Keep inline but use nonces (recommended)
  2. Move to external file (performance impact)
  3. Use `<link rel="preload">` for critical CSS

#### Inline Style Attributes
- **Status:** ⚠️ Need to move
- **Action:** Move to external CSS files or use classes

### Phase 4: Implement Nonces (Recommended)

Nonces allow specific inline scripts/styles while maintaining security.

1. **Generate nonce on server:**
   ```javascript
   const nonce = crypto.randomBytes(16).toString('base64');
   ```

2. **Add to CSP:**
   ```
   script-src 'self' 'nonce-{nonce}' ...
   style-src 'self' 'nonce-{nonce}' ...
   ```

3. **Add nonce to inline content:**
   ```html
   <script nonce="{nonce}">
     // inline script
   </script>
   ```

**Note:** For static sites (GitHub Pages), nonces require server-side generation. Consider:
- Using GitHub Actions to inject nonces
- Using a build process to generate nonces
- Moving all inline content to external files (simpler for static sites)

### Phase 5: Update CSP Configuration

1. **Remove `'unsafe-inline'` from `scripts/csp-config.js`:**
   ```javascript
   scriptSrc: [
     "'self'",
     // Remove: "'unsafe-inline'",
     "cdn.jsdelivr.net",
     "www.googletagmanager.com"
   ],
   styleSrc: [
     "'self'",
     // Remove: "'unsafe-inline'",
     "cdn.jsdelivr.net",
     "fonts.googleapis.com"
   ]
   ```

2. **Update all HTML files** with new CSP

3. **Test thoroughly** - check browser console for CSP violations

## Implementation Priority

### High Priority (Easy Wins)
1. ✅ Move event handlers to external JS
2. ✅ Move inline style attributes to CSS classes
3. ✅ Extract inline script blocks to external files

### Medium Priority (Requires Planning)
1. ⚠️ Handle critical CSS (use nonces or accept performance trade-off)
2. ⚠️ Move Google Analytics inline scripts (may require nonces)

### Low Priority (Can Wait)
1. ⚠️ JSON-LD structured data (safe to keep inline, but could move)

## Testing Checklist

After removing `'unsafe-inline'`:

- [ ] All pages load without CSP errors
- [ ] Forms submit correctly
- [ ] Chatbot works
- [ ] Google Analytics loads
- [ ] All interactive elements work
- [ ] No console errors related to CSP
- [ ] Test in multiple browsers (Chrome, Firefox, Safari)

## Rollback Plan

If issues occur:

1. Re-add `'unsafe-inline'` to CSP config
2. Update all HTML files
3. Investigate specific CSP violations
4. Fix issues incrementally
5. Re-attempt removal

## Tools & Resources

- **CSP Evaluator:** https://csp-evaluator.withgoogle.com/
- **Browser DevTools:** Check Console for CSP violations
- **CSP Report-URI:** Set up reporting to catch violations in production

## Estimated Effort

- **Audit:** 2-4 hours
- **Move inline scripts:** 4-8 hours
- **Move inline styles:** 2-4 hours
- **Testing:** 2-4 hours
- **Total:** 10-20 hours

## Notes

- This is a breaking change - test thoroughly before deploying
- Consider doing this in phases (remove from one page first, test, then expand)
- Document any exceptions (e.g., third-party widgets that require inline scripts)
