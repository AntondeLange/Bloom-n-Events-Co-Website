/**
 * Cache Clearing Script
 * 
 * Clears old service worker caches on page load to ensure fresh content.
 * This script runs early in the page load to clear caches before other resources load.
 */

(function() {
    'use strict';
    
    // Check for cache version mismatch and clear old caches
    if ('serviceWorker' in navigator && 'caches' in window) {
        const CURRENT_CACHE_VERSION = 'v20250115'; // Must match sw.js version
        
        caches.keys().then(function(cacheNames) {
            const oldCaches = cacheNames.filter(function(cacheName) {
                // Delete caches that don't match current version
                return !cacheName.includes(CURRENT_CACHE_VERSION);
            });
            
            if (oldCaches.length > 0) {
                return Promise.all(
                    oldCaches.map(function(cacheName) {
                        return caches.delete(cacheName);
                    })
                );
            }
        }).catch(function(err) {
            if (typeof console !== 'undefined' && console.warn) {
                console.warn('Cache clear failed:', err);
            }
        });
    }
    
    // Listen for service worker cache cleared messages
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'CACHE_CLEARED') {
                // Cache was cleared, page will use fresh content
                console.log('Cache cleared, using fresh content');
            }
        });
    }
})();
