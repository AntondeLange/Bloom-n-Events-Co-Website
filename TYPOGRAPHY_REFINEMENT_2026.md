# Typography & Layout Refinement - Bloom'n Events Co
**Date:** January 2026  
**Architect:** Senior Frontend Engineer

## Summary

Refined typography, spacing, and layout to achieve a calm, intentional, premium feel similar to HelloMonday and Weberous. All changes preserve existing brand identity while improving readability and visual hierarchy.

## Changes Implemented

### 1. Typography Hierarchy

**Headings:**
- **H1:** Increased bottom margin from `1.5rem` to `2rem` for better separation
- **H2:** Increased bottom margin from `1.25rem` to `2rem` for better separation
- **H3:** Increased bottom margin from `1rem` to `1.5rem` for clearer hierarchy
- Removed duplicate h2 style definition that conflicted with base styles

**Body Text:**
- Increased line-height from `1.6` to `1.75` for better readability
- Increased paragraph spacing from `1rem` to `1.5rem` for better separation
- Applied optimal reading width (65ch) to paragraphs in content areas
- Lead text: 70ch max-width, increased spacing to `2rem`

### 2. Vertical Rhythm

**Section Spacing:**
- Standardized section padding using design tokens
- Removed conflicting margins between sections
- Consistent spacing: `4rem` desktop, `3rem` mobile

**Content Blocks:**
- Standardized event/workshop/display section padding to `2rem` (from 30px)
- Consistent margin-bottom of `2rem` for content blocks
- Added margin normalization between adjacent sections

### 3. Content Readability

**Paragraph Optimization:**
- Max-width of 65ch applied to paragraphs in content areas
- Lead text: 70ch max-width
- Improved line-height (1.75) for better readability
- Increased spacing between paragraphs (1.5rem)

**Heading Spacing:**
- Standardized heading-blush-bg padding using tokens
- Consistent margin-bottom of `2.5rem` for styled headings
- Better visual separation between headings and content

### 4. CSS Normalization

**Design Tokens:**
- Added `--content-max-width: 65ch` token
- Added `--content-max-width-wide: 70ch` token
- Added `--content-spacing` token for future use
- Standardized all spacing values to use tokens

**Utility Classes:**
- Created `.content-width` utility for optimal reading width
- Created `.content-width-wide` utility for lead text
- Standardized utility classes to use design tokens

**Removed Duplicates:**
- Removed duplicate `html { scroll-behavior: smooth; }` declaration
- Removed conflicting h2 style definition
- Consolidated magic numbers into tokens

## Typography System

### Hierarchy
- **H1:** 3rem (48px) - Display font, gold, 2rem bottom margin
- **H2:** 2.25rem (36px) - Display font, gold, 2rem bottom margin
- **H3:** 1.5rem (24px) - Body font, charcoal, 1.5rem bottom margin
- **Body:** 1rem (16px) - Line-height 1.75, 1.5rem spacing, 65ch max-width
- **Lead:** 1.125rem (18px) - Line-height 1.8, 2rem spacing, 70ch max-width

### Spacing Scale
- Section padding: 4rem (64px) desktop, 3rem (48px) mobile
- Content block padding: 2rem (32px)
- Paragraph spacing: 1.5rem (24px)
- Heading spacing: 2rem (32px) for H1/H2, 1.5rem for H3

## Visual Improvements

1. **Better Readability:** Increased line-height and optimal reading width
2. **Clearer Hierarchy:** Improved spacing between heading levels
3. **Consistent Rhythm:** Standardized vertical spacing throughout
4. **Premium Feel:** Calm, intentional spacing similar to reference sites

## Notes

- All changes preserve existing brand colors and fonts
- No decorative elements added
- Layout changes are refinements, not redesigns
- Ready for motion refinement phase

## Next Steps (Future)

1. Review H1 usage across all pages (ensure one per page)
2. Consider further reducing !important usage (905 instances remain)
3. Motion refinement using existing motion system
4. Additional layout consistency improvements
