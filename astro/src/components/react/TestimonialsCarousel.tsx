/**
 * Testimonials carousel: rotating testimonials with navigation.
 * React island with client:idle - carousel interactivity requires JS.
 */
import { useState, useEffect } from "react";

interface Testimonial {
  image: string;
  imageAlt: string;
  name: string;
  position: string;
  quote: string;
}

const testimonials: Testimonial[] = [
  {
    image: "/assets/images/Testimonials/testimonial-1.png",
    imageAlt: "Hawaiian Shopping Centres logo",
    name: "Sophie Brinklow",
    position: "Marketing Executive, Suburban Shopping Centres, Hawaiian",
    quote:
      "Tamara and Anton were given the brief to provide a one-day event at Hawaiian's Forrestfield that celebrated the opening of a key tenant, but also highlighted the diversity of our food offering at the Centre. We wanted to create a fun and engaging family friendly activation that encouraged dwell and participation. Every aspect of the event was managed with professionalism and attention to detail, ensuring a seamless experience for both our retailers and the community. We highly recommend Bloom n Co for their creativity, organisation, and commitment to delivering outstanding results.",
  },
  {
    image: "/assets/images/Testimonials/testimonial-2.png",
    imageAlt: "Centuria Capital logo",
    name: "Val Neal",
    position: "Property Manager, One Forty St Georges",
    quote: "We couldn't have done it without you. Everyone loved the concept.",
  },
  {
    image: "/assets/images/Testimonials/testimonial-3.png",
    imageAlt: "Hawaiian Shopping Centres logo",
    name: "Sarah Moore",
    position: "Portfolio Marketing Manager, Hawaiian Pty Ltd",
    quote:
      "Hawaiian engaged Bloom'n Events Co to run a food-based July school holiday activity across seven of our suburban neighbourhood assets. The activity was not only unique but beautifully presented, with every detail considered. Commercially, the activities drove traffic uplifts and encouraged dwell amongst our most valuable market segment – families. We would not hesitate to engage the Bloom'n team again.",
  },
  {
    image: "/assets/images/Testimonials/testimonial-2.png",
    imageAlt: "Centuria Capital logo",
    name: "Caitlin Comiskey",
    position: "Property Manager, One Forty St Georges",
    quote:
      "Working with Bloom'n Events throughout 2025 — from the 50th Anniversary Gala to the Connect 140 activation, and everything in between — it has been an absolute pleasure. Tamara and the team consistently deliver above and beyond, bringing creativity, professionalism, and seamless coordination to every project. From early planning and artwork preparation to executing flawless event styling, run sheets, and on‑the‑day management, their attention to detail is exceptional. Their ability to understand our vision, elevate it, and manage complex logistics with ease made every collaboration feel effortless. Bloom'n Events has played a huge part in delivering some of our building's most memorable moments. We couldn't recommend them more highly and look forward to continuing our partnership in 2026.",
  },
];

export default function TestimonialsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    // Respect prefers-reduced-motion: pause auto-advance if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsAutoPlaying(false);
      return;
    }

    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Auto-advance every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setActiveIndex(index);
    setIsAutoPlaying(false);
  };

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  return (
    <div className="carousel slide carousel-fade" id="testimonialCarousel">
      <div className="carousel-inner">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className={`carousel-item text-center ${
              index === activeIndex ? "active" : ""
            }`}
          >
            <div className="testimonial-item">
              <img
                src={testimonial.image}
                alt={testimonial.imageAlt}
                className="testimonial-img testimonial-img-rectangular mb-4"
                width="200"
                height="50"
                loading="lazy"
                decoding="async"
              />
              <h3 className="testimonial-name">{testimonial.name}</h3>
              <p className="testimonial-position mb-3">{testimonial.position}</p>
              <div className="testimonial-content p-4 rounded">
                <p className="mb-0">"{testimonial.quote}"</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={goPrev}
        className="carousel-control-prev"
        aria-label="Previous testimonial"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true" />
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        type="button"
        onClick={goNext}
        className="carousel-control-next"
        aria-label="Next testimonial"
      >
        <span className="carousel-control-next-icon" aria-hidden="true" />
        <span className="visually-hidden">Next</span>
      </button>
      <div className="carousel-indicators position-static mt-4">
        {testimonials.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => goToSlide(index)}
            className={index === activeIndex ? "active" : ""}
            aria-current={index === activeIndex ? "true" : undefined}
            aria-label={`Testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
