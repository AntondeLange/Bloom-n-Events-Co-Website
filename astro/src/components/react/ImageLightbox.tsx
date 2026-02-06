import { useEffect } from "react";

interface Props {
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ImageLightbox({ src, alt, onClose }: Props) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  if (!src) return null;

  return (
    <div className="image-lightbox" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="image-lightbox-inner" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className="image-lightbox-close"
          aria-label="Close full-size image"
          onClick={onClose}
        >
          &times;
        </button>
        <img
          src={encodeURI(src)}
          alt={alt}
          className="image-lightbox-img"
          loading="eager"
          decoding="async"
        />
      </div>
    </div>
  );
}
