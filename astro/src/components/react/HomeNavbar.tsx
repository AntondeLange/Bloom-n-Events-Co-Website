/**
 * Homepage Navbar React Component
 * 
 * Handles navbar positioning with React state management:
 * - Non-homepage: Always fixed at top
 * - Homepage: Starts at bottom, moves to top on scroll, returns to bottom
 * 
 * Uses IntersectionObserver to detect scroll boundaries.
 */
import { useEffect, useRef, useState } from "react";
import NavbarContent from "../NavbarContent.astro";

interface HomeNavbarProps {
  currentPath?: string;
  isHome: boolean;
}

export default function HomeNavbar({ currentPath = "/", isHome }: HomeNavbarProps) {
  const [navPosition, setNavPosition] = useState<"bottom" | "top">(isHome ? "bottom" : "top");
  const navbarRef = useRef<HTMLElement>(null);
  const heroObserverRef = useRef<IntersectionObserver | null>(null);
  const footerObserverRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const navbar = navbarRef.current;
    if (!navbar) return;

    // NON-HOMEPAGE → always fixed top
    if (!isHome) {
      setNavPosition("top");
      navbar.dataset.navPos = "top";
      navbar.style.setProperty("position", "fixed", "important");
      navbar.style.setProperty("top", "env(safe-area-inset-top, 0)", "important");
      navbar.style.setProperty("bottom", "auto", "important");
      navbar.style.setProperty("z-index", "50", "important");
      return;
    }

    // HOMEPAGE → start at bottom
    const setBottom = () => {
      setNavPosition("bottom");
      if (navbar) {
        navbar.dataset.navPos = "bottom";
        navbar.style.setProperty("position", "fixed", "important");
        navbar.style.setProperty("bottom", "env(safe-area-inset-bottom, 0)", "important");
        navbar.style.setProperty("top", "auto", "important");
        navbar.style.setProperty("z-index", "40", "important");
      }
    };

    const setTop = () => {
      setNavPosition("top");
      if (navbar) {
        navbar.dataset.navPos = "top";
        navbar.style.setProperty("position", "fixed", "important");
        navbar.style.setProperty("top", "env(safe-area-inset-top, 0)", "important");
        navbar.style.setProperty("bottom", "auto", "important");
        navbar.style.setProperty("z-index", "50", "important");
      }
    };

    // Initial state: bottom
    setBottom();

    // Find sentinels
    const heroSentinel = document.querySelector("[data-hero-sentinel]");
    const footerSentinel = document.querySelector("[data-footer-sentinel]");

    if (!heroSentinel || !footerSentinel) {
      console.warn("HomeNavbar: sentinels not found, defaulting to bottom");
      return;
    }

    // HERO observer → move navbar to top when hero leaves viewport
    heroObserverRef.current = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setTop();
        } else {
          setBottom();
        }
      },
      { root: null, threshold: 0 }
    );
    heroObserverRef.current.observe(heroSentinel);

    // FOOTER observer → reset navbar to bottom when footer enters viewport
    footerObserverRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setBottom();
        }
      },
      { root: null, threshold: 0 }
    );
    footerObserverRef.current.observe(footerSentinel);

    // Cleanup
    return () => {
      heroObserverRef.current?.disconnect();
      footerObserverRef.current?.disconnect();
    };
  }, [isHome]);

  // Determine classes based on position
  const positionClasses =
    navPosition === "bottom"
      ? "fixed bottom-[env(safe-area-inset-bottom)] inset-x-0 z-40 border-t-2"
      : "fixed top-[env(safe-area-inset-top)] inset-x-0 z-50 border-b-2";

  return (
    <nav
      ref={navbarRef}
      id="main-navbar"
      className={`navbar w-full bg-charcoal ${positionClasses} transition-[background-color,box-shadow] duration-300 border-gold`}
      role="navigation"
      aria-label="Primary"
      data-nav-pos={navPosition}
    >
      <NavbarContent currentPath={currentPath} isHome={isHome} />
    </nav>
  );
}
