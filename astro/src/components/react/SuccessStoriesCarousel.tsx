/**
 * Success Stories carousel: matches original index.html behavior.
 * Desktop: transform-based centering, one active card (scale 1), inactive (scale 0.95, opacity 0.5).
 * Mobile: scroll-snap, full-width cards, scrollIntoView.
 * Infinite loop; arrows overlay left/right.
 */
import { useEffect, useRef, useState, useCallback } from "react";
import OptimizedImage from "./OptimizedImage";
import ImageLightbox from "./ImageLightbox";


interface CaseStudy {
  image: string;
  imageAlt: string;
  title: string;
  description: string;
  link: string;
  metadata: { client: string; location: string; type: string };
}

const caseStudies: CaseStudy[] = [
  {
    image: "/assets/images/Centuria Connect140/Connect140 (10).JPG",
    imageAlt: "Centuria Connect140 Networking Event",
    title: "A Networking Event Built for Meaningful Connection",
    description:
      "How we crafted an atmosphere for Centuria Capital where Perth business leaders could meet with ease, purpose, and genuine connection.",
    link: "/case-study-centuria-connect140",
    metadata: { client: "Centuria Capital", location: "Perth CBD", type: "Corporate Networking" },
  },
  {
    image: "/assets/images/Home/Food Festival Celebrates Tenant Opening & Drives Engagement CASE STUDY IMAGE.jpg",
    imageAlt: "Hawaiian Forrestfield Food Festival",
    title: "A Food Festival That Welcomed a Tenant and the Community",
    description:
      "A one-day event for Hawaiian Shopping Centres that celebrated a key tenant opening while inviting the community to gather, taste, and stay longer.",
    link: "/case-study-hawaiian-forrestfield",
    metadata: { client: "Hawaiian Shopping Centres", location: "Forrestfield", type: "Food Festival" },
  },
  {
    image: "/assets/images/Home/School Holiday Activity Drives Traffic Across 5 Centres in 5 Days CASE STUDY IMAGE.jpg",
    imageAlt: "Hawaiian Neighbourhood Nibbles School Holiday Programme",
    title: "School Holiday Programme That Brought Families Across Five Centres",
    description:
      "A food-based July school holiday activation that invited families to create, connect, and linger across multiple Hawaiian shopping centres.",
    link: "/case-study-hawaiian-neighbourhood-nibbles",
    metadata: { client: "Hawaiian Shopping Centres", location: "Multiple Locations", type: "School Holiday Programme" },
  },
  {
    image: "/assets/images/Centuria 50th Birthday/efea378d-9bd1-4906-9237-db1ed574869c.jpg",
    imageAlt: "140 St Georges Terrace 50th Birthday Celebration",
    title: "A Landmark Anniversary That Honoured Legacy and Looked Forward",
    description:
      "A bespoke 50th birthday celebration for 140 St Georges Terrace that respected the past while presenting a contemporary, future-ready vision.",
    link: "/case-study-centuria-50th-birthday",
    metadata: { client: "Centuria Capital", location: "140 St Georges Terrace", type: "50th Anniversary" },
  },
  {
    image: "/assets/images/Centuria Breast Cancer/Centuria Breast Cancer Oct25.1.jpg",
    imageAlt: "Breast Cancer Awareness Day & Spring Activation",
    title: "A Purpose-Led Installation Rooted in Care",
    description:
      "A two-phase installation that honoured Breast Cancer Awareness Day, then gently transitioned into a vibrant Spring activation at 140 St Georges Terrace.",
    link: "/case-study-centuria-breast-cancer",
    metadata: { client: "Centuria Capital", location: "140 St Georges Terrace", type: "Purpose-Led Installation" },
  },
];

const MOBILE_BREAKPOINT = 768;
const DESKTOP_GAP = 30;

export default function SuccessStoriesCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const isInitialMount = useRef(true);
  const userHasInteracted = useRef(false);

  const totalCards = caseStudies.length;

  const moveToIndex = useCallback(
    (index: number) => {
      const n = ((index % totalCards) + totalCards) % totalCards;
      setCurrentIndex(n);
    },
    [totalCards]
  );

  const updateTransform = useCallback(() => {
    const track = trackRef.current;
    const container = containerRef.current;
    const cards = track?.querySelectorAll<HTMLElement>(".success-stories-carousel-card");
    if (!track || !container || !cards?.length) return;

    const mobile = window.innerWidth <= MOBILE_BREAKPOINT;

    if (mobile) {
      track.style.transform = "none";
      const activeCard = cards[currentIndex];
      // Only scroll on user interaction, not on initial mount
      // Prevent auto-scroll to success stories section on page load
      if (!isInitialMount.current && userHasInteracted.current && activeCard) {
        activeCard.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
      }
    } else {
      const containerWidth = container.offsetWidth;
      const cardWidth = cards[0].offsetWidth;
      const offset = containerWidth / 2 - cardWidth / 2 - currentIndex * (cardWidth + DESKTOP_GAP);
      track.style.transform = `translateX(${offset}px)`;
    }
  }, [currentIndex]);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const handle = () => {
      const mobile = mql.matches;
      setIsMobile(mobile);
      if (mobile && currentIndex !== 0) {
        setCurrentIndex(0);
      } else if (!mobile && currentIndex === 0) {
        setCurrentIndex(3);
      }
    };
    mql.addEventListener("change", handle);
    handle();
    return () => mql.removeEventListener("change", handle);
  }, []);

  useEffect(() => {
    updateTransform();
    const t = setTimeout(() => {
      updateTransform();
      // Mark initial mount as complete after first render
      isInitialMount.current = false;
    }, 150);
    return () => clearTimeout(t);
  }, [currentIndex, isMobile, updateTransform]);

  // Track user scroll interaction to allow carousel scrolling after user has scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50 || window.pageYOffset > 50) {
        userHasInteracted.current = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll<HTMLElement>(".success-stories-carousel-card");
    cards.forEach((card, i) => {
      card.classList.toggle("active", i === currentIndex);
    });
  }, [currentIndex]);

  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateTransform);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [updateTransform]);

  const handlePrev = () => {
    userHasInteracted.current = true;
    moveToIndex(currentIndex - 1);
  };
  const handleNext = () => {
    userHasInteracted.current = true;
    moveToIndex(currentIndex + 1);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const activeLightbox = lightboxIndex !== null ? caseStudies[lightboxIndex] : null;

  return (
    <div className="success-stories-carousel-wrapper">
      <button
        type="button"
        className="success-stories-carousel-arrow success-stories-carousel-prev"
        aria-label="Previous success story"
        onClick={handlePrev}
      >
        <i className="bi bi-chevron-left" aria-hidden="true" />
      </button>
      <div ref={containerRef} className="success-stories-carousel-container">
        <div
          ref={trackRef}
          id="successStoriesCarouselTrack"
          className="success-stories-carousel-track"
        >
          {caseStudies.map((study, index) => (
            <div
              key={index}
              className="success-stories-carousel-card"
              data-index={index}
            >
              <div className="card h-100 shadow">
                <OptimizedImage
                  src={study.image}
                  alt={study.imageAlt}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="card-img-top success-stories-carousel-image"
                  loading={index === 0 ? "eager" : "lazy"}
                  width={1600}
                  height={900}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open full-size image: ${study.title}`}
                  onClick={() => openLightbox(index)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openLightbox(index);
                    }
                  }}
                />
                <div className="portfolio-card-metadata">
                  <div className="portfolio-card-metadata-item">
                    <i className="bi bi-building" aria-hidden="true" />
                    <span>{study.metadata.client}</span>
                  </div>
                  <div className="portfolio-card-metadata-item">
                    <i className="bi bi-geo-alt" aria-hidden="true" />
                    <span>{study.metadata.location}</span>
                  </div>
                  <div className="portfolio-card-metadata-item">
                    <i className="bi bi-calendar-event" aria-hidden="true" />
                    <span>{study.metadata.type}</span>
                  </div>
                </div>
                <div className="card-body text-center">
                  <h3 className="card-title text-gold mb-3">{study.title}</h3>
                  <p className="card-text text-charcoal">{study.description}</p>
                  <a href={study.link} className="btn btn-gold btn-sm">
                    Read the Story
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="success-stories-carousel-arrow success-stories-carousel-next"
        aria-label="Next success story"
        onClick={handleNext}
      >
        <i className="bi bi-chevron-right" aria-hidden="true" />
      </button>
      {activeLightbox && (
        <ImageLightbox
          src={activeLightbox.image}
          alt={activeLightbox.imageAlt}
          onClose={closeLightbox}
        />
      )}
    </div>
  );
}
