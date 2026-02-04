import { useEffect, useRef, useState } from "react";
import Image from "../react/Image";
import { SITE } from "../../lib/constants";

type Props = {
  currentPath: string;
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/team", label: "Our Team" },
];

const portfolioLinks = [
  { href: "/events", label: "Events" },
  { href: "/workshops", label: "Workshops" },
  { href: "/displays", label: "Displays" },
];

const capabilitiesLink = { href: "/capabilities", label: "Our Capabilities" };

const isActive = (href: string, currentPath: string) => {
  if (href === "/") return currentPath === "/" || currentPath === "";
  return currentPath.startsWith(href);
};

export default function Navbar({ currentPath }: Props) {
  const navRef = useRef<HTMLElement>(null);
  const portfolioTriggerRef = useRef<HTMLButtonElement>(null);
  const portfolioMenuRef = useRef<HTMLDivElement>(null);
  const isHome = currentPath === "/" || currentPath === "/index.html";
  const [navPosition, setNavPosition] = useState<"top" | "bottom">(isHome ? "bottom" : "top");
  const [portfolioOpen, setPortfolioOpen] = useState(false);

  const visibleNavLinks = navLinks.filter(({ href }) => !isActive(href, currentPath));
  const visiblePortfolioLinks = portfolioLinks.filter(({ href }) => !isActive(href, currentPath));
  const showCapabilities = !isActive(capabilitiesLink.href, currentPath);
  const showGallery = !isActive("/gallery", currentPath);

  useEffect(() => {
    const navElement = navRef.current;
    if (!navElement) return;
    const updateHeight = () => {
      const height = navElement.offsetHeight || 72;
      document.documentElement.style.setProperty("--nav-h", `${height}px`);
      document.documentElement.style.setProperty("--navbar-total-height", `${height}px`);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  useEffect(() => {
    setNavPosition(isHome ? "bottom" : "top");
    if (!isHome) return;

    const sentinel = document.querySelector("[data-hero-sentinel]");
    if (!sentinel) {
      setNavPosition("top");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setNavPosition(entry.isIntersecting ? "bottom" : "top");
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isHome]);

  // Removed imperative style manipulation in favor of declarative classes


  useEffect(() => {
    if (!portfolioOpen) return;
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        portfolioMenuRef.current &&
        portfolioTriggerRef.current &&
        !portfolioMenuRef.current.contains(target) &&
        !portfolioTriggerRef.current.contains(target)
      ) {
        setPortfolioOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPortfolioOpen(false);
      }
    };

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [portfolioOpen]);

  // Simplify positioning logic: always fixed, just toggle top/bottom classes
  const navPositionClass = isHome && navPosition === "bottom"
    ? "fixed bottom-[env(safe-area-inset-bottom,0px)] top-auto left-0 right-0 z-40"
    : "fixed top-[env(safe-area-inset-top,0px)] bottom-auto left-0 right-0 z-50 lg:z-[1030]";

  const navClassName = [
    "navbar w-full bg-charcoal inset-x-0 transition-[background-color,box-shadow,transform] duration-300 border-gold",
    navPositionClass,
    isHome ? "navbar-home" : "navbar-top",
  ].join(" ");


  return (
    <nav
      id="main-navbar"
      ref={navRef}
      className={navClassName}
      // style={navInlineStyle} // Removed, using tailored classes instead
      role="navigation"
      aria-label="Primary"
      data-nav-pos={navPosition}
      data-page={isHome ? "home" : "inner"}
    >
      <div className="relative mx-auto flex min-h-[var(--nav-height,72px)] max-w-7xl flex-wrap items-center justify-between gap-4 px-4 md:px-6 navbar-inner">
        <details className="group/menu relative order-1 flex self-center lg:hidden">
          <summary
            className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded bg-gold text-charcoal transition hover:bg-charcoal hover:text-gold active:bg-charcoal active:text-gold [&::-webkit-details-marker]:hidden"
            aria-label="Toggle menu"
            aria-expanded={false}
          >
            <svg
              className="h-6 w-6 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1e1e1e"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </summary>
          <div className="mobile-menu-panel absolute left-0 z-50 min-w-[200px] rounded-md border border-charcoal/20 bg-charcoal py-2 shadow-lg">
            {visibleNavLinks.map(({ href, label }) => (
              <a
                key={`mobile-${href}`}
                href={href}
                className="block px-4 py-2 text-sm text-gold no-underline hover:bg-white/10 hover:text-gold"
              >
                {label}
              </a>
            ))}
            {(visiblePortfolioLinks.length > 0 || showCapabilities) && (
              <>
                <p className="px-4 py-1 text-xs font-semibold uppercase tracking-wider text-gold">
                  Portfolio
                </p>
                {visiblePortfolioLinks.map(({ href, label }) => (
                  <a
                    key={`mobile-portfolio-${href}`}
                    href={href}
                    className="block pr-4 py-2 pl-[30px] text-sm text-gold no-underline hover:bg-white/10 hover:text-gold"
                  >
                    {label}
                  </a>
                ))}
                {showCapabilities && (
                  <>
                    <hr className="my-1 mx-4 border-t border-gold" />
                    <a
                      href={capabilitiesLink.href}
                      className="block pr-4 py-2 pl-[30px] text-sm text-gold no-underline hover:bg-white/10 hover:text-gold"
                    >
                      {capabilitiesLink.label}
                    </a>
                  </>
                )}
              </>
            )}
            {showGallery && (
              <a
                href="/gallery"
                className="block px-4 py-2 text-sm text-gold no-underline hover:bg-white/10 hover:text-gold"
              >
                Gallery
              </a>
            )}
          </div>
        </details>

        <div className="order-2 hidden flex-1 basis-0 flex-wrap items-center gap-1 lg:order-1 lg:flex lg:basis-auto lg:flex-1">
          <ul className="flex flex-wrap items-center gap-1">
            {visibleNavLinks.map(({ href, label }) => (
              <li key={`nav-link-${href}`}>
                <a
                  href={href}
                  className="rounded px-3 py-2 text-sm text-gold no-underline transition hover:bg-white/10 hover:text-gold"
                >
                  {label}
                </a>
              </li>
            ))}
            <li className="relative group">
              <button
                type="button"
                id="portfolio-dropdown-trigger"
                ref={portfolioTriggerRef}
                className={[
                  "inline-flex items-center rounded px-3 py-2 text-sm text-gold no-underline transition hover:bg-white/10 hover:text-gold focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-charcoal",
                  (portfolioLinks.some((link) => isActive(link.href, currentPath)) || isActive(capabilitiesLink.href, currentPath)) &&
                  "font-semibold",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-expanded={portfolioOpen}
                aria-haspopup="true"
                aria-controls="portfolio-dropdown-menu"
                onClick={() => setPortfolioOpen((prev) => !prev)}
              >
                Portfolio
                <i className="portfolio-chevron bi bi-chevron-down ml-0.5 text-xs transition-transform duration-300" aria-hidden="true" />
              </button>
              <div
                id="portfolio-dropdown-menu"
                ref={portfolioMenuRef}
                className={`portfolio-dropdown absolute left-0 z-50 min-w-[180px] rounded-md border-2 border-gold bg-charcoal py-1 shadow-lg ${portfolioOpen ? "" : "hidden"}`}
                role="menu"
                aria-labelledby="portfolio-dropdown-trigger"
                data-dropdown-position={navPosition}
              >
                {visiblePortfolioLinks.map(({ href, label }) => (
                  <a
                    key={`portfolio-${href}`}
                    href={href}
                    className="block pr-4 py-2 pl-[30px] text-sm text-gold no-underline hover:bg-white/10 hover:text-gold focus:bg-white/10 focus:outline-none"
                    role="menuitem"
                  >
                    {label}
                  </a>
                ))}
                {showCapabilities && (
                  <>
                    <hr className="my-1 mx-4 border-t border-gold" />
                    <a
                      href={capabilitiesLink.href}
                      className="block pr-4 py-2 pl-[30px] text-sm text-gold no-underline hover:bg-white/10 hover:text-gold focus:bg-white/10 focus:outline-none"
                      role="menuitem"
                    >
                      {capabilitiesLink.label}
                    </a>
                  </>
                )}
              </div>
            </li>
            {showGallery && (
              <li>
                <a
                  href="/gallery"
                  className="rounded px-3 py-2 text-sm text-gold no-underline transition hover:bg-white/10 hover:text-gold"
                >
                  Gallery
                </a>
              </li>
            )}
          </ul>
        </div>

        <a
          href="/"
          className="order-2 flex shrink-0 items-center justify-center flex-1 self-center lg:order-2 lg:flex-none"
          aria-label={`${SITE.name} home`}
        >
          <Image
            src="/assets/images/logo-blk-long.png"
            alt={SITE.name}
            className="h-12 w-auto max-w-[200px] object-contain md:h-14"
            width="200"
            height="60"
            loading="eager"
            fetchPriority="high"
          />
        </a>

        <div className="navbar-contact order-3 flex shrink-0 items-center self-center">
          <a
            href="/contact"
            className="rounded bg-gold px-4 py-2 text-sm font-semibold text-charcoal no-underline transition hover:bg-charcoal hover:text-gold active:bg-charcoal active:text-gold"
          >
            Contact Us
          </a>
        </div>
      </div>
    </nav>
  );
}
