(() => {
  const nav = document.querySelector('.anchor-nav');
  if (!nav) return;

  const navbar = document.getElementById('main-navbar');

  const setNavHeight = () => {
    const h = navbar ? navbar.offsetHeight : 72;
    document.documentElement.style.setProperty('--nav-height', `${h}px`);
  };

  setNavHeight();
  window.addEventListener('resize', setNavHeight);

  const links = nav.querySelectorAll('.anchor-nav-link');

  const getOffset = () => {
    const navH = nav.offsetHeight || 0;
    const barH = navbar ? navbar.offsetHeight : 72;
    return barH + navH + 8;
  };

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
      if (rect.top <= getOffset()) {
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
      const top = target.getBoundingClientRect().top + window.pageYOffset - getOffset();
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
})();
