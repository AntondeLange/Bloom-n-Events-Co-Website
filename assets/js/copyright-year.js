/**
 * Copyright Year Update
 * Automatically updates copyright year in footer
 */

export function updateCopyrightYear() {
  document.addEventListener('DOMContentLoaded', function() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  });
  
  // Also update immediately if DOM is already loaded
  if (document.readyState !== 'loading') {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }
}

// Auto-initialize
updateCopyrightYear();
