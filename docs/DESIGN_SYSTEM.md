# Design System - Bloom'n Events Co

**Version:** 1.0  
**Last Updated:** January 2026

## Overview

This design system provides a consistent, scalable foundation for the Bloom'n Events Co website. It uses design tokens for colors, typography, spacing, and other design decisions, ensuring visual consistency and easier maintenance.

## File Structure

```
styles/
├── tokens.css      # Design tokens (colors, typography, spacing, shadows, etc.)
├── base.css        # Reset, typography, foundational styles
├── components.css  # Reusable UI components (buttons, cards, sections, forms)
├── utilities.css   # Single-purpose helper classes
└── legacy.css      # Complex components (navbar, carousel, chatbot, footer)
```

## Design Tokens

### Color Palette

#### Brand Colors
- `--color-brand-gold`: `#BF9B30` - Primary brand color
- `--color-brand-charcoal`: `#1E1E1E` - Primary text/dark backgrounds
- `--color-brand-champers`: `#F2E8DA` - Background/light accent
- `--color-brand-blush`: `#D5B7A0` - Secondary accent
- `--color-brand-cream`: `#F5F5DC` - Light background variant

#### Semantic Colors
- `--color-text-primary`: Primary text color
- `--color-text-secondary`: Secondary text color
- `--color-text-muted`: Muted text color
- `--color-text-link`: Link color (gold)
- `--color-text-link-hover`: Link hover color
- `--color-focus`: Focus ring color
- `--color-focus-ring`: Focus ring with opacity

### Typography Scale

The typography system uses a responsive scale based on rem units:

- `--font-size-xs`: 0.75rem (12px)
- `--font-size-sm`: 0.875rem (14px)
- `--font-size-base`: 1rem (16px) - Base font size
- `--font-size-lg`: 1.125rem (18px)
- `--font-size-xl`: 1.25rem (20px)
- `--font-size-2xl`: 1.5rem (24px)
- `--font-size-3xl`: 1.875rem (30px)
- `--font-size-4xl`: 2.25rem (36px)
- `--font-size-5xl`: 3rem (48px)
- `--font-size-6xl`: 3.75rem (60px)

#### Font Families
- `--font-display`: 'Dancing Script', cursive - For headings (h1, h2)
- `--font-body`: 'Montserrat', sans-serif - For body text and UI

#### Font Weights
- `--font-weight-normal`: 400
- `--font-weight-medium`: 500
- `--font-weight-semibold`: 600
- `--font-weight-bold`: 700

#### Line Heights
- `--line-height-tight`: 1.2 - For headings
- `--line-height-snug`: 1.4 - For subheadings
- `--line-height-normal`: 1.6 - For body text
- `--line-height-relaxed`: 1.8 - For lead text

### Spacing Scale

Based on 8px base unit (0.5rem):

- `--space-0`: 0
- `--space-1`: 0.25rem (4px)
- `--space-2`: 0.5rem (8px)
- `--space-3`: 0.75rem (12px)
- `--space-4`: 1rem (16px)
- `--space-5`: 1.25rem (20px)
- `--space-6`: 1.5rem (24px)
- `--space-8`: 2rem (32px)
- `--space-10`: 2.5rem (40px)
- `--space-12`: 3rem (48px)
- `--space-16`: 4rem (64px)
- `--space-20`: 5rem (80px)
- `--space-24`: 6rem (96px)

#### Section Spacing
- `--section-padding-y`: 4rem (64px) - Vertical padding for sections
- `--section-padding-y-sm`: 3rem (48px) - Vertical padding on mobile
- `--section-padding-x`: 1rem (16px) - Horizontal padding for sections

### Border Radius

- `--radius-sm`: 0.25rem (4px)
- `--radius-md`: 0.5rem (8px)
- `--radius-lg`: 0.75rem (12px)
- `--radius-xl`: 1rem (16px)
- `--radius-2xl`: 1.5rem (24px)
- `--radius-full`: 9999px (for circles)

### Shadows

- `--shadow-sm`: Subtle shadow for cards
- `--shadow-md`: Standard shadow for elevated elements
- `--shadow-lg`: Strong shadow for modals/overlays
- `--shadow-xl`: Maximum shadow for hero elements
- `--shadow-text`: Text shadow for headings

### Transitions

- `--transition-fast`: 150ms ease
- `--transition-base`: 250ms ease (default)
- `--transition-slow`: 350ms ease
- `--transition-all`: all 250ms ease

## Components

### Buttons

#### Primary Button (`.btn-primary`, `.btn-gold`)
- Gold background with charcoal text
- Hover: Inverted colors with slight lift
- Focus: Visible outline ring
- Sizes: `.btn-sm`, `.btn-lg`

#### Secondary Button (`.btn-secondary`, `.btn-outline-gold`)
- Transparent background with gold border and text
- Hover: Fills with gold background
- Focus: Visible outline ring

#### Text Button (`.btn-text`)
- Transparent background, underlined text
- Hover: Removes underline
- Minimal styling for subtle actions

### Cards

#### Standard Card (`.card`)
- White/light background with subtle border
- Hover: Lifts with shadow
- Responsive padding
- Image support with `.card-img-top`
- Body content with `.card-body`
- Footer with `.card-footer`

#### Service Card (`.service-card`)
- Specialized card for service listings
- Enhanced hover state with gold border

### Sections

#### Main Section (`.section-main`)
- Consistent vertical padding (64px desktop, 48px mobile)
- Horizontal padding for container
- Can have background variants (`.bg-light-gold`, `.bg-light`)

#### Heading with Background (`.heading-blush-bg`)
- Blush-colored background with rounded corners
- Used for section headings
- Responsive padding

### Forms

#### Form Controls (`.form-control`)
- Consistent styling across inputs
- Focus state with gold ring
- Disabled state with reduced opacity
- Labels with `.form-label`

## Usage Examples

### Button
```html
<!-- Primary -->
<a href="#" class="btn btn-primary">Get Started</a>

<!-- Secondary -->
<a href="#" class="btn btn-secondary">Learn More</a>

<!-- Text -->
<a href="#" class="btn btn-text">Read More</a>
```

### Card
```html
<div class="card">
  <img src="image.jpg" class="card-img-top" alt="...">
  <div class="card-body">
    <h3 class="card-title">Card Title</h3>
    <p class="card-text">Card description text.</p>
    <a href="#" class="btn btn-primary btn-sm">Action</a>
  </div>
</div>
```

### Section
```html
<section class="section-main">
  <div class="container">
    <h2 class="heading-blush-bg content-heading-large text-center">
      Section Heading
    </h2>
    <!-- Content -->
  </div>
</section>
```

## Accessibility

### Focus States
All interactive elements have visible focus states using:
- `outline: 2px solid var(--color-focus)`
- `outline-offset: 2px`
- `border-radius: var(--radius-sm)`

### Color Contrast
- Text colors meet WCAG AA standards
- Focus indicators are high contrast
- Links have hover states for better visibility

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Focus order is logical
- Skip links provided for main content

## Responsive Design

### Breakpoints
- `--breakpoint-sm`: 576px
- `--breakpoint-md`: 768px
- `--breakpoint-lg`: 992px
- `--breakpoint-xl`: 1200px
- `--breakpoint-xxl`: 1400px

### Typography Scaling
- Base font size: 16px (desktop), 15px (tablet), 14px (mobile)
- Headings scale down proportionally on smaller screens
- Line heights adjust for readability

### Spacing Adjustments
- Section padding reduces on mobile
- Container padding adjusts for smaller screens
- Button sizes can be adjusted with size modifiers

## Migration Notes

### Backward Compatibility
The system maintains backward compatibility with old variable names:
- `--coreCharcoal` → `--color-brand-charcoal`
- `--coreGold` → `--color-brand-gold`
- `--coreChampers` → `--color-bg-primary`

### Gradual Migration
- Legacy components are in `legacy.css`
- These will be gradually migrated to use design tokens
- Old class names are maintained for compatibility

## Best Practices

1. **Use Design Tokens**: Always use CSS variables instead of hardcoded values
2. **Consistent Spacing**: Use the spacing scale for margins and padding
3. **Typography Hierarchy**: Use semantic HTML and appropriate heading levels
4. **Accessibility First**: Ensure all interactive elements have focus states
5. **Responsive**: Test components at all breakpoints
6. **Performance**: Keep transitions subtle and fast (150-350ms)

## Component Contracts

### Navbar Visual Consistency Contract

**Navbars may transition:**
- Color
- Shadow
- Opacity
- Transform (translate-y only, never position)

**Navbars must NEVER transition:**
- Layout properties
- Positional properties (top, bottom, left, right)
- Position context (absolute ↔ fixed)

This contract ensures visual consistency and prevents layout bugs during navbar state changes. See `.cursor/rules/navbar-guardrails.md` for implementation guardrails.

## Future Enhancements

- Dark mode support (tokens ready)
- Additional component variants
- Animation system
- Grid system tokens
- Component documentation with examples
