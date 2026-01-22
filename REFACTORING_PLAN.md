# Bloom'n Events Co - Comprehensive Refactoring Plan

**Date:** 2025-01-XX  
**Status:** In Progress  
**Target:** Performance, Accessibility, Security, and Maintainability Improvements

## Executive Summary

This document outlines a comprehensive refactoring plan to address performance, accessibility, consistency, and security issues identified in the recent audit. The refactoring will maintain the site's refined, elegant aesthetic while significantly improving technical quality.

## Current State Assessment

### Strengths
- ✅ Well-organized asset structure (`assets/` directory)
- ✅ Modular CSS architecture (tokens, motion, components)
- ✅ Security headers partially implemented
- ✅ Some lazy loading already in place
- ✅ Responsive design foundation exists

### Critical Issues Identified
- ⚠️ Images not optimized (JPG/PNG only, no WebP/AVIF)
- ⚠️ Inline scripts/styles requiring `'unsafe-inline'` in CSP
- ⚠️ No build process (no minification, bundling, or asset hashing)
- ⚠️ CSS contains unused rules and inconsistencies
- ⚠️ Missing `alt` attributes on some images
- ⚠️ Color contrast may not meet WCAG AA standards
- ⚠️ Dependencies may be outdated
- ⚠️ No input validation patterns documented
- ⚠️ Meta descriptions may be generic or missing

## Refactoring Scope

### Phase 1: Front-End Optimization (Priority: High)

#### 1.1 Image Optimization
**Current State:**
- All images are JPG/PNG format
- Some images have responsive `srcset` but not all
- Lazy loading partially implemented
- No modern format conversion (WebP/AVIF)

**Actions:**
- [ ] Create image optimization script using Sharp or ImageMagick
- [ ] Convert critical images to WebP with JPG fallback
- [ ] Convert non-critical images to AVIF with WebP/JPG fallback
- [ ] Implement responsive `srcset` for all images
- [ ] Ensure all non-critical images have `loading="lazy"`
- [ ] Add `decoding="async"` to all images
- [ ] Optimize image dimensions (remove unnecessary large sizes)

**Deliverables:**
- Image optimization script (`scripts/optimize-images.js`)
- Updated HTML with proper `srcset` attributes
- Documentation on image optimization workflow

#### 1.2 Script Optimization
**Current State:**
- Some scripts use `defer`/`async`
- Inline scripts present (Google Analytics, cookie consent)
- No bundling or minification
- Third-party scripts loaded from CDN

**Actions:**
- [ ] Audit all inline scripts
- [ ] Move inline scripts to external files
- [ ] Add `defer` to all non-critical scripts
- [ ] Add `async` to analytics and third-party scripts
- [ ] Implement build process for bundling/minification
- [ ] Add integrity checksums (SRI) to all external scripts

**Deliverables:**
- External script files for all inline code
- Build configuration (Vite/Webpack)
- Updated HTML with proper script attributes

#### 1.3 CSS Optimization
**Current State:**
- CSS is modular but not minified
- Some unused rules likely present
- Inline critical CSS in HTML
- Spacing/typography inconsistencies

**Actions:**
- [ ] Audit CSS for unused rules (use PurgeCSS or similar)
- [ ] Standardize spacing scale (use design tokens)
- [ ] Unify typography scale
- [ ] Extract inline critical CSS to separate file
- [ ] Implement CSS minification in build process
- [ ] Remove duplicate rules

**Deliverables:**
- Cleaned and standardized CSS
- Updated design tokens
- Build process for CSS optimization

### Phase 2: Accessibility Enhancements (Priority: High)

#### 2.1 Image Accessibility
**Actions:**
- [ ] Audit all images for `alt` attributes
- [ ] Add meaningful `alt` text to informative images
- [ ] Add empty `alt=""` to decorative images
- [ ] Ensure icons have appropriate ARIA labels

#### 2.2 Color Contrast
**Actions:**
- [ ] Audit all text/background color combinations
- [ ] Test against WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text)
- [ ] Update colors that fail contrast requirements
- [ ] Document color palette with contrast ratios

#### 2.3 Keyboard Navigation
**Actions:**
- [ ] Ensure all interactive elements are keyboard accessible
- [ ] Add visible focus styles (meeting WCAG 2.4.7)
- [ ] Test tab order is logical
- [ ] Ensure skip links work correctly

**Deliverables:**
- Accessibility audit report
- Updated CSS with proper focus styles
- Color contrast documentation

### Phase 3: SEO Improvements (Priority: Medium)

#### 3.1 Meta Tags
**Actions:**
- [ ] Create unique meta descriptions for each page
- [ ] Ensure all pages have proper Open Graph tags
- [ ] Add Twitter Card tags to all pages
- [ ] Verify canonical URLs are correct

**Deliverables:**
- Updated meta tags for all 20 HTML pages
- SEO documentation

### Phase 4: Responsiveness Fixes (Priority: Medium)

#### 4.1 Mobile/Tablet Audit
**Actions:**
- [ ] Test all pages on mobile (320px, 375px, 414px)
- [ ] Test all pages on tablet (768px, 1024px)
- [ ] Identify overflow issues
- [ ] Fix fixed-width elements
- [ ] Ensure touch targets are at least 44x44px

**Deliverables:**
- Responsive design fixes
- Mobile/tablet testing report

### Phase 5: Security Hardening (Priority: High)

#### 5.1 Dependency Updates
**Actions:**
- [ ] Audit all dependencies for vulnerabilities
- [ ] Update to latest secure versions
- [ ] Remove unused dependencies
- [ ] Document dependency update process

#### 5.2 Security Headers
**Current State:**
- CSP partially implemented (but uses `'unsafe-inline'`)
- HSTS configured
- X-Frame-Options set
- X-Content-Type-Options set
- Referrer-Policy set

**Actions:**
- [ ] Remove `'unsafe-inline'` from CSP (after moving inline scripts/styles)
- [ ] Implement nonces for any remaining inline content
- [ ] Verify all security headers are properly set
- [ ] Add Permissions-Policy header
- [ ] Document security header configuration

#### 5.3 Cookie Security
**Actions:**
- [ ] Review all cookie usage
- [ ] Ensure cookies use `Secure` flag
- [ ] Ensure cookies use `HttpOnly` flag where appropriate
- [ ] Set `SameSite=Strict` for session cookies
- [ ] Document cookie usage

**Deliverables:**
- Updated security headers configuration
- Cookie security documentation
- Dependency audit report

### Phase 6: Build Process & Tooling (Priority: High)

#### 6.1 Build System Setup
**Actions:**
- [ ] Choose build tool (Vite recommended for simplicity)
- [ ] Configure asset optimization
- [ ] Implement CSS minification
- [ ] Implement JavaScript bundling/minification
- [ ] Add asset hashing for cache busting
- [ ] Configure source maps for development

**Deliverables:**
- `vite.config.js` or `webpack.config.js`
- Build scripts in `package.json`
- Documentation on build process

### Phase 7: Backend Security Patterns (Priority: Medium)

#### 7.1 Input Validation
**Actions:**
- [ ] Document input validation patterns
- [ ] Provide code examples for common validations
- [ ] Document sanitization requirements
- [ ] Provide parameterized query examples

**Deliverables:**
- Validation patterns documentation
- Code examples (Node.js/Express)

## Implementation Priority

1. **Week 1:** Image optimization, script optimization, CSS cleanup
2. **Week 2:** Accessibility fixes, SEO improvements
3. **Week 3:** Security hardening, build process setup
4. **Week 4:** Responsiveness fixes, testing, documentation

## Success Metrics

- **Performance:**
  - Lighthouse Performance score: 90+
  - First Contentful Paint: < 1.5s
  - Largest Contentful Paint: < 2.5s
  - Time to Interactive: < 3.5s

- **Accessibility:**
  - Lighthouse Accessibility score: 100
  - WCAG 2.1 AA compliance
  - All images have proper alt text
  - Keyboard navigation works throughout

- **Security:**
  - No `'unsafe-inline'` in CSP
  - All dependencies up to date
  - Security headers properly configured
  - No known vulnerabilities

- **SEO:**
  - Unique meta descriptions on all pages
  - Proper Open Graph tags
  - Lighthouse SEO score: 100

## Risk Mitigation

- **Breaking Changes:** Test thoroughly on staging before production
- **Performance Regression:** Monitor Core Web Vitals after deployment
- **Accessibility Regression:** Use automated and manual testing
- **Security Issues:** Regular dependency audits, security header monitoring

## Maintenance Plan

- Monthly dependency updates
- Quarterly accessibility audits
- Quarterly performance reviews
- Continuous security monitoring
