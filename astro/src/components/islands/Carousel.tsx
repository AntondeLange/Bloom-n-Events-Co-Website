import { useEffect, useId, useMemo, useState, type KeyboardEvent } from "react";
import OptimizedImage from "../react/OptimizedImage";
import ImageLightbox from "../react/ImageLightbox";


export interface CarouselSlide {
  src: string;
  alt: string;
}

interface Props {
  id?: string;
  slides: CarouselSlide[];
  /** Auto-advance interval in ms */
  intervalMs?: number;
  /** Enable windowed rendering once slide count exceeds this threshold */
  virtualizeThreshold?: number;
  /** Number of slides to keep mounted when windowed rendering is enabled */
  renderWindow?: number;
  className?: string;
}

export default function Carousel({
  id,
  slides,
  intervalMs = 5000,
  virtualizeThreshold = 8,
  renderWindow = 5,
  className = "",
}: Props) {
  // Auto-generate an ID when none is provided so that multiple carousels stay unique.
  const autoId = useId();
  const carouselId = id ?? `carousel-${autoId}`;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setIsAutoPlaying(false);
      return;
    }

    if (!isAutoPlaying || slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isAutoPlaying, intervalMs, slides.length]);

  useEffect(() => {
    if (!slides.length) {
      setActiveIndex(0);
      return;
    }
    setActiveIndex((prev) => Math.min(prev, slides.length - 1));
  }, [slides.length]);

  const normalizedThreshold = Math.max(1, Math.floor(virtualizeThreshold));
  const normalizedWindow = Math.max(3, Math.floor(renderWindow));
  const cappedWindow = Math.min(slides.length, normalizedWindow);
  const windowSize = cappedWindow % 2 === 0 && cappedWindow > 1 ? cappedWindow - 1 : cappedWindow;
  const shouldVirtualize = slides.length > normalizedThreshold && windowSize < slides.length;

  const renderedIndices = useMemo(() => {
    if (!shouldVirtualize) {
      return Array.from({ length: slides.length }, (_, index) => index);
    }

    const halfWindow = Math.floor(windowSize / 2);
    const indices: number[] = [];
    for (let offset = -halfWindow; offset <= halfWindow; offset += 1) {
      indices.push((activeIndex + offset + slides.length) % slides.length);
    }
    return indices;
  }, [activeIndex, shouldVirtualize, slides.length, windowSize]);

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

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    }
  };

  if (!slides.length) return null;

  return (
    <div
      className={`carousel slide carousel-fade about-workshop-carousel ${className}`.trim()}
      id={carouselId}
      aria-label={`Image carousel: ${slides.length} images`}
      role="region"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="carousel-inner">
        {renderedIndices.map((index) => {
          const slide = slides[index];
          if (!slide) return null;

          const rawDistance = Math.abs(index - activeIndex);
          const circularDistance = Math.min(rawDistance, slides.length - rawDistance);
          const shouldEagerLoad = circularDistance <= 1;

          return (
            <div key={index} className={`carousel-item ${index === activeIndex ? "active" : ""}`}>
              <OptimizedImage
                src={slide.src}
                alt={slide.alt}
                className="block w-full h-full object-cover object-center"
                sizes="(max-width: 768px) 100vw, 80vw"
                loading={shouldEagerLoad ? "eager" : "lazy"}
                decoding="async"
                width={1600}
                height={900}
                role="button"
                tabIndex={0}
                aria-label={`Open full-size image: ${slide.alt}`}
                onClick={() => openLightbox(index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openLightbox(index);
                  }
                }}
              />
            </div>
          );
        })}
      </div>
      <button type="button" className="carousel-control-prev" onClick={goPrev} aria-label="Previous image">
        <span className="carousel-control-prev-icon" aria-hidden="true" />
        <span className="visually-hidden">Previous</span>
      </button>
      <button type="button" className="carousel-control-next" onClick={goNext} aria-label="Next image">
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
