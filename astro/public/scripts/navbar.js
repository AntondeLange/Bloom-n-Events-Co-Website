(() => {
  const navbar = document.getElementById('main-navbar');
  if (!navbar) return;

  const isHome = document.body.classList.contains('home');
  let lockedTop = false;
  let heroMode = false;

  const setNavHeight = () => {
    const h = navbar.offsetHeight || 72;
    document.documentElement.style.setProperty('--nav-height', `${h}px`);
    document.documentElement.style.setProperty('--navbar-total-height', `${h}px`);
  };

  const hero = document.querySelector('[data-hero]');
  const heroSentinel = document.querySelector('[data-hero-sentinel]');

  const setHeroPosition = () => {
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    const heroBottom = rect.top + scrollY + hero.offsetHeight;
    const navHeight = navbar.offsetHeight || 72;
    const top = Math.max(heroBottom - navHeight, 0);
    navbar.style.setProperty('top', `${top}px`);
  };

  const setHero = () => {
    if (lockedTop) return;
    heroMode = true;
    navbar.dataset.navPos = 'hero';
    navbar.classList.remove('navbar-top', 'navbar-bottom');
    navbar.classList.add('navbar-hero');
    navbar.style.setProperty('position', 'absolute');
    navbar.style.setProperty('bottom', 'auto');
    navbar.style.setProperty('z-index', '9999');
    setHeroPosition();
  };

  const setTop = () => {
    lockedTop = true;
    heroMode = false;
    navbar.dataset.navPos = 'top';
    navbar.classList.remove('navbar-bottom', 'navbar-hero');
    navbar.classList.add('navbar-top');
    navbar.style.setProperty('position', 'fixed');
    navbar.style.setProperty('top', 'env(safe-area-inset-top, 0)');
    navbar.style.setProperty('bottom', 'auto');
  };

  setNavHeight();
  window.addEventListener('resize', setNavHeight);
  window.addEventListener('resize', () => {
    if (heroMode) setHeroPosition();
  });
  window.addEventListener('scroll', () => {
    if (heroMode) setHeroPosition();
  });

  if (!isHome) {
    setTop();
    return;
  }

  // Force visible at hero bottom on load
  if (!hero || !heroSentinel) {
    setTop();
    return;
  }

  setHero();

  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        lockedTop = false;
        setHero();
        return;
      }
      setTop();
    },
    { threshold: 0 }
  );

  io.observe(heroSentinel);

  // simple portfolio dropdown aria-expanded toggle
  const portfolioTrigger = document.getElementById('portfolio-dropdown-trigger');
  const portfolioMenu = document.getElementById('portfolio-dropdown-menu');
  if (portfolioTrigger && portfolioMenu) {
    const close = () => {
      portfolioTrigger.setAttribute('aria-expanded', 'false');
      portfolioMenu.classList.add('hidden');
    };
    const open = () => {
      portfolioTrigger.setAttribute('aria-expanded', 'true');
      portfolioMenu.classList.remove('hidden');
    };
    portfolioTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = portfolioTrigger.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        close();
      } else {
        open();
      }
    });
    document.addEventListener('click', (e) => {
      if (!portfolioMenu.contains(e.target) && e.target !== portfolioTrigger) {
        close();
      }
    });
  }
})();
