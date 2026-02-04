/**
 * About page image carousel: auto-advancing image slides with prev/next.
 * Matches Bootstrap carousel slide/fade structure for about-workshop-carousel styling.
 */
import { useState, useEffect } from "react";
import Image from "./Image";

export interface AboutCarouselSlide {
  src: string;
  alt: string;
}

interface Props {
  id: string;
  slides: AboutCarouselSlide[];
  /** Auto-advance interval in ms */
  intervalMs?: number;
}

export default function AboutImageCarousel({
  id,
  slides,
  intervalMs = 5000,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    // Respect prefers-reduced-motion: pause auto-advance if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsAutoPlaying(false);
      return;
    }

    if (!isAutoPlaying || slides.length <= 1) return;
    const t = setInterval(
      () => setActiveIndex((prev) => (prev + 1) % slides.length),
      intervalMs
    );
    return () => clearInterval(t);
  }, [isAutoPlaying, intervalMs, slides.length]);

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };
  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  if (slides.length === 0) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
    }
  };

  return (
    <div
      className={`carousel slide carousel-fade about-workshop-carousel`}
      id={id}
      aria-label={`Image carousel: ${slides.length} images`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
    >
      <div className="carousel-inner">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`carousel-item ${i === activeIndex ? "active" : ""}`}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              className="block w-full h-full object-cover object-center"
              loading="lazy"
              decoding="async"
              width="1600"
              height="900"
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        className="carousel-control-prev"
        onClick={goPrev}
        aria-label="Previous image"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true" />
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        type="button"
        className="carousel-control-next"
        onClick={goNext}
        aria-label="Next image"
      >
        <span className="carousel-control-next-icon" aria-hidden="true" />
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
}
