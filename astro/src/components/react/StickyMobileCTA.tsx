/**
 * Sticky Mobile CTA: shows on mobile when scrolling past hero.
 * React island with client:idle - scroll detection requires JS.
 */
import { useEffect, useState } from "react";

export default function StickyMobileCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const sentinel = document.querySelector("[data-hero-sentinel]");
    if (!sentinel) {
      setIsVisible(window.scrollY > window.innerHeight);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      id="stickyMobileCTA"
      className={`sticky-mobile-cta ${isVisible ? "show" : ""}`}
      role="complementary"
      aria-label="Mobile call to action"
    >
      <div className="container">
        <div className="sticky-mobile-cta-text">Ready to create together?</div>
        <a href="/contact" className="btn-gold">
          Start the Conversation
        </a>
      </div>
    </div>
  );
}
