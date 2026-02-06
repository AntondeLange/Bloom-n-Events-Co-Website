(() => {
  const excludeSelectors = [
    ".carousel",
    ".about-workshop-carousel",
    ".success-stories-carousel-wrapper",
    ".image-lightbox",
    ".site-loader",
    "nav",
    "footer",
  ];

  const isExcluded = (img) => excludeSelectors.some((selector) => img.closest(selector));

  const markEligibleImages = () => {
    const images = document.querySelectorAll("main img");
    images.forEach((img) => {
      if (!(img instanceof HTMLImageElement)) return;
      if (img.hasAttribute("data-lightbox-ignore")) return;
      if (isExcluded(img)) return;
      if (!img.currentSrc && !img.src) return;
      img.setAttribute("data-lightbox", "true");
    });
  };

  let previousOverflow = "";

  const removeExistingLightbox = () => {
    const existing = document.querySelector(".image-lightbox");
    if (existing) existing.remove();
    document.body.style.overflow = previousOverflow;
  };

  const openLightbox = (img) => {
    const src = img.currentSrc || img.src;
    if (!src) return;
    const alt = img.alt || "";
    removeExistingLightbox();

    const overlay = document.createElement("div");
    overlay.className = "image-lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");

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

    overlay.addEventListener("click", close);
    inner.addEventListener("click", (event) => event.stopPropagation());
    button.addEventListener("click", close);
    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape") close();
      },
      { once: true }
    );

    inner.append(button, image);
    overlay.append(inner);
    document.body.append(overlay);
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
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

  markEligibleImages();

  const observer = new MutationObserver(() => {
    markEligibleImages();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
