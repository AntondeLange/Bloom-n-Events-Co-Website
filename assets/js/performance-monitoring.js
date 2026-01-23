/**
 * Performance Monitoring
 * Tracks Web Vitals and performance metrics
 */

export function initPerformanceMonitoring() {
  // Defer performance monitoring until after page load
  if ('requestIdleCallback' in window) {
    requestIdleCallback(function() {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              if (typeof gtag === 'function') {
                gtag('event', 'lcp', {
                  event_category: 'Web Vitals',
                  value: Math.round(entry.startTime),
                  non_interaction: true
                });
              }
            }
          }
        });
        observer.observe({type: 'largest-contentful-paint', buffered: true});
      }
    });
  } else {
    window.addEventListener('load', function() {
      setTimeout(function() {
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === 'largest-contentful-paint') {
                if (typeof gtag === 'function') {
                  gtag('event', 'lcp', {
                    event_category: 'Web Vitals',
                    value: Math.round(entry.startTime),
                    non_interaction: true
                  });
                }
              }
            }
          });
          observer.observe({type: 'largest-contentful-paint', buffered: true});
        }
      }, 1000);
    });
  }
}

// Auto-initialize
initPerformanceMonitoring();
