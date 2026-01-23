# Testing Checklist
## Comprehensive Testing Guide for Bloom'n Events Co Website

---

## Pre-Deployment Testing

### 1. Responsive Design Testing

#### Breakpoint Testing
- [ ] **1200px (Desktop)**
  - [ ] Navigation displays horizontally
  - [ ] Hero section displays correctly
  - [ ] Cards display in grid layout
  - [ ] Footer displays in 3 columns
  - [ ] Images load at appropriate sizes

- [ ] **992px (Tablet Landscape)**
  - [ ] Navigation collapses to mobile menu
  - [ ] Hero typography scales appropriately
  - [ ] Cards stack to 2 columns
  - [ ] Footer adapts layout
  - [ ] Touch targets are 48px minimum

- [ ] **768px (Tablet Portrait)**
  - [ ] Mobile menu functions correctly
  - [ ] Hero content is readable
  - [ ] Cards stack to single column
  - [ ] Forms are touch-friendly
  - [ ] Images use appropriate sizes

- [ ] **576px (Mobile Landscape)**
  - [ ] Navigation is accessible
  - [ ] Hero video/image displays correctly
  - [ ] Text is readable without zooming
  - [ ] Buttons are easily tappable
  - [ ] Forms are usable

- [ ] **375px (Mobile Portrait)**
  - [ ] All content is accessible
  - [ ] No horizontal scrolling
  - [ ] Images don't overflow
  - [ ] Forms are fully functional
  - [ ] Footer is readable

#### Device Testing
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] iPad (Safari)
- [ ] Desktop Chrome
- [ ] Desktop Firefox
- [ ] Desktop Safari
- [ ] Desktop Edge

---

## Functional Testing

### 2. Navigation
- [ ] Home page navbar (fixed-bottom) works correctly
- [ ] Other pages navbar (fixed-top) works correctly
- [ ] Mobile menu toggles correctly
- [ ] All navigation links work
- [ ] Anchor navigation scrolls to sections
- [ ] Skip to main content link works
- [ ] Keyboard navigation works (Tab, Enter, Escape)

### 3. Forms
- [ ] Contact form validation works
- [ ] Character counter updates correctly
- [ ] Form submission works
- [ ] Error messages display correctly
- [ ] Success messages display correctly
- [ ] Required fields are enforced
- [ ] Email validation works
- [ ] Phone validation works
- [ ] Spam protection works (time-based)

### 4. Images & Media
- [ ] Hero video plays on homepage
- [ ] Images lazy load correctly
- [ ] Images don't break layout while loading
- [ ] Alt text is present on all images
- [ ] Responsive images load appropriate sizes
- [ ] Gallery images display correctly

### 5. Performance
- [ ] Page loads in < 3 seconds on 3G
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] Images optimize correctly
- [ ] Video loads progressively
- [ ] Service worker caches correctly

---

## Accessibility Testing

### 6. WCAG 2.1 AA Compliance
- [ ] All images have alt text
- [ ] Color contrast meets 4.5:1 ratio
- [ ] Keyboard navigation works throughout
- [ ] Focus indicators are visible
- [ ] ARIA labels are correct
- [ ] Form labels are associated
- [ ] Error messages are announced
- [ ] Skip links work
- [ ] Heading hierarchy is logical
- [ ] Touch targets are 48x48px minimum

### 7. Screen Reader Testing
- [ ] Test with NVDA (Windows)
- [ ] Test with JAWS (Windows)
- [ ] Test with VoiceOver (Mac/iOS)
- [ ] Test with TalkBack (Android)
- [ ] All interactive elements are announced
- [ ] Form errors are announced
- [ ] Navigation is clear

---

## Browser Compatibility

### 8. Modern Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Opera (latest)

### 9. Legacy Support
- [ ] Chrome (last 2 versions)
- [ ] Firefox (last 2 versions)
- [ ] Safari (last 2 versions)
- [ ] Edge (last 2 versions)

---

## Security Testing

### 10. Security Headers
- [ ] CSP headers are correct
- [ ] X-Frame-Options is set
- [ ] X-Content-Type-Options is set
- [ ] Referrer-Policy is set
- [ ] HSTS is enabled (if HTTPS)
- [ ] No inline scripts (except cache-clear.js)
- [ ] No unsafe-inline in CSP

### 11. Form Security
- [ ] Spam protection works
- [ ] CSRF protection (if applicable)
- [ ] Input sanitization works
- [ ] No sensitive data in client-side code

---

## Performance Testing

### 12. Lighthouse Scores
- [ ] Performance: > 90
- [ ] Accessibility: > 90
- [ ] Best Practices: > 90
- [ ] SEO: > 90

### 13. Core Web Vitals
- [ ] LCP: < 2.5s
- [ ] FID: < 100ms
- [ ] CLS: < 0.1

### 14. Network Testing
- [ ] Fast 3G: Page loads in < 5s
- [ ] Slow 3G: Page loads in < 10s
- [ ] 4G: Page loads in < 3s
- [ ] Images optimize for connection speed

---

## Content Testing

### 15. Content Accuracy
- [ ] All text is correct
- [ ] All links work
- [ ] All images are appropriate
- [ ] Contact information is correct
- [ ] Social media links work
- [ ] Copyright year updates automatically

### 16. SEO
- [ ] Meta descriptions are present
- [ ] Title tags are unique
- [ ] Canonical URLs are correct
- [ ] Open Graph tags are present
- [ ] Structured data is valid
- [ ] Sitemap is accessible
- [ ] Robots.txt is correct

---

## Integration Testing

### 17. Third-Party Services
- [ ] Google Analytics works
- [ ] Form submission works
- [ ] Social media embeds work
- [ ] Cookie consent works
- [ ] Service worker works

---

## Regression Testing

### 18. Known Issues Check
- [ ] Hero video plays correctly
- [ ] Navbar positioning is correct
- [ ] Footer logo is visible
- [ ] Contact form character counter works
- [ ] Anchor navigation works
- [ ] Cache clearing works
- [ ] No console errors

---

## Post-Deployment Testing

### 19. Production Checks
- [ ] Site is accessible at production URL
- [ ] HTTPS is working
- [ ] All pages load correctly
- [ ] Forms submit correctly
- [ ] Analytics tracking works
- [ ] No 404 errors
- [ ] No console errors

---

## Testing Tools

### Recommended Tools
1. **Browser DevTools**
   - Chrome DevTools
   - Firefox DevTools
   - Safari Web Inspector

2. **Performance**
   - Lighthouse
   - WebPageTest
   - Chrome DevTools Performance tab

3. **Accessibility**
   - axe DevTools
   - WAVE
   - Lighthouse Accessibility audit

4. **Responsive**
   - Chrome DevTools Device Mode
   - Responsive Design Mode (Firefox)
   - BrowserStack (for real devices)

5. **Network**
   - Chrome DevTools Network tab
   - Throttling options

---

## Testing Schedule

### Before Each Deployment
- [ ] Run responsive design tests (all breakpoints)
- [ ] Test forms
- [ ] Check for console errors
- [ ] Verify navigation

### Weekly
- [ ] Full accessibility audit
- [ ] Performance check (Lighthouse)
- [ ] Cross-browser testing

### Monthly
- [ ] Full regression test
- [ ] Security audit
- [ ] Content review

---

**Last Updated:** December 2024
