import { useEffect, useRef } from "react";
import { buildSrcSet, encodeSrc, withWidthSuffix, DEFAULT_WIDTH } from "../../lib/image-utils";

interface Props {
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ImageLightbox({ src, alt, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
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
    window.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => {
      closeRef.current?.focus();
    });
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      lastFocusedRef.current?.focus();
    };
  }, [onClose]);

  if (!src) return null;

  const fallbackSrc = encodeSrc(withWidthSuffix(src, DEFAULT_WIDTH));
  const fallbackSrcSet = buildSrcSet(src);
  const avifSrcSet = buildSrcSet(src, "avif");
  const webpSrcSet = buildSrcSet(src, "webp");

  return (
    <div
      ref={dialogRef}
      className="image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Full-size image preview"
      onClick={onClose}
    >
      <div className="image-lightbox-inner" onClick={(event) => event.stopPropagation()}>
        <button
          ref={closeRef}
          type="button"
          className="image-lightbox-close"
          aria-label="Close full-size image"
          onClick={onClose}
        >
          &times;
        </button>
        <picture>
          <source type="image/avif" srcSet={avifSrcSet} sizes="100vw" />
          <source type="image/webp" srcSet={webpSrcSet} sizes="100vw" />
          <img
            src={fallbackSrc}
            srcSet={fallbackSrcSet}
            sizes="100vw"
            alt={alt}
            className="image-lightbox-img"
            loading="eager"
            decoding="async"
          />
        </picture>
      </div>
    </div>
  );
}
