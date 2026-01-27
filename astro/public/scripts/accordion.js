/**
 * Accordion initialization - works without Bootstrap CSS
 * Extracted from BaseLayout.astro for CSP compliance
 */
(function() {
  function initAccordion() {
    const accordionButtons = document.querySelectorAll('.accordion-button[data-bs-toggle="collapse"]');
    
    if (accordionButtons.length === 0) {
      // Retry after a short delay if elements aren't ready
      setTimeout(initAccordion, 100);
      return;
    }
    
    accordionButtons.forEach((button) => {
      // Remove any existing listeners by cloning
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      
      newButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const targetId = this.getAttribute('data-bs-target');
        if (!targetId) return;
        
        const target = document.querySelector(targetId);
        if (!target) return;
        
        const parentId = target.getAttribute('data-bs-parent');
        const parent = parentId ? document.querySelector(parentId) : null;
        
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        const isCollapsed = target.classList.contains('collapse') && !target.classList.contains('show');
        
        if (parent) {
          // Close all other accordions in the parent BEFORE opening this one
          const otherCollapses = parent.querySelectorAll('.accordion-collapse.show');
          const otherButtons = parent.querySelectorAll('.accordion-button[aria-expanded="true"]');
          
          otherCollapses.forEach((collapse) => {
            if (collapse !== target && collapse.classList.contains('show')) {
              collapse.style.height = collapse.scrollHeight + 'px';
              requestAnimationFrame(() => {
                collapse.style.height = '0';
                setTimeout(() => {
                  collapse.classList.add('collapse');
                  collapse.classList.remove('show');
                  collapse.style.display = 'none';
                  collapse.style.height = '';
                }, 350);
              });
            }
          });
          
          otherButtons.forEach((btn) => {
            if (btn !== this && btn.getAttribute('aria-expanded') === 'true') {
              btn.classList.add('collapsed');
              btn.setAttribute('aria-expanded', 'false');
            }
          });
        }
        
        if (isCollapsed || !isExpanded) {
          target.classList.remove('collapse');
          target.classList.add('show');
          this.classList.remove('collapsed');
          this.setAttribute('aria-expanded', 'true');
          
          target.style.display = 'block';
          target.style.height = '0';
          requestAnimationFrame(() => {
            target.style.height = target.scrollHeight + 'px';
            setTimeout(() => {
              target.style.height = 'auto';
            }, 350);
          });
        } else {
          target.style.height = target.scrollHeight + 'px';
          requestAnimationFrame(() => {
            target.style.height = '0';
            setTimeout(() => {
              target.classList.add('collapse');
              target.classList.remove('show');
              target.style.display = 'none';
              target.style.height = '';
            }, 350);
          });
          this.classList.add('collapsed');
          this.setAttribute('aria-expanded', 'false');
        }
      });
    });
    
    const defaultOpen = document.querySelectorAll('.accordion-collapse.collapse.show');
    defaultOpen.forEach((collapse) => {
      collapse.classList.remove('collapse');
      collapse.style.display = 'block';
      collapse.style.height = 'auto';
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAccordion);
  } else {
    initAccordion();
  }
})();
