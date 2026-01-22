/**
 * Centralized Animation Controller
 * 
 * Motion Philosophy:
 * - Subtle, purposeful animations that guide attention
 * - No decorative-only motion
 * - Graceful degradation for low-power devices
 * - Respects prefers-reduced-motion
 * 
 * Architecture:
 * - Single source of truth for all animations
 * - GSAP + ScrollTrigger for scroll-based reveals
 * - Performance-optimized with will-change hints
 */

// GSAP is loaded via CDN in HTML, available globally
// Wait for GSAP to be available
const waitForGSAP = () => {
  return new Promise((resolve) => {
    if (window.gsap && window.ScrollTrigger) {
      resolve();
    } else {
      const checkInterval = setInterval(() => {
        if (window.gsap && window.ScrollTrigger) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 50);
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(); // Resolve anyway to prevent blocking
      }, 5000);
    }
  });
};

const getGSAP = async () => {
  await waitForGSAP();
  return {
    gsap: window.gsap,
    ScrollTrigger: window.ScrollTrigger
  };
};

// Motion preferences
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isLowPowerDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
// Disable ScrollTrigger on mobile/tablet to prevent scroll interference
const isMobileOrTablet = window.matchMedia('(max-width: 991px)').matches || 
                         ('ontouchstart' in window) || 
                         (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

// Animation configuration
const ANIMATION_CONFIG = {
  duration: {
    fast: 0.3,
    base: 0.6,
    slow: 1.0
  },
  easing: {
    easeOut: 'power2.out',
    easeInOut: 'power2.inOut',
    easeIn: 'power2.in'
  },
  stagger: {
    small: 0.1,
    medium: 0.15,
    large: 0.2
  },
  scrollOffset: {
    start: 'top 100%', // Trigger when element enters viewport (top of element at bottom of viewport)
    end: 'bottom 20%'
  }
};

// Disable animations if user prefers reduced motion or on low-power devices
// Note: gsap config will be set after GSAP loads

/**
 * Initialize page load animations
 * Fades in hero content with subtle stagger
 */
export async function initPageLoadAnimations() {
  if (prefersReducedMotion || isLowPowerDevice) return;
  
  const gsapLib = await getGSAP();
  if (!gsapLib || !gsapLib.gsap) return;
  const { gsap } = gsapLib;
  
  // Configure GSAP for reduced motion if needed
  if (prefersReducedMotion || isLowPowerDevice) {
    gsap.config({ nullTargetWarn: false });
    gsap.defaults({ duration: 0.01, ease: 'none' });
    return;
  }

  const heroHeadline = document.querySelector('.hero-headline');
  const heroSubhead = document.querySelector('.hero-subhead');
  const heroCta = document.querySelector('.hero-cta');

  if (heroHeadline && heroSubhead && heroCta) {
    const tl = gsap.timeline({ defaults: { ease: ANIMATION_CONFIG.easing.easeOut } });
    
    tl.set([heroHeadline, heroSubhead, heroCta], { opacity: 0, y: 20 })
      .to(heroHeadline, { 
        opacity: 1, 
        y: 0, 
        duration: ANIMATION_CONFIG.duration.base 
      })
      .to(heroSubhead, { 
        opacity: 1, 
        y: 0, 
        duration: ANIMATION_CONFIG.duration.base 
      }, '-=0.3')
      .to(heroCta, { 
        opacity: 1, 
        y: 0, 
        duration: ANIMATION_CONFIG.duration.base 
      }, '-=0.3');
  }
}

/**
 * Initialize scroll-triggered reveals
 * Reveals elements as they enter viewport with fade + slide
 * Disabled on mobile/tablet to prevent scroll interference
 */
export async function initScrollReveals() {
  if (prefersReducedMotion || isLowPowerDevice || isMobileOrTablet) return;
  
  const gsapLib = await getGSAP();
  if (!gsapLib || !gsapLib.gsap || !gsapLib.ScrollTrigger) return;
  const { gsap, ScrollTrigger } = gsapLib;
  
  // Register ScrollTrigger plugin
  gsap.registerPlugin(ScrollTrigger);

  // Reveal sections
  const revealSections = document.querySelectorAll('.section-main, .section-hero');
  revealSections.forEach((section) => {
    gsap.fromTo(section, 
      { 
        opacity: 0, 
        y: 40 
      },
      {
        opacity: 1,
        y: 0,
        duration: ANIMATION_CONFIG.duration.base,
        ease: ANIMATION_CONFIG.easing.easeOut,
        scrollTrigger: {
          trigger: section,
          start: ANIMATION_CONFIG.scrollOffset.start,
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // Reveal cards with stagger
  const cardGroups = document.querySelectorAll('.row.g-4, .row.g-3');
  cardGroups.forEach((group) => {
    const cards = group.querySelectorAll('.card, .service-card, .case-study-card, .why-us-card');
    if (cards.length > 0) {
      gsap.fromTo(cards,
        {
          opacity: 0,
          y: 30
        },
        {
          opacity: 1,
          y: 0,
          duration: ANIMATION_CONFIG.duration.base,
          ease: ANIMATION_CONFIG.easing.easeOut,
          stagger: ANIMATION_CONFIG.stagger.medium,
          scrollTrigger: {
            trigger: group,
            start: ANIMATION_CONFIG.scrollOffset.start,
            toggleActions: 'play none none none'
          }
        }
      );
    }
  });
}

/**
 * Initialize micro-interactions
 * Subtle hover and focus enhancements
 */
export async function initMicroInteractions() {
  if (prefersReducedMotion || isLowPowerDevice) return;
  
  const gsapLib = await getGSAP();
  if (!gsapLib || !gsapLib.gsap) return;
  const { gsap } = gsapLib;

  // Button hover enhancements
  const buttons = document.querySelectorAll('.btn:not(.btn-static)');
  buttons.forEach((btn) => {
    btn.addEventListener('mouseenter', () => {
      gsap.to(btn, {
        scale: 1.05,
        duration: ANIMATION_CONFIG.duration.fast,
        ease: ANIMATION_CONFIG.easing.easeOut
      });
    });
    
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        scale: 1,
        duration: ANIMATION_CONFIG.duration.fast,
        ease: ANIMATION_CONFIG.easing.easeOut
      });
    });
  });

  // Card hover enhancements
  const cards = document.querySelectorAll('.card, .service-card, .case-study-card');
  cards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        y: -4,
        duration: ANIMATION_CONFIG.duration.fast,
        ease: ANIMATION_CONFIG.easing.easeOut
      });
    });
    
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        y: 0,
        duration: ANIMATION_CONFIG.duration.fast,
        ease: ANIMATION_CONFIG.easing.easeOut
      });
    });
  });
}

/**
 * Initialize all animations
 * Called after DOM is ready
 */
export async function initAnimations() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
      await Promise.all([
        initPageLoadAnimations(),
        initScrollReveals(),
        initMicroInteractions()
      ]);
    });
  } else {
    await Promise.all([
      initPageLoadAnimations(),
      initScrollReveals(),
      initMicroInteractions()
    ]);
  }

  // Refresh ScrollTrigger on window resize (desktop only)
  // Skip on mobile/tablet to prevent scroll interference
  if (!isMobileOrTablet) {
    const gsapLib = await getGSAP();
    if (gsapLib && gsapLib.ScrollTrigger) {
      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          gsapLib.ScrollTrigger.refresh();
        }, 250);
      });
    }
  }
}

// Cleanup on page unload
window.addEventListener('beforeunload', async () => {
  const gsapLib = await getGSAP();
  if (gsapLib && gsapLib.ScrollTrigger) {
    gsapLib.ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }
});

// Make initAnimations available globally for scripts.js
window.initAnimations = initAnimations;
