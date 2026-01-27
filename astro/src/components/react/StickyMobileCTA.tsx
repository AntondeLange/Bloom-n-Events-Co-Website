/**
 * Sticky Mobile CTA: shows on mobile when scrolling past hero.
 * React island with client:idle - scroll detection requires JS.
 */
import { useEffect, useState } from "react";

export default function StickyMobileCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight;
      // Show after scrolling past hero (100vh)
      setIsVisible(scrollY > heroHeight);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      id="stickyMobileCTA"
      className={`sticky-mobile-cta ${isVisible ? "show" : ""}`}
      role="complementary"
      aria-label="Mobile call to action"
    >
      <div className="container">
        <div className="sticky-mobile-cta-text">Ready to start your project?</div>
        <a href="/contact" className="btn-gold">
          Start Your Project
        </a>
      </div>
    </div>
  );
}
