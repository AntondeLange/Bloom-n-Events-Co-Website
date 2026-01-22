# Accessibility Improvements Guide

This document outlines accessibility improvements to meet WCAG 2.1 AA standards.

## Current Issues

1. Missing `alt` attributes on some images
2. Color contrast may not meet WCAG AA standards
3. Keyboard navigation focus styles may be insufficient
4. Some interactive elements may lack proper ARIA labels

## Implementation Checklist

### 1. Image Alt Text

#### Informative Images
All images that convey information must have descriptive `alt` text:

```html
<!-- Good -->
<img src="..." alt="Corporate event setup with gold floral arrangements and ambient lighting">

<!-- Bad -->
<img src="..." alt="image">
<img src="...">
```

#### Decorative Images
Decorative images should have empty `alt` attributes:

```html
<img src="..." alt="" role="presentation">
```

#### Complex Images
For complex images (charts, diagrams), provide detailed descriptions:

```html
<img src="..." alt="Event timeline showing planning phase (weeks 1-4), design phase (weeks 5-8), fabrication phase (weeks 9-12), and delivery (week 13)">
```

### 2. Color Contrast

#### Text Contrast Requirements
- **Normal text (16px+):** 4.5:1 contrast ratio
- **Large text (18px+ or 14px+ bold):** 3:1 contrast ratio

#### Testing Tools
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools: Lighthouse audit
- axe DevTools browser extension

#### Current Color Palette

Check these combinations in `assets/css/tokens.css`:

```css
/* Example: Gold text on dark background */
.text-gold {
  color: #BF9B30; /* Gold */
}

.bg-dark {
  background-color: #1E1E1E; /* Dark */
}

/* Contrast ratio: 4.8:1 ✅ (meets AA) */
```

#### Fixing Low Contrast

If contrast is too low, adjust colors:

```css
/* Before (low contrast) */
.text-gold {
  color: #D4AF37; /* Lighter gold - may have low contrast */
}

/* After (better contrast) */
.text-gold {
  color: #BF9B30; /* Darker gold - better contrast */
}
```

### 3. Keyboard Navigation

#### Focus Styles

Ensure all interactive elements have visible focus indicators:

```css
/* Base focus style */
*:focus {
  outline: 2px solid var(--coreGold);
  outline-offset: 2px;
}

/* Remove default outline only if custom is provided */
button:focus,
a:focus,
input:focus,
select:focus,
textarea:focus {
  outline: 2px solid var(--coreGold);
  outline-offset: 2px;
}

/* Skip link (for keyboard users) */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--coreGold);
  color: var(--charcoal);
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

#### Tab Order

Ensure logical tab order:
1. Skip to main content link
2. Navigation menu
3. Main content
4. Footer links

#### Interactive Elements

All interactive elements must be keyboard accessible:

```html
<!-- Good: Native button -->
<button type="button" aria-label="Close menu">×</button>

<!-- Good: Accessible custom button -->
<div role="button" tabindex="0" aria-label="Close menu" onkeydown="handleKeyDown(event)">×</div>

<!-- Bad: Div without keyboard support -->
<div onclick="closeMenu()">×</div>
```

### 4. ARIA Labels

#### Buttons Without Text

```html
<!-- Good -->
<button aria-label="Close navigation menu">
  <i class="bi bi-x"></i>
</button>

<!-- Good -->
<button aria-label="Previous slide">
  <i class="bi bi-chevron-left"></i>
</button>
```

#### Form Labels

```html
<!-- Good -->
<label for="email">Email Address</label>
<input type="email" id="email" name="email" required>

<!-- Good: Hidden label for visual-only forms -->
<label for="search" class="visually-hidden">Search</label>
<input type="search" id="search" name="search" placeholder="Search...">
```

#### Landmarks

Use semantic HTML and ARIA landmarks:

```html
<header role="banner">
  <nav role="navigation" aria-label="Main navigation">
    <!-- Navigation content -->
  </nav>
</header>

<main role="main" id="main-content">
  <!-- Main content -->
</main>

<footer role="contentinfo">
  <!-- Footer content -->
</footer>
```

### 5. Form Accessibility

#### Required Fields

```html
<label for="name">
  Name <span aria-label="required">*</span>
</label>
<input type="text" id="name" name="name" required aria-required="true">
```

#### Error Messages

```html
<label for="email">Email</label>
<input type="email" id="email" name="email" aria-invalid="false" aria-describedby="email-error">
<span id="email-error" class="error-message" role="alert" aria-live="polite"></span>
```

#### Fieldset and Legend

For grouped form fields:

```html
<fieldset>
  <legend>Contact Information</legend>
  <label for="email">Email</label>
  <input type="email" id="email" name="email">
  
  <label for="phone">Phone</label>
  <input type="tel" id="phone" name="phone">
</fieldset>
```

### 6. Skip Links

Add skip links for keyboard users:

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--coreGold);
  color: var(--charcoal);
  padding: 8px 16px;
  text-decoration: none;
  z-index: 1000;
  border-radius: 0 0 4px 0;
}

.skip-link:focus {
  top: 0;
}
```

### 7. Language Declaration

Ensure HTML has correct language attribute:

```html
<html lang="en">
```

For content in other languages:

```html
<p>English text <span lang="fr">Texte français</span></p>
```

### 8. Testing Checklist

- [ ] All images have appropriate `alt` text
- [ ] Color contrast meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- [ ] All interactive elements are keyboard accessible
- [ ] Focus styles are visible on all focusable elements
- [ ] Tab order is logical
- [ ] Forms have proper labels and error messages
- [ ] ARIA labels are used where needed
- [ ] Skip links work correctly
- [ ] Page language is declared
- [ ] Tested with screen reader (NVDA, JAWS, or VoiceOver)
- [ ] Tested keyboard-only navigation
- [ ] Lighthouse accessibility score is 100

### 9. Screen Reader Testing

Test with:
- **NVDA** (Windows, free): https://www.nvaccess.org/
- **JAWS** (Windows, paid): https://www.freedomscientific.com/
- **VoiceOver** (macOS/iOS, built-in): Enable in System Preferences

### 10. Automated Testing

Use these tools:
- **Lighthouse** (Chrome DevTools): Accessibility audit
- **axe DevTools** (browser extension): Real-time accessibility checking
- **WAVE** (browser extension): Web accessibility evaluation

## Example: Complete Accessible Component

```html
<!-- Accessible card component -->
<article class="card" aria-labelledby="card-title-1">
  <img 
    src="assets/images/event.jpg" 
    alt="Corporate networking event with attendees at cocktail tables"
    loading="lazy"
    decoding="async"
    width="1600"
    height="900"
  >
  <div class="card-body">
    <h3 id="card-title-1" class="card-title">
      <a href="/event.html" aria-label="Read more about Corporate Networking Event">
        Corporate Networking Event
      </a>
    </h3>
    <p class="card-text">
      Description of the event...
    </p>
    <a href="/event.html" class="btn btn-gold" aria-label="Read case study for Corporate Networking Event">
      Read Case Study
    </a>
  </div>
</article>
```

## Resources

- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- WebAIM: https://webaim.org/
- A11y Project: https://www.a11yproject.com/
- MDN Accessibility: https://developer.mozilla.org/en-US/docs/Web/Accessibility
