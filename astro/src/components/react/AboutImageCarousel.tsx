/**
 * About page image carousel: auto-advancing image slides with prev/next.
 * Matches Bootstrap carousel slide/fade structure for about-workshop-carousel styling.
 */
import { useState, useEffect } from "react";
import OptimizedImage from "./OptimizedImage";
import ImageLightbox from "./ImageLightbox";


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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsAutoPlaying(false);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
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
            <OptimizedImage
              src={slide.src}
              alt={slide.alt}
              className="block w-full h-full object-cover object-center"
              sizes="(max-width: 768px) 100vw, 80vw"
              loading="lazy"
              decoding="async"
              width={1600}
              height={900}
              role="button"
              tabIndex={0}
              aria-label={`Open full-size image: ${slide.alt}`}
              onClick={() => openLightbox(i)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openLightbox(i);
                }
              }}
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
      {lightboxIndex !== null && slides[lightboxIndex] && (
        <ImageLightbox
          src={slides[lightboxIndex].src}
          alt={slides[lightboxIndex].alt}
          onClose={closeLightbox}
        />
      )}
    </div>
  );
}
