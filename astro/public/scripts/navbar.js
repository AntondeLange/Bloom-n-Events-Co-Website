(() => {
  const navbar = document.getElementById('main-navbar');
  if (!navbar) return;

  const isHome = document.body.classList.contains('home');

  const setNavHeight = () => {
    const h = navbar.offsetHeight || 72;
    document.documentElement.style.setProperty('--nav-height', `${h}px`);
  };

  const setBottom = () => {
    navbar.dataset.navPos = 'bottom';
    navbar.classList.remove('navbar-top');
    navbar.classList.add('navbar-bottom');
  };

  const setTop = () => {
    navbar.dataset.navPos = 'top';
    navbar.classList.remove('navbar-bottom');
    navbar.classList.add('navbar-top');
  };

  setNavHeight();
  window.addEventListener('resize', setNavHeight);

  if (!isHome) {
    setTop();
    return;
  }

  setBottom();

  const sentinel = document.querySelector('[data-hero-sentinel]');
  if (!sentinel) {
    setTop();
    return;
  }

  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) {
        setTop();
      }
    },
    { threshold: 0 }
  );

  io.observe(sentinel);

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
