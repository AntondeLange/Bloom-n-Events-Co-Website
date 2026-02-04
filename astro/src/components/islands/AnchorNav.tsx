import { useEffect, useRef, useState, type MouseEvent } from "react";

type LinkItem = { href: string; label: string };

type Props = {
  links: LinkItem[];
};

export default function AnchorNav({ links }: Props) {
  const navRef = useRef<HTMLElement>(null);
  const [activeHref, setActiveHref] = useState<string | null>(null);
  const sectionsRef = useRef<Array<{ href: string; target: HTMLElement }>>([]);
  const rafRef = useRef<number | null>(null);

  const computeStackOffset = () => {
    const navHeight = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--navbar-total-height")
    ) || 74;
    const anchorHeight = navRef.current?.offsetHeight || 56;
    return {
      navHeight,
      anchorHeight,
      stickyHeight: navHeight + anchorHeight + 12,
    };
  };

  const syncStructuralStyles = () => {
    const { navHeight, anchorHeight, stickyHeight } = computeStackOffset();
    document.documentElement.style.setProperty("--anchor-h", `${anchorHeight}px`);
    document.documentElement.style.setProperty("--anchor-nav-offset", `${navHeight + anchorHeight}px`);
    document.documentElement.style.setProperty("--sticky-stack-height", `${stickyHeight}px`);
    document.documentElement.style.setProperty(
      "--sticky-anchor-top",
      `calc(env(safe-area-inset-top, 0) + ${navHeight}px)`
    );
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    syncStructuralStyles();
    window.addEventListener("resize", syncStructuralStyles);
    return () => {
      window.removeEventListener("resize", syncStructuralStyles);
    };
  }, [links.length]);

  useEffect(() => {
    if (!navRef.current) return;
    const nodeList = Array.from(navRef.current.querySelectorAll<HTMLAnchorElement>(".anchor-nav-link"));
    const sections = nodeList
      .map((link) => {
        const href = link.getAttribute("href");
        if (!href || !href.startsWith("#")) return null;
        const target = document.querySelector<HTMLElement>(href);
        if (!target) return null;
        return { href, target };
      })
      .filter((item): item is { href: string; target: HTMLElement } => Boolean(item));
    sectionsRef.current = sections;

    const updateActive = () => {
      const offset = computeStackOffset().stickyHeight;
      let current: string | null = null;
      for (let i = sections.length - 1; i >= 0; i--) {
        const { href, target } = sections[i];
        const rect = target.getBoundingClientRect();
        if (rect.top <= offset) {
          current = href;
          break;
        }
      }
      setActiveHref(current);
    };

    const handleScroll = () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = window.requestAnimationFrame(() => {
        updateActive();
        rafRef.current = null;
      });
    };
    updateActive();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [links]);

  const handleClick = (href: string, event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const target = document.querySelector<HTMLElement>(href);
    if (!target) return;
    const offset = computeStackOffset().stickyHeight;
    const targetTop = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
  };

  return (
    <nav className="anchor-nav" data-anchor-nav ref={navRef} aria-label="Page sections">
      <div className="anchor-nav-inner mx-auto max-w-7xl px-4 md:px-6">
        <ul className="anchor-nav-list">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`anchor-nav-link${activeHref === link.href ? " active" : ""}`}
                onClick={(event) => handleClick(link.href, event)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
