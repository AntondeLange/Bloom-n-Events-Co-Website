# Motion Architecture - Bloom'n Events Co

**Date:** January 2026  
**Architect:** Senior Creative Technologist

## Overview

This document outlines the centralized animation and motion system architecture for the Bloom'n Events Co website. The system is designed to provide subtle, purposeful animations that guide user attention while maintaining performance and accessibility.

## Motion Philosophy

### Core Principles

1. **Subtle & Purposeful:** Animations guide attention, not distract
2. **No Decorative Motion:** Every animation serves a functional purpose
3. **Performance First:** Optimized for low-power devices and slow connections
4. **Accessibility:** Respects `prefers-reduced-motion` and gracefully degrades

### Animation Types

- **Page Load:** Hero content fade-in with subtle stagger
- **Scroll Reveals:** Elements fade and slide in as they enter viewport
- **Micro-Interactions:** Subtle hover and focus enhancements
- **No Auto-Play:** No decorative animations that loop or auto-play

## Architecture

### Centralized Controller

**File:** `scripts/animations.js`

Single source of truth for all animations. All animation logic is contained in this module to avoid scattered animation code throughout the codebase.

### Key Functions

- `initPageLoadAnimations()` - Hero content fade-in
- `initScrollReveals()` - Scroll-triggered element reveals
- `initMicroInteractions()` - Button and card hover effects
- `initAnimations()` - Main initialization function

### GSAP + ScrollTrigger

**Library:** GSAP 3.12.5 with ScrollTrigger plugin

- Loaded via CDN for performance
- Deferred loading to not block initial render
- Graceful fallback if library fails to load

### Configuration

```javascript
ANIMATION_CONFIG = {
  duration: {
    fast: 0.3s,
    base: 0.6s,
    slow: 1.0s
  },
  easing: {
    easeOut: 'power2.out',
    easeInOut: 'power2.inOut'
  },
  stagger: {
    small: 0.1s,
    medium: 0.15s,
    large: 0.2s
  }
}
```

## Performance Optimizations

### Device Detection

- Detects low-power devices (`navigator.hardwareConcurrency <= 2`)
- Disables animations on low-power devices
- Respects `prefers-reduced-motion` media query

### GPU Acceleration

Elements that animate use:
- `will-change: transform, opacity`
- `transform: translateZ(0)` for GPU acceleration

### Lazy Loading

- GSAP loaded after page is interactive
- Animations initialize after DOM is ready
- ScrollTrigger refreshes on window resize (debounced)

## CSS Motion System

**File:** `styles/motion.css`

### Base Classes

- `.scroll-reveal` - Base class for scroll-triggered reveals
- `.fade-in` - Simple fade-in animation
- `.slide-up` - Fade + slide up animation
- `.stagger-children` - Stagger animation for child elements

### Micro-Interactions

- Button hover: `translateY(-2px)`
- Card hover: `translateY(-4px)`
- Focus states: Enhanced outline with transition

## Typography & Spacing System

### Typography Scale

Standardized hierarchy using design tokens:

- **H1:** `3rem` (48px) - Display font, bold
- **H2:** `2.25rem` (36px) - Display font, bold
- **H3:** `1.5rem` (24px) - Body font, semibold
- **H4:** `1.25rem` (20px) - Body font, semibold
- **H5:** `1.125rem` (18px) - Body font, semibold
- **H6:** `1rem` (16px) - Body font, semibold
- **Body:** `1rem` (16px) - Body font, normal
- **Lead:** `1.125rem` (18px) - Body font, relaxed line-height

### Spacing Scale

Based on 8px base unit (0.5rem):

- `--space-1` through `--space-24` (4px to 96px)
- `--section-padding-y` - 4rem (64px) desktop
- `--section-padding-y-sm` - 3rem (48px) mobile

### Section Spacing

- `.section-main` - Standard section padding (4rem vertical)
- `.section-hero` - Hero section padding (4rem vertical, min-height 50vh)
- `.section-secondary` - Secondary section padding (3rem vertical)

## Implementation

### Page Load Sequence

1. Hero headline fades in (0.6s)
2. Hero subhead fades in (0.6s, -0.3s offset)
3. Hero CTA fades in (0.6s, -0.3s offset)

### Scroll Reveals

- Sections: Fade + slide up (40px) as they enter viewport
- Cards: Staggered reveal (0.15s delay between cards)
- Trigger: `top 85%` (element enters viewport)

### Micro-Interactions

- Buttons: Scale to 1.05 on hover
- Cards: Translate -4px on hover
- All interactions: 0.3s duration, ease-out

## Accessibility

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Focus States

- Visible focus outlines (2px solid gold)
- Smooth outline-offset transition
- Keyboard navigation fully supported

## Maintenance

### Adding New Animations

1. Add function to `scripts/animations.js`
2. Call from `initAnimations()`
3. Use `ANIMATION_CONFIG` for timing
4. Test with reduced motion enabled
5. Verify performance on low-power devices

### Best Practices

- Keep animations under 1s duration
- Use ease-out for most animations
- Stagger delays: 0.1s - 0.2s maximum
- Test on actual devices, not just desktop
- Monitor Core Web Vitals impact

## Files Modified

- `scripts/animations.js` - Centralized animation controller
- `styles/motion.css` - Motion system CSS
- `styles.css` - Typography and spacing normalization
- `styles/tokens.css` - Design tokens (imported)
- `index.html` - GSAP library integration
- `scripts.js` - Animation system initialization

## Future Enhancements

- Parallax effects for hero sections (if performance allows)
- Page transition animations (if SPA architecture adopted)
- Loading state animations
- Form validation animations
