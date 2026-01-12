# Codebase Audit & Cleanup - Bloom'n Events Co
**Date:** January 2026  
**Architect:** Senior Creative Technologist

## Executive Summary

This audit identifies foundational issues that need addressing before motion and layout refinement. The codebase shows good architectural intent (modular CSS, design tokens, motion system) but requires cleanup to achieve state-of-the-art standards.

## Critical Issues

### 1. CSS Specificity Wars
- **905 instances of `!important`** across styles.css
- Indicates systematic specificity conflicts
- Makes future maintenance difficult
- **Impact:** High - blocks clean refactoring

### 2. Duplicate CSS Rules
- `html { scroll-behavior: smooth; }` declared twice (lines 21, 39)
- Magic number `65px` (navbar height) repeated 5+ times
- Inconsistent spacing patterns (tokens vs hardcoded values)

### 3. File Organization
- Main `styles.css` is 4771 lines despite modular structure
- Imports exist but main file still contains everything
- Opportunity: Better separation of concerns

### 4. Spacing Inconsistencies
- Mix of design tokens (`--space-16`) and hardcoded values (`4rem`, `64px`)
- Section padding inconsistent across pages
- About page has custom overrides (40% reduction)

## Architecture Assessment

### Strengths
✅ Design token system in place (`tokens.css`)  
✅ Modular CSS structure (`base.css`, `components.css`, `motion.css`)  
✅ Motion system architecture documented  
✅ JavaScript well-organized with modules  
✅ Performance utilities (debounce, throttle, requestIdleCallback)

### Weaknesses
❌ CSS specificity wars (905 !important)  
❌ Duplicate rules and magic numbers  
❌ Inconsistent spacing system usage  
❌ Large monolithic main stylesheet

## Cleanup Plan

### Phase 1: Foundational Cleanup (Current)
1. Remove duplicate CSS rules
2. Consolidate magic numbers into tokens
3. Add architectural comments
4. Standardize spacing usage

### Phase 2: Specificity Reduction (Future)
1. Audit !important usage
2. Refactor selectors for proper specificity
3. Remove unnecessary !important flags

### Phase 3: Modularization (Future)
1. Move more code into modular files
2. Reduce main styles.css size
3. Better separation of concerns

## Interaction & Motion Philosophy

**Defined Principles:**
- Subtle, purposeful animations
- No decorative-only motion
- Performance-first approach
- Respects `prefers-reduced-motion`
- Motion guides attention and hierarchy

**Current State:**
- Motion system architecture exists
- GSAP + ScrollTrigger integration
- Base motion classes defined
- Needs refinement for consistency

## Next Steps

1. ✅ Complete foundational cleanup
2. ⏳ Prepare for motion refinement
3. ⏳ Layout consistency improvements
4. ⏳ Specificity reduction (Phase 2)
