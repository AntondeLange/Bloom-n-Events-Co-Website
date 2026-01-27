/**
 * Portfolio dropdown menu handler
 * Extracted from Header.astro for CSP compliance
 */
(function() {
  const trigger = document.getElementById('portfolio-dropdown-trigger');
  const menu = document.getElementById('portfolio-dropdown-menu');
  if (!trigger || !menu || !(trigger instanceof HTMLButtonElement)) return;

  const triggerBtn = trigger;
  const menuDiv = menu;

  let isOpen = false;

  function openDropdown() {
    menuDiv.classList.remove('hidden');
    menuDiv.classList.add('block');
    triggerBtn.setAttribute('aria-expanded', 'true');
    isOpen = true;
    // Focus first menu item
    const firstItem = menuDiv.querySelector('a[role="menuitem"]');
    if (firstItem && firstItem instanceof HTMLAnchorElement) {
      firstItem.focus();
    }
  }

  function closeDropdown() {
    menuDiv.classList.remove('block');
    menuDiv.classList.add('hidden');
    triggerBtn.setAttribute('aria-expanded', 'false');
    isOpen = false;
  }

  // Click handler
  triggerBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  // Keyboard handler
  triggerBtn.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isOpen) {
        closeDropdown();
      } else {
        openDropdown();
      }
    } else if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      closeDropdown();
      triggerBtn.focus();
    } else if (e.key === 'ArrowDown' && !isOpen) {
      e.preventDefault();
      openDropdown();
    }
  });

  // Close on Escape when menu is focused
  menuDiv.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeDropdown();
      triggerBtn.focus();
    }
  });

  // Close on outside click
  document.addEventListener('click', function(e) {
    const target = e.target;
    if (isOpen && target instanceof Node && !triggerBtn.contains(target) && !menuDiv.contains(target)) {
      closeDropdown();
    }
  });

  // Close on focus leaving menu
  const menuItems = menuDiv.querySelectorAll('a[role="menuitem"]');
  if (menuItems.length > 0) {
    const lastItem = menuItems[menuItems.length - 1];
    if (lastItem instanceof HTMLAnchorElement) {
      lastItem.addEventListener('keydown', function(e) {
        if (e.key === 'Tab' && !e.shiftKey) {
          closeDropdown();
        }
      });
    }
  }
})();
