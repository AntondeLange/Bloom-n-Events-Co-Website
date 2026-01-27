/**
 * Anchor Navigation: enforces fixed-on-scroll via IntersectionObserver (sentinel + placeholder).
 * Also strips any inline position overrides, ensures body can scroll, smooth scroll + active link.
 */
(function () {
  function stripInlinePosition(el) {
    if (!el) return;
    const pos = el.style.position;
    if (pos && (pos.includes('fixed') || pos.includes('absolute') || pos.includes('relative'))) {
      el.style.removeProperty('position');
      el.style.removeProperty('top');
      el.style.removeProperty('bottom');
      el.style.removeProperty('left');
      el.style.removeProperty('right');
      el.style.removeProperty('z-index');
      el.style.removeProperty('transform');
      el.style.removeProperty('translate');
    }
  }

  function ensureBodyScrollable() {
    const body = document.body;
    if (!body) return;
    const oy = getComputedStyle(body).overflowY;
    if (oy === 'hidden' || oy === 'clip') {
      body.style.setProperty('overflow-y', 'auto', 'important');
    }
  }

  function ensureWrapper(nav) {
    const existing = nav.closest('[data-anchor-nav-wrapper]');
    if (existing) {
      return {
        wrapper: existing,
        sentinel: existing.querySelector('[data-anchor-nav-sentinel]'),
        placeholder: existing.querySelector('[data-anchor-nav-placeholder]'),
        anchorNav: nav
      };
    }
    const wrapper = document.createElement('div');
    wrapper.className = 'anchor-nav-wrapper';
    wrapper.setAttribute('data-anchor-nav-wrapper', '');
    const sentinel = document.createElement('div');
    sentinel.className = 'anchor-nav-sentinel';
    sentinel.setAttribute('data-anchor-nav-sentinel', '');
    const placeholder = document.createElement('div');
    placeholder.className = 'anchor-nav-placeholder';
    placeholder.setAttribute('data-anchor-nav-placeholder', '');
    nav.parentNode.insertBefore(wrapper, nav);
    wrapper.appendChild(sentinel);
    wrapper.appendChild(placeholder);
    wrapper.appendChild(nav);
    return { wrapper, sentinel, placeholder, anchorNav: nav };
  }

  function initAnchorNav() {
    const navs = document.querySelectorAll('[data-anchor-nav]');
    if (!navs.length) return;

    ensureBodyScrollable();

    navs.forEach((nav) => {
      const { wrapper, sentinel, placeholder, anchorNav } = ensureWrapper(nav);
      if (!wrapper || !sentinel || !placeholder || !anchorNav) return;

      stripInlinePosition(anchorNav);

      const obs = new MutationObserver((muts) => {
        muts.forEach((m) => {
          if (m.type === 'attributes' && m.attributeName === 'style') {
            stripInlinePosition(anchorNav);
          }
        });
      });
      obs.observe(anchorNav, { attributes: true, attributeFilter: ['style'] });
      const interval = setInterval(() => stripInlinePosition(anchorNav), 800);
      window.addEventListener('beforeunload', () => {
        clearInterval(interval);
        obs.disconnect();
      });

      const setFixed = () => {
        placeholder.style.height = `${anchorNav.offsetHeight}px`;
        anchorNav.classList.add('anchor-nav-fixed');
      };
      const unsetFixed = () => {
        placeholder.style.height = '0px';
        anchorNav.classList.remove('anchor-nav-fixed');
      };

      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) {
            setFixed();
          } else {
            unsetFixed();
          }
        },
        { root: null, threshold: 0, rootMargin: '0px 0px 0px 0px' }
      );
      io.observe(sentinel);

      // Initial state if already past sentinel
      const rect = sentinel.getBoundingClientRect();
      if (rect.top < (window.innerHeight * 0.1)) setFixed();

      // Active link + smooth scroll
      const links = anchorNav.querySelectorAll('.anchor-nav-link');
      if (!links.length) return;

      const updateActive = () => {
        const sections = Array.from(links)
          .map((link) => {
            const href = link.getAttribute('href');
            if (!href || !href.startsWith('#')) return null;
            const target = document.querySelector(href);
            return target ? { link, target } : null;
          })
          .filter(Boolean);

        sections.forEach(({ link }) => link.classList.remove('active'));
        for (let i = sections.length - 1; i >= 0; i--) {
          const { link, target } = sections[i];
          const rect = target.getBoundingClientRect();
          if (rect.top <= anchorNav.offsetHeight + 12) {
            link.classList.add('active');
            break;
          }
        }
      };

      links.forEach((link) => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (!href || !href.startsWith('#')) return;
          const target = document.querySelector(href);
          if (!target) return;
          e.preventDefault();
          const navbar = document.getElementById('main-navbar');
          const offset = (navbar ? navbar.offsetHeight : 80) + anchorNav.offsetHeight + 8;
          const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        });
      });

      let ticking = false;
      window.addEventListener(
        'scroll',
        () => {
          if (!ticking) {
            window.requestAnimationFrame(() => {
              updateActive();
              ticking = false;
            });
            ticking = true;
          }
        },
        { passive: true }
      );

      updateActive();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnchorNav);
  } else {
    initAnchorNav();
  }
})();
/**
 * Anchor Navigation: smooth scroll and active link highlighting
 * Extracted from BaseLayout.astro for CSP compliance
 */
(function () {
  function stripInlinePosition(el) {
    if (!el) return;
    const pos = el.style.position;
    if (pos && (pos.includes('fixed') || pos.includes('absolute') || pos.includes('relative'))) {
      el.style.removeProperty('position');
      el.style.removeProperty('top');
      el.style.removeProperty('bottom');
      el.style.removeProperty('left');
      el.style.removeProperty('right');
      el.style.removeProperty('z-index');
      el.style.removeProperty('transform');
      el.style.removeProperty('translate');
    }
  }

  function ensureBodyScrollable() {
    const body = document.body;
    if (!body) return;
    const oy = getComputedStyle(body).overflowY;
    if (oy === 'hidden' || oy === 'clip') {
      body.style.setProperty('overflow-y', 'auto', 'important');
    }
  }

  function initAnchorNav() {
    const nav = document.querySelector('[data-anchor-nav]');
    if (!nav) return;

    ensureBodyScrollable();
    stripInlinePosition(nav);

    // Watch for inline style changes and strip them
    const obs = new MutationObserver((muts) => {
      muts.forEach((m) => {
        if (m.type === 'attributes' && m.attributeName === 'style') {
          stripInlinePosition(nav);
        }
      });
    });
    obs.observe(nav, { attributes: true, attributeFilter: ['style'] });

    // Periodic safety
    const interval = setInterval(() => stripInlinePosition(nav), 800);
    window.addEventListener('beforeunload', () => {
      clearInterval(interval);
      obs.disconnect();
    });

    // Active link + smooth scroll
    const links = nav.querySelectorAll('.anchor-nav-link');
    if (!links.length) return;

    const updateActive = () => {
      const sections = Array.from(links)
        .map((link) => {
          const href = link.getAttribute('href');
          if (!href || !href.startsWith('#')) return null;
          const target = document.querySelector(href);
          return target ? { link, target } : null;
        })
        .filter(Boolean);

      sections.forEach(({ link }) => link.classList.remove('active'));

      for (let i = sections.length - 1; i >= 0; i--) {
        const { link, target } = sections[i];
        const rect = target.getBoundingClientRect();
        if (rect.top <= (nav.offsetHeight + 12)) {
          link.classList.add('active');
          break;
        }
      }
    };

    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const navbar = document.getElementById('main-navbar');
        const offset = (navbar ? navbar.offsetHeight : 80) + nav.offsetHeight + 8;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      });
    });

    let ticking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            updateActive();
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );

    updateActive();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnchorNav);
  } else {
    initAnchorNav();
  }
})();
