/**
 * Navbar Position Controller (React)
 * 
 * Handles navbar positioning logic using React state and effects.
 * Applies positioning to the existing #main-navbar element.
 * 
 * This ensures the navbar starts at bottom on homepage and transitions correctly.
 */
import { useEffect, useState } from "react";

interface NavbarPositionControllerProps {
  isHome: boolean;
}

export default function NavbarPositionController({ isHome }: NavbarPositionControllerProps) {
  const [navPosition, setNavPosition] = useState<"bottom" | "top">(isHome ? "bottom" : "top");
  const lockedTop = useRef(false);

  useEffect(() => {
    // CRITICAL: Set positioning immediately, synchronously
    const navbar = document.getElementById("main-navbar");
    if (!navbar) {
      console.error("NavbarPositionController: navbar element not found");
      return;
    }

    const setBottom = () => {
      if (lockedTop.current) return;
      setNavPosition("bottom");
      navbar.dataset.navPos = "bottom";
      // Remove top classes
      navbar.classList.remove("top-[env(safe-area-inset-top)]", "z-50", "border-b-2");
      // Add bottom classes
      navbar.classList.add("fixed", "bottom-[env(safe-area-inset-bottom)]", "inset-x-0", "z-40", "border-t-2");
    };

    const setTop = () => {
      lockedTop.current = true;
      setNavPosition("top");
      navbar.dataset.navPos = "top";
      // Remove bottom classes
      navbar.classList.remove("bottom-[env(safe-area-inset-bottom)]", "z-40", "border-t-2");
      // Add top classes
      navbar.classList.add("fixed", "top-[env(safe-area-inset-top)]", "inset-x-0", "z-50", "border-b-2");
    };

    // NON-HOMEPAGE → always fixed top
    if (!isHome) {
      setTop();
      return;
    }

    // HOMEPAGE → start at bottom IMMEDIATELY (synchronously)
    // CRITICAL: Always start at bottom on homepage, regardless of scroll position
    console.log("NavbarPositionController: Setting initial state to bottom (isHome:", isHome, ", scrollY:", window.scrollY, ")");
    setBottom();

    // Find hero sentinel (footer sentinel no longer needed)
    const heroSentinel = document.querySelector("[data-hero-sentinel]");

    if (!heroSentinel) {
      console.warn("NavbarPositionController: hero sentinel not found", { heroSentinel });
      return;
    }

      // Fallback: if user scrolls even slightly, force top and keep it there (prevents stuck-at-bottom)
      const onScrollFallback = () => {
        if (window.scrollY > 12) {
          setTop();
          window.removeEventListener("scroll", onScrollFallback);
        }
      };
      window.addEventListener("scroll", onScrollFallback, { passive: true });

    // CRITICAL: Wait a frame before setting up observers to ensure initial bottom state is applied
    // This prevents the observer from immediately overriding our initial bottom positioning
    requestAnimationFrame(() => {
      // Track if this is the first callback (to ignore initial false positives)
      let isFirstCallback = true;
      const initialScrollY = window.scrollY;
      
      // HERO observer → move navbar to top when hero leaves viewport
      // Once navbar moves to top, it stays there (never goes back to bottom)
      const heroObserver = new IntersectionObserver(
        ([entry]) => {
          const currentScrollY = window.scrollY;
          console.log("NavbarPositionController: Hero sentinel intersection changed:", entry.isIntersecting, "scrollY:", currentScrollY, "isFirstCallback:", isFirstCallback);
          
          // CRITICAL: On initial load, if we're at the top of the page, ignore the observer
          // and force bottom position. This prevents false positives from layout shifts.
          if (isFirstCallback && currentScrollY <= 10) {
            console.log("NavbarPositionController: Ignoring first callback at top of page, forcing bottom");
            setBottom();
            isFirstCallback = false;
            return;
          }
          
          isFirstCallback = false;
          
          if (!entry.isIntersecting) {
            // Hero has left viewport → move to top and stay there
            console.log("NavbarPositionController: Hero left viewport, moving navbar to top");
            setTop();
          }
          // CRITICAL: Do NOT move back to bottom when hero re-enters
          // Navbar should stay at top once it moves there to ensure it's always visible
        },
        { root: null, threshold: 0 }
      );
      heroObserver.observe(heroSentinel);

      // Store observer for cleanup
      (window as any).__navbarHeroObserver = heroObserver;

      // FOOTER observer removed - navbar should stay visible at top once hero is passed
      // No need to move navbar back to bottom when footer is visible
    });

    // Cleanup
    return () => {
      if ((window as any).__navbarHeroObserver) {
        (window as any).__navbarHeroObserver.disconnect();
        delete (window as any).__navbarHeroObserver;
      }
      window.removeEventListener("scroll", onScrollFallback);
    };
  }, [isHome]);

  // This component doesn't render anything - it just controls the navbar
  return null;
}
