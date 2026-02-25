(() => {
  const excludeSelectors = [
    ".carousel",
    ".about-workshop-carousel",
    ".success-stories-carousel-wrapper",
    ".team-carousel",
    ".image-lightbox",
    ".site-loader",
    "nav",
    "footer",
  ];

  const isExcluded = (img) => excludeSelectors.some((selector) => img.closest(selector));
  const isInteractiveImage = (img) => Boolean(img.closest("a, button"));

  let previousOverflow = "";
  let activeTrigger = null;
  let detachKeyHandler = null;

  const removeExistingLightbox = ({ restoreFocus = true } = {}) => {
    const existing = document.querySelector(".image-lightbox");
    if (existing) existing.remove();
    document.body.style.overflow = previousOverflow;
    if (detachKeyHandler) {
      detachKeyHandler();
      detachKeyHandler = null;
    }
    if (restoreFocus && activeTrigger instanceof HTMLElement) {
      activeTrigger.focus();
    }
    activeTrigger = null;
  };

  const markEligibleImages = () => {
    const images = document.querySelectorAll("main img");
    images.forEach((img) => {
      if (!(img instanceof HTMLImageElement)) return;
      if (img.hasAttribute("data-lightbox-ignore")) return;
      if (isExcluded(img)) return;
      if (isInteractiveImage(img)) return;
      if (!img.currentSrc && !img.src) return;
      if (!img.alt || !img.alt.trim()) return;
      img.setAttribute("data-lightbox", "true");
      if (!img.hasAttribute("role")) img.setAttribute("role", "button");
      if (!img.hasAttribute("tabindex")) img.tabIndex = 0;
      if (!img.hasAttribute("aria-label")) {
        img.setAttribute(
          "aria-label",
          img.alt ? `Open full-size image: ${img.alt}` : "Open full-size image"
        );
      }
    });
  };

  const openLightbox = (img) => {
    const src = img.currentSrc || img.src;
    if (!src) return;
    const alt = img.alt || "";
    activeTrigger = img;
    removeExistingLightbox({ restoreFocus: false });

    const overlay = document.createElement("div");
    overlay.className = "image-lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Full-size image preview");

    const inner = document.createElement("div");
    inner.className = "image-lightbox-inner";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "image-lightbox-close";
    button.setAttribute("aria-label", "Close full-size image");
    button.innerHTML = "&times;";

    const image = document.createElement("img");
    image.className = "image-lightbox-img";
    image.src = src;
    image.alt = alt;
    image.loading = "eager";
    image.decoding = "async";

    const close = () => removeExistingLightbox();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === "Tab") {
        event.preventDefault();
        button.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    detachKeyHandler = () => document.removeEventListener("keydown", handleKeyDown);

    overlay.addEventListener("click", close);
    inner.addEventListener("click", (event) => event.stopPropagation());
    button.addEventListener("click", close);

    inner.append(button, image);
    overlay.append(inner);
    document.body.append(overlay);
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => button.focus());
  };

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof HTMLImageElement)) return;
      if (!target.hasAttribute("data-lightbox")) return;
      if (target.closest(".image-lightbox")) return;
      event.preventDefault();
      openLightbox(target);
    },
    { passive: false }
  );

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) return;
    if (!target.hasAttribute("data-lightbox")) return;
    if (target.closest(".image-lightbox")) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openLightbox(target);
  });

  markEligibleImages();

  const main = document.querySelector("main");
  if (!main) return;

  let markQueued = false;
  const queueMarkEligibleImages = () => {
    if (markQueued) return;
    markQueued = true;

    const run = () => {
      markQueued = false;
      markEligibleImages();
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(run, { timeout: 250 });
    } else {
      setTimeout(run, 50);
    }
  };

  const observer = new MutationObserver(queueMarkEligibleImages);
  observer.observe(main, { childList: true, subtree: true });
})();
