import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import OptimizedImage from "./OptimizedImage";

export interface TeamCarouselMember {
  name: string;
  role: string;
  src: string;
  alt: string;
  blurb?: string;
}

interface Props {
  members: TeamCarouselMember[];
}

const getSlidePosition = (index: number, activeIndex: number, length: number) => {
  const distance = (index - activeIndex + length) % length;
  if (distance === 0) return "is-active";
  if (distance === 1) return "is-next-1";
  if (distance === 2) return "is-next-2";
  if (distance === 3) return "is-next-3";
  return "is-hidden";
};

export default function TeamCarousel({ members }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const modalPanelRef = useRef<HTMLDivElement | null>(null);
  const modalCloseRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const total = members.length;
  const activeMember = useMemo(() => members[activeIndex], [members, activeIndex]);

  // Auto-advance intentionally disabled for this carousel.

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedIndex(null);
        return;
      }

      if (event.key !== "Tab") return;
      const modal = modalPanelRef.current;
      if (!modal) return;

      const focusable = Array.from(
        modal.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("hidden"));

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (!active || active === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKey);
    requestAnimationFrame(() => {
      modalCloseRef.current?.focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
      lastFocusedRef.current?.focus();
    };
  }, [selectedIndex]);

  if (!members.length) return null;

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const openProfile = (index: number) => {
    setSelectedIndex(index);
  };

  const closeProfile = () => setSelectedIndex(null);

  return (
    <div className="team-carousel" aria-live="polite">
      <div className="team-carousel-stage" role="region" aria-label="Team member carousel">
        {members.map((member, index) => {
          const positionClass = getSlidePosition(index, activeIndex, total);
          return (
            <button
              key={member.name}
              type="button"
              className={`team-carousel-slide ${positionClass}`}
              onClick={() => openProfile(index)}
              aria-label={`Open profile for ${member.name}`}
            >
              <OptimizedImage
                src={member.src}
                alt={member.alt}
                className="team-carousel-image"
                sizes="(max-width: 768px) 85vw, 520px"
                loading="lazy"
                decoding="async"
                width={900}
                height={1100}
                data-lightbox-ignore
              />
            </button>
          );
        })}
      </div>

      <div className="team-carousel-meta">
        <h3 className="team-carousel-name">{activeMember.name}</h3>
        <p className="team-carousel-role">{activeMember.role}</p>
      </div>

      <div className="team-carousel-controls">
        <button type="button" className="team-carousel-arrow" onClick={goPrev} aria-label="Previous team member">
          <i className="bi bi-arrow-left" aria-hidden="true" />
        </button>
        <button type="button" className="team-carousel-arrow" onClick={goNext} aria-label="Next team member">
          <i className="bi bi-arrow-right" aria-hidden="true" />
        </button>
        <div className="team-carousel-count">
          {activeIndex + 1}
          <span aria-hidden="true">/</span>
          {total}
        </div>
      </div>

      {selectedIndex !== null &&
        members[selectedIndex] &&
        mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="team-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-modal-title"
            aria-describedby={members[selectedIndex].blurb ? "team-modal-blurb" : undefined}
          >
            <div className="team-modal-backdrop" onClick={closeProfile} />
            <div ref={modalPanelRef} className="team-modal-panel">
              <button
                ref={modalCloseRef}
                type="button"
                className="team-modal-close"
                onClick={closeProfile}
                aria-label="Close profile"
              >
                &times;
              </button>
              <div className="team-modal-image">
                <OptimizedImage
                  src={members[selectedIndex].src}
                  alt={members[selectedIndex].alt}
                  className="team-modal-img"
                  sizes="(max-width: 768px) 90vw, 520px"
                  loading="eager"
                  decoding="async"
                  width={900}
                  height={1100}
                />
              </div>
              <div className="team-modal-content">
                <h3 id="team-modal-title" className="team-modal-name">{members[selectedIndex].name}</h3>
                <p className="team-modal-role">{members[selectedIndex].role}</p>
                {members[selectedIndex].blurb && (
                  <p id="team-modal-blurb" className="team-modal-blurb">{members[selectedIndex].blurb}</p>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
