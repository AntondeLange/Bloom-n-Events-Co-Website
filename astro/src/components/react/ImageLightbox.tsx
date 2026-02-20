import { useEffect } from "react";
import { buildSrcSet, encodeSrc, withWidthSuffix, DEFAULT_WIDTH } from "../../lib/image-utils";

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

  const fallbackSrc = encodeSrc(withWidthSuffix(src, DEFAULT_WIDTH));
  const fallbackSrcSet = buildSrcSet(src);
  const avifSrcSet = buildSrcSet(src, "avif");
  const webpSrcSet = buildSrcSet(src, "webp");

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
