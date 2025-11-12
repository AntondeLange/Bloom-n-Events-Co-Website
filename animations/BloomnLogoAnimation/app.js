// Entrypoint for interactive logo animations and navigation

/*
  Notes:
  - Replace scaffolded SVG paths in index.html with exact paths from your vector logo when available.
  - Routes are wired via data-route attributes; change to your real paths.
*/

// Configuration Constants
const CONFIG = {
  ANIMATION: {
    GUST_DURATION: 1.6,
    GUST_COOLDOWN_MS: 1000,
    BUTTERFLY_FLIGHT_DURATION: 12.0,
    BUTTERFLY_WAVE_AMPLITUDE: 50,
    BUTTERFLY_WAVE_FREQUENCY: 5,
    SEED_DRIFT_DURATION: 3.0,
    SEED_AUTO_HIDE_DELAY: 3000,
    LABEL_FADE_DURATION: 0.6,
    HOVER_DEBOUNCE_MS: 100
  },
  POSITIONS: {
    DANDELION_HIT_PADDING: 5,
    BUTTERFLY_LABEL_OFFSET_Y: 50,
    SEED_LABEL_OFFSET_X: 40,
    SEED_LABEL_OFFSET_X_CAPABILITIES: 85
  }
};

// Utilities
const $ = (sel) => /** @type {SVGElement} */(document.querySelector(sel));
const $$ = (sel) => /** @type {NodeListOf<SVGElement>} */(document.querySelectorAll(sel));

// Helper functions for element visibility
const setElementVisible = (element) => {
  if (!element) return;
  element.setAttribute('opacity', '1');
  element.style.opacity = '1';
  element.style.visibility = 'visible';
  element.style.display = 'block';
};

const setElementHidden = (element) => {
  if (!element) return;
  element.setAttribute('opacity', '0');
  element.style.opacity = '0';
  element.style.visibility = 'hidden';
};

// Stage entrance and parallax tilt
const stage = document.getElementById('logoStage');
const svg = /** @type {SVGSVGElement} */ (document.getElementById('bloomnLogo'));
const logoRaster = document.getElementById('logoRaster');
const externalLayer = document.getElementById('externalArtwork');

stage.classList.add('logo-stage--enter');

// If raster image exists, mark stage to reveal it (exact look)
if (logoRaster) {
  const img = new Image();
  img.onload = () => stage.classList.add('has-raster');
  img.onerror = () => {};
  img.src = logoRaster.getAttribute('href') || '';
}

// Load individual SVG components
async function loadSVGComponents() {
  try {
    // Load all individual SVG components
    const [lillySvg, daisySvg, dandelionWithSeedsSvg, dandelionNoSeedsSvg, seeds1Svg, seeds2Svg, seeds3Svg, seeds4Svg, butterflyClosedSvg, textSvg] = await Promise.all([
      fetch('assets/lilly.svg').then(r => { return r.ok ? r.text() : ''; }),
      fetch('assets/daisey.svg').then(r => { return r.ok ? r.text() : ''; }),
      fetch('assets/dandilionwseeds.svg').then(r => { return r.ok ? r.text() : ''; }),
      fetch('assets/dandilionwoseeds.svg').then(r => { return r.ok ? r.text() : ''; }),
      fetch('assets/dandilionseeds1.svg').then(r => { return r.ok ? r.text() : ''; }),
      fetch('assets/dandilionseeds2.svg').then(r => { return r.ok ? r.text() : ''; }),
      fetch('assets/dandilionseeds3.svg').then(r => { return r.ok ? r.text() : ''; }),
      fetch('assets/dandilionseeds4.svg').then(r => { return r.ok ? r.text() : ''; }),
      fetch('assets/butterflywingsclosed.svg').then(r => { return r.ok ? r.text() : ''; }),
      fetch('assets/logotext.svg').then(r => { return r.ok ? r.text() : ''; })
    ]);
    

    // Create groups for each component with positioning
    // These positions match the original scaffold layout from index.html
    // Scale values are 3x larger for 300% size increase, but positions remain relatively the same
    // Adjusted: moved down 300px (y + 300) and right 200px (x + 200)
    // Order matters for stacking: render dandelion AFTER lily so it's on top
    const components = [
      { name: 'lilly', svg: lillySvg, x: 98, y: 206, scale: 1.701 }, // 1.62 * 1.05 = 1.701 (increased by 5%)
      { name: 'daisy', svg: daisySvg, x: 168, y: 305, scale: 1.25307 }, // 1.1934 * 1.05 = 1.25307 (increased by 5%)
      // Dandelion rendered after lily so it appears on top when overlapping
      { name: 'dandelion', svg: dandelionWithSeedsSvg, x: 142, y: 162, scale: 1.872585 }, // 1.9305 * 0.97 = 1.872585 (reduced by 3%)
      { name: 'dandelionNoSeeds', svg: dandelionNoSeedsSvg, x: 142, y: 162, scale: 1.872585, hidden: true }, // 1.9305 * 0.97 = 1.872585
      { name: 'seed1', svg: seeds1Svg, x: 142, y: 162, scale: 1.3108095, hidden: true }, // 1.35135 * 0.97 = 1.3108095 (reduced by 3%)
      { name: 'seed2', svg: seeds2Svg, x: 142, y: 162, scale: 1.3108095, hidden: true },
      { name: 'seed3', svg: seeds3Svg, x: 142, y: 162, scale: 1.3108095, hidden: true },
      { name: 'seed4', svg: seeds4Svg, x: 142, y: 162, scale: 1.3108095, hidden: true },
      { name: 'butterflyClosed', svg: butterflyClosedSvg, x: 520, y: 425, scale: 1.2 }, // 0.4 * 3 = 1.2
      { name: 'brand', svg: textSvg, x: 100, y: 120, scale: 1.5 } // 0.5 * 3 = 1.5
    ];

    components.forEach(comp => {
      if (!comp.svg) {
        return;
      }
      
      
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('id', comp.name);
      g.classList.add('component');
      
      // Parse SVG more carefully
      const parser = new DOMParser();
      const doc = parser.parseFromString(comp.svg, 'image/svg+xml');
      const svgElement = doc.querySelector('svg');
      
      if (svgElement) {
        // Enable pointer events on the group - use bounding-box to limit to actual content area
        g.setAttribute('pointer-events', 'bounding-box');
        
        // First, get all elements inside the SVG (skip the outer SVG tag) and append them
        Array.from(svgElement.children).forEach(child => {
          const imported = document.importNode(child, true);
          g.appendChild(imported);
        });
        
        // THEN add the hit area LAST (so it renders on top)
        const viewBox = svgElement.getAttribute('viewBox');
        if (viewBox) {
          const [x, y, width, height] = viewBox.split(' ').map(Number);
          
          // NO HIT AREA - just use the visual content directly
        }
        
      } else {
        console.error(`Failed to parse SVG for ${comp.name}`);
        return;
      }
      
      // Position and scale - but we need to account for the SVG's internal dimensions
      // The transform applies to the group containing the imported SVG content
      const transformString = `translate(${comp.x}, ${comp.y}) scale(${comp.scale})`;
      g.setAttribute('transform', transformString);
      
      // Store original transform for dandelion so it can be restored after wiggle animations
      if (comp.name === 'dandelion') {
        g.setAttribute('data-original-transform', transformString);
      }
      
      // Hide elements marked as hidden - but use CSS class instead of inline style for easier override
      if (comp.hidden) {
        g.classList.add('hidden-component');
        g.setAttribute('style', 'opacity: 0; pointer-events: none;');
      } else {
        // Set pointer-events based on element type to handle overlaps correctly
        if (comp.name === 'lilly') {
          // Lily should ONLY capture on actual painted strokes/paths, not empty bounding box
          // Use 'none' on group, then set children to 'stroke' so only the actual line art captures events
          g.setAttribute('style', 'opacity: 1; cursor: pointer; pointer-events: none;');
          Array.from(g.children).forEach(child => {
            if (child.style) {
              child.style.pointerEvents = 'stroke'; // Only stroke, not fill or bounding box
            }
            if (child.setAttribute) {
              child.setAttribute('pointer-events', 'stroke');
            }
            // Also handle nested children
            Array.from(child.children || []).forEach(nestedChild => {
              if (nestedChild.style) {
                nestedChild.style.pointerEvents = 'stroke';
              }
              if (nestedChild.setAttribute) {
                nestedChild.setAttribute('pointer-events', 'stroke');
              }
            });
          });
        } else if (comp.name === 'daisy') {
          // Daisy should only capture on painted content
          g.setAttribute('style', 'opacity: 1; cursor: pointer; pointer-events: visiblePainted;');
          Array.from(g.children).forEach(child => {
            if (child.style) {
              child.style.pointerEvents = 'visiblePainted';
            }
          });
        } else if (comp.name === 'dandelion') {
          // Dandelion should capture all events, including in overlapping areas
          g.setAttribute('style', 'opacity: 1; cursor: pointer; pointer-events: all;');
          g.style.pointerEvents = 'all';
        } else if (comp.name === 'butterflyClosed' || comp.name === 'butterflyOpen') {
          // Butterfly should capture all events
          g.setAttribute('style', 'opacity: 1; cursor: pointer; pointer-events: all;');
          g.style.pointerEvents = 'all';
        } else {
          // Default for other elements
          g.setAttribute('style', 'opacity: 1; cursor: pointer; pointer-events: bounding-box;');
        }
      }
      
      externalLayer.appendChild(g);
      
    });

    // Reorder DOM: lily and daisy should be LAST (rendered on top) so they can receive events when overlapping with dandelion
    // Dandelion should be earlier in DOM so lily/daisy render on top and capture events first
    const dandelionEl = $('#dandelion');
    const lilyEl = $('#lilly');
    const daisyEl = $('#daisy');
    
    // Move lily and daisy to the END of externalLayer so they render on top of dandelion
    // This allows them to capture pointer events even when overlapping
    if (lilyEl && lilyEl.parentNode === externalLayer) {
      externalLayer.removeChild(lilyEl);
      externalLayer.appendChild(lilyEl);
    }
    if (daisyEl && daisyEl.parentNode === externalLayer) {
      externalLayer.removeChild(daisyEl);
      externalLayer.appendChild(daisyEl);
    }
    // Dandelion stays in its natural position (before lily/daisy)
    // But it can still be triggered when not overlapping

    stage.classList.add('has-external');
    
    // Debug: Check if elements exist
    
    createInteractiveOverlays();
  } catch (err) {
    console.error('Error loading SVG components:', err);
    // Fallback: try to load PNG if SVG fails
    const img = new Image();
    img.onload = () => stage.classList.add('has-raster');
    img.onerror = () => {};
    img.src = 'assets/logo.png';
  }
}

// Start loading components
loadSVGComponents().catch(err => {
  console.error('Failed to load components:', err);
  // Show the scaffold as fallback
  const scaffolds = document.querySelectorAll('.scaffold');
  scaffolds.forEach(el => {
    el.style.display = 'block';
    el.style.opacity = '1';
  });
});

function createInteractiveOverlays() {
  // Get the actual SVG elements and add interactivity
  const lily = $('#lilly');
  const daisy = $('#daisy');
  const dandelion = $('#dandelion');
  const brand = $('#brand');
  
  // Store references to all labels for global management
  let allLabels = [];
  let resetDandelionStateFn = null; // Will be set by dandelion setup
  
  // Global function to hide all other labels except the specified one
  function hideAllLabelsExcept(keepLabel) {
    allLabels.forEach(label => {
      if (label && label !== keepLabel) {
        label.setAttribute('opacity', '0');
      }
    });
    
    // Also hide dandelion seeds if any other element is hovered
    if (keepLabel && resetDandelionStateFn) {
      resetDandelionStateFn();
    }
  }
  
  // Add interactions to existing elements
  if (lily) {
    lily.classList.add('hotspot');
    lily.setAttribute('data-route', '/about');
    lily.setAttribute('tabindex', '0');
    
    // Ensure lily can receive pointer events - increase priority
    lily.setAttribute('pointer-events', 'all');
    lily.style.pointerEvents = 'all';
    lily.style.zIndex = '10'; // Higher z-index (though SVG z-index is based on DOM order)
    
    // Create hover label
    const lilyLabel = createHoverLabel('About Us', lily);
    allLabels.push(lilyLabel);

    // Stabilize hover: add invisible hit area so rotation gaps don't cause leave/enter flicker
    (function addLilyHitArea() {
      const save = lily.getAttribute('transform') || '';
      lily.setAttribute('transform', '');
      const bbox = lily.getBBox();
      lily.setAttribute('transform', save);
      const pad = 10;
      const hit = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      hit.setAttribute('x', String(bbox.x - pad));
      hit.setAttribute('y', String(bbox.y - pad));
      hit.setAttribute('width', String(bbox.width + pad * 2));
      hit.setAttribute('height', String(bbox.height + pad * 2));
      hit.setAttribute('fill', 'transparent');
      hit.setAttribute('pointer-events', 'all');
      lily.insertBefore(hit, lily.firstChild);
    })();
    
    attachWindGust(lily, { continuous: true });
    
    let lilyHideT;
    lily.addEventListener('pointerenter', () => {
      if (lilyHideT) clearTimeout(lilyHideT);
      hideAllLabelsExcept(lilyLabel);
      lilyLabel.setAttribute('opacity', '1');
    });
    lily.addEventListener('pointerleave', () => {
      if (lilyHideT) clearTimeout(lilyHideT);
      lilyHideT = setTimeout(() => {
        lilyLabel.setAttribute('opacity', '0');
      }, 60);
    });
    
    lily.addEventListener('click', (e) => {
      e.stopPropagation();
      navigate('/about');
    });
    lily.addEventListener('keypress', (e) => { if (e.key === 'Enter') navigate('/about'); });
  } else {
  }
  
  if (daisy) {
    daisy.classList.add('hotspot');
    daisy.setAttribute('data-route', '/team');
    daisy.setAttribute('tabindex', '0');
    
    // Ensure daisy can receive pointer events - increase priority
    daisy.setAttribute('pointer-events', 'all');
    daisy.style.pointerEvents = 'all';
    daisy.style.zIndex = '10'; // Higher z-index (though SVG z-index is based on DOM order)
    
    // Create hover label
    const daisyLabel = createHoverLabel('Our team', daisy);
    allLabels.push(daisyLabel);
    // Move daisy label up 70px total (30px + 30px + 10px)
    const currentY = parseFloat(daisyLabel.getAttribute('y')) || 0;
    daisyLabel.setAttribute('y', String(currentY - 70));
    
    // Stabilize hover: add invisible hit area to avoid flicker during rotation
    (function addDaisyHitArea() {
      const save = daisy.getAttribute('transform') || '';
      daisy.setAttribute('transform', '');
      const bbox = daisy.getBBox();
      daisy.setAttribute('transform', save);
      const pad = 10;
      const hit = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      hit.setAttribute('x', String(bbox.x - pad));
      hit.setAttribute('y', String(bbox.y - pad));
      hit.setAttribute('width', String(bbox.width + pad * 2));
      hit.setAttribute('height', String(bbox.height + pad * 2));
      hit.setAttribute('fill', 'transparent');
      hit.setAttribute('pointer-events', 'all');
      daisy.insertBefore(hit, daisy.firstChild);
    })();

    attachWindGust(daisy, { continuous: true });
    
    let daisyHideT;
    daisy.addEventListener('pointerenter', () => {
      if (daisyHideT) clearTimeout(daisyHideT);
      hideAllLabelsExcept(daisyLabel);
      daisyLabel.setAttribute('opacity', '1');
    });
    daisy.addEventListener('pointerleave', () => {
      if (daisyHideT) clearTimeout(daisyHideT);
      daisyHideT = setTimeout(() => {
        daisyLabel.setAttribute('opacity', '0');
      }, 60);
    });
    
    daisy.addEventListener('click', (e) => {
      e.stopPropagation();
      navigate('/team');
    });
    daisy.addEventListener('keypress', (e) => { if (e.key === 'Enter') navigate('/team'); });
  } else {
  }
  
  if (dandelion) {
    
    // CRITICAL: Ensure dandelion is at the end of externalLayer so it's on top
    const externalLayer = document.getElementById('externalArtwork');
    if (dandelion.parentNode && dandelion.parentNode === externalLayer) {
      dandelion.parentNode.removeChild(dandelion);
      externalLayer.appendChild(dandelion);
    }
    
    dandelion.classList.add('hotspot');
    dandelion.setAttribute('data-route', '#');
    dandelion.setAttribute('tabindex', '0');
    
    // Ensure dandelion can receive pointer events - set on group AND style
    dandelion.setAttribute('pointer-events', 'all');
    dandelion.style.pointerEvents = 'all';
    
    // Add a small invisible hit area only around the dandelion head/stem
    // This makes it easier to trigger without significantly blocking lily/daisy
    const hitArea = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    // Get bbox in local coordinates (before transform)
    const tempTransform = dandelion.getAttribute('transform');
    dandelion.setAttribute('transform', '');
    const bbox = dandelion.getBBox();
    dandelion.setAttribute('transform', tempTransform);
    
    // Very small padding to avoid blocking other elements - only 5px extension
    // This is just to make it slightly easier to hit the dandelion
    const padding = 5;
    hitArea.setAttribute('x', bbox.x - padding);
    hitArea.setAttribute('y', bbox.y - padding);
    hitArea.setAttribute('width', bbox.width + (padding * 2));
    hitArea.setAttribute('height', bbox.height + (padding * 2));
    hitArea.setAttribute('fill', 'transparent');
    hitArea.setAttribute('stroke', 'none');
    hitArea.setAttribute('pointer-events', 'all');
    hitArea.setAttribute('opacity', '0');
    hitArea.style.pointerEvents = 'all';
    hitArea.style.cursor = 'pointer';
    // Add hit area BEFORE visual content so visual content renders on top
    dandelion.insertBefore(hitArea, dandelion.firstChild);
    
    // Make sure dandelion children capture events properly
    Array.from(dandelion.children).forEach(child => {
      if (child === hitArea) return; // Skip the hit area
      if (child.style) {
        child.style.pointerEvents = 'all';
      }
      if (child.setAttribute) {
        child.setAttribute('pointer-events', 'all');
      }
    });
    
    // Store seed labels and animations
    const seedLabels = [];
    const seedAnimations = [];
    let seedsAreSpreading = false; // Track if seeds are currently animating/spread
    let seedsVisible = false; // Sticky visibility while user considers clicking
    let seedsAutoHideTimer = null; // Auto-hide seeds when idle

    function cancelSeedsAutoHide() {
      if (seedsAutoHideTimer) {
        clearTimeout(seedsAutoHideTimer);
        seedsAutoHideTimer = null;
      }
    }

    function scheduleSeedsAutoHide(delayMs = 3000) {
      cancelSeedsAutoHide();
      seedsAutoHideTimer = setTimeout(() => {
        resetDandelionState();
      }, delayMs);
    }
    
    // Add debug logging to verify wiggle attachment
    attachWiggle(dandelion, { angle: 4 });
    
    // Expose seedsAreSpreading flag to wiggle function (must be after variable declaration)
    Object.defineProperty(dandelion, '_seedsAreSpreading', {
      get: () => seedsAreSpreading,
      set: (val) => { seedsAreSpreading = val; },
      enumerable: false,
      configurable: true
    });
    
    // Helper function to get seed elements (always query fresh from DOM)
    const getSeedElements = () => {
      const elements = {
        dandelionNoSeeds: $('#dandelionNoSeeds'),
        seed1: $('#seed1'),
        seed2: $('#seed2'),
        seed3: $('#seed3'),
        seed4: $('#seed4')
      };
      return elements;
    };
    
    // Helper to check if seeds are already spread out - check ALL seeds
    const areSeedsSpreading = () => {
      const seeds = getSeedElements();
      if (!seeds.seed1 || !seeds.seed2 || !seeds.seed3 || !seeds.seed4) return false;
      
      // Check all seeds - if ANY are significantly beyond base position, they're spreading
      const seedsToCheck = [seeds.seed1, seeds.seed2, seeds.seed3, seeds.seed4];
      let spreadCount = 0;
      
      for (const seed of seedsToCheck) {
        const transform = seed.getAttribute('transform') || '';
        const match = transform.match(/translate\(([^,]+),/);
        if (match) {
          const x = parseFloat(match[1]);
          // If seed is more than 10px from baseX (142), it's spreading
          if (Math.abs(x - 142) > 10) {
            spreadCount++;
          }
        }
        // Also check if seed has final position flag
        if (seed._isAtFinalPosition || seed._finalX !== undefined) {
          spreadCount++;
        }
      }
      
      // If at least 2 seeds are spread, consider them spreading
      return spreadCount >= 2;
    };
    
    // Debug: log seed elements
    const initialSeeds = getSeedElements();
    
    // Expose reset function globally
    resetDandelionStateFn = resetDandelionState;
    
    // Helper: fully reset dandelion/seeds/labels state
    function resetDandelionState() {
      // CRITICAL: Reset ALL state flags to allow re-triggering
      seedsAreSpreading = false;
      seedsVisible = false; // Reset visibility flag
      lastHoverTime = 0; // Reset hover time so next hover can trigger immediately
      cancelSeedsAutoHide(); // Cancel any pending auto-hide timers
      
      // CRITICAL: Reset the dandelion's own transform to its original position
      // Kill any wiggle animations on the dandelion itself
      gsap.killTweensOf(dandelion);
      // Reset rotation and ensure dandelion is at its original position
      gsap.set(dandelion, { rotation: 0, clearProps: 'transform' });
      // Restore the original transform from loadSVGComponents (translate(142, 162) scale(1.872585))
      const dandelionOriginalTransform = dandelion.getAttribute('data-original-transform');
      if (dandelionOriginalTransform) {
        dandelion.setAttribute('transform', dandelionOriginalTransform);
      }
      
      // Clear any position flags from seeds so they can be re-detected as "not spreading"
      const seeds = getSeedElements();
      [seeds.seed1, seeds.seed2, seeds.seed3, seeds.seed4].forEach(seed => {
        if (seed) {
          delete seed._finalX; delete seed._finalY; delete seed._isAtFinalPosition;
        }
      });
      // Kill all seed animations and disconnect observers
      seedAnimations.forEach(anim => { if (anim && anim.kill) anim.kill(); if (anim && anim._observer) anim._observer.disconnect(); });
      seedAnimations.length = 0;
      
      // CRITICAL: Remove all seed labels IMMEDIATELY from DOM - don't wait for animation
      // First, kill any ongoing label animations
      seedLabels.forEach(label => {
        if (label) {
          gsap.killTweensOf(label);
          if (label.parentNode) {
            label.parentNode.removeChild(label);
          }
        }
      });
      seedLabels.length = 0;
      
      // Also query DOM for any orphaned labels and remove them
      const svg = dandelion.ownerSVGElement;
      if (svg) {
        const orphanedLabels = svg.querySelectorAll('text.hotspot');
        orphanedLabels.forEach(label => {
          if (label.parentNode) {
            label.parentNode.removeChild(label);
          }
        });
      }
      
      // Reset seed positions and hide seeds
      [seeds.seed1, seeds.seed2, seeds.seed3, seeds.seed4].forEach((seed, idx) => {
        if (!seed) return;
        gsap.killTweensOf(seed, true, true, true);
        const baseX = 142, baseY = 162, baseScale = 1.3108095;
        seed.setAttribute('transform', `translate(${baseX}, ${baseY}) scale(${baseScale})`);
        seed.removeAttribute('style');
        seed.style.cssText = 'opacity: 0 !important; visibility: hidden !important; pointer-events: none !important;';
      });
      // Show dandelion with seeds, hide dandelion without seeds
      gsap.to(dandelion, { opacity: 1, duration: 0.25 });
      const dandelionNoSeeds = $('#dandelionNoSeeds');
      if (dandelionNoSeeds) gsap.to(dandelionNoSeeds, { opacity: 0, duration: 0.25 });
    }

    // Dandelion hover: swap to no-seeds version and show seeds
    // Use a more robust debounce and state tracking to prevent rapid re-triggering from wiggle
    let hoverTimeout = null;
    let lastHoverTime = 0;
    const HOVER_DEBOUNCE_MS = 200; // Longer debounce to prevent wiggle from retriggering
    
    dandelion.addEventListener('pointerenter', (e) => {
      const now = Date.now();
      cancelSeedsAutoHide();
      
      // Hide all other labels when dandelion is hovered
      hideAllLabelsExcept(null);
      
      // If seeds are already visible, don't re-trigger swap; allow clicks
      if (seedsVisible) {
        return;
      }
      
      // CRITICAL: Check if pointer is actually over lily or daisy - if so, ignore this event
      const lily = $('#lilly');
      const daisy = $('#daisy');
      const relatedTarget = e.relatedTarget;
      const target = e.target;
      
      // If the target or relatedTarget is lily or daisy, ignore this hover
      if ((lily && (target === lily || target === lily.querySelector('rect') || lily.contains(target))) ||
          (daisy && (target === daisy || target === daisy.querySelector('rect') || daisy.contains(target))) ||
          (lily && (relatedTarget === lily || lily.contains(relatedTarget))) ||
          (daisy && (relatedTarget === daisy || daisy.contains(relatedTarget)))) {
        return;
      }
      
      // Also check using elementFromPoint to verify what's actually under the cursor
      const pointX = e.clientX || e.pageX;
      const pointY = e.clientY || e.pageY;
      if (pointX !== undefined && pointY !== undefined) {
        const svg = dandelion.ownerSVGElement;
        if (svg) {
          const svgPoint = svg.createSVGPoint();
          svgPoint.x = pointX;
          svgPoint.y = pointY;
          const screenCTM = svg.getScreenCTM();
          if (screenCTM) {
            const inverseCTM = screenCTM.inverse();
            const svgCoord = svgPoint.matrixTransform(inverseCTM);
            
            // Check if point is actually within dandelion bounds (not lily/daisy)
            const dandelionBBox = dandelion.getBBox();
            const dandelionTransform = dandelion.getAttribute('transform') || '';
            const dandelionXMatch = dandelionTransform.match(/translate\(([^,]+)/);
            const dandelionYMatch = dandelionTransform.match(/translate\([^,]+,([^)]+)/);
            const dandelionX = dandelionXMatch ? parseFloat(dandelionXMatch[1]) : 0;
            const dandelionY = dandelionYMatch ? parseFloat(dandelionYMatch[1]) : 0;
            
            // Check if point is within dandelion bounds
            const localX = svgCoord.x - dandelionX;
            const localY = svgCoord.y - dandelionY;
            const withinDandelion = localX >= dandelionBBox.x - 5 && 
                                   localX <= dandelionBBox.x + dandelionBBox.width + 5 &&
                                   localY >= dandelionBBox.y - 5 && 
                                   localY <= dandelionBBox.y + dandelionBBox.height + 5;
            
            // Also check if point is within lily or daisy bounds
            let withinLily = false;
            let withinDaisy = false;
            if (lily) {
              const lilyBBox = lily.getBBox();
              const lilyTransform = lily.getAttribute('transform') || '';
              const lilyXMatch = lilyTransform.match(/translate\(([^,]+)/);
              const lilyYMatch = lilyTransform.match(/translate\([^,]+,([^)]+)/);
              const lilyX = lilyXMatch ? parseFloat(lilyXMatch[1]) : 0;
              const lilyY = lilyYMatch ? parseFloat(lilyYMatch[1]) : 0;
              const lilyLocalX = svgCoord.x - lilyX;
              const lilyLocalY = svgCoord.y - lilyY;
              withinLily = lilyLocalX >= lilyBBox.x && 
                          lilyLocalX <= lilyBBox.x + lilyBBox.width &&
                          lilyLocalY >= lilyBBox.y && 
                          lilyLocalY <= lilyBBox.y + lilyBBox.height;
            }
            if (daisy) {
              const daisyBBox = daisy.getBBox();
              const daisyTransform = daisy.getAttribute('transform') || '';
              const daisyXMatch = daisyTransform.match(/translate\(([^,]+)/);
              const daisyYMatch = daisyTransform.match(/translate\([^,]+,([^)]+)/);
              const daisyX = daisyXMatch ? parseFloat(daisyXMatch[1]) : 0;
              const daisyY = daisyYMatch ? parseFloat(daisyYMatch[1]) : 0;
              const daisyLocalX = svgCoord.x - daisyX;
              const daisyLocalY = svgCoord.y - daisyY;
              withinDaisy = daisyLocalX >= daisyBBox.x && 
                           daisyLocalX <= daisyBBox.x + daisyBBox.width &&
                           daisyLocalY >= daisyBBox.y && 
                           daisyLocalY <= daisyBBox.y + daisyBBox.height;
            }
            
            // If pointer is within lily or daisy but not dandelion, ignore
            if ((withinLily || withinDaisy) && !withinDandelion) {
              return;
            }
          }
        }
      }
      
      // If we just processed a hover very recently, ignore this one
      if (now - lastHoverTime < HOVER_DEBOUNCE_MS) {
        return;
      }
      
      // Clear any pending hover timeout
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      
      // Check if seeds are already spreading - but allow retry if it's been a while
      const timeSinceLastHover = now - lastHoverTime;
      if (seedsAreSpreading && timeSinceLastHover < 1000) {
        // If we're already spreading AND it was recent, skip
        return;
      }
      
      // If seeds appear spread but it's been a while, check actual position
      if (areSeedsSpreading() && timeSinceLastHover < 1000) {
        return;
      }
      
      // If it's been a while, reset state to allow retry
      if (timeSinceLastHover > 1000) {
        seedsAreSpreading = false;
        lastHoverTime = 0;
      }
      
      // Update last hover time and mark that we're processing hover
      lastHoverTime = now;
      seedsAreSpreading = true; // Set immediately to prevent wiggle from retriggering
      
      
      // Debounce to prevent rapid re-triggers from wiggle
      hoverTimeout = setTimeout(() => {
        // Check one more time if seeds are already spreading (in case they finished animating)
        if (areSeedsSpreading()) {
          return;
        }
        
        // Always query fresh from DOM on hover
        const seeds = getSeedElements();
        
        
        if (seeds.dandelionNoSeeds && seeds.seed1 && seeds.seed2 && seeds.seed3 && seeds.seed4) {
          
          // Stop any active wiggle immediately to prevent retriggers
          gsap.killTweensOf(dandelion, 'rotation');
          dandelion.style.setProperty('transform', dandelion.getAttribute('transform') || '');
          
          // Clear any previous seed animations and labels FIRST
          seedAnimations.forEach(anim => {
            if (anim && anim.kill) anim.kill();
            if (anim && anim._observer) anim._observer.disconnect();
          });
          seedAnimations.length = 0;
          seedLabels.forEach(label => {
            if (label && label.parentNode) {
              label.parentNode.removeChild(label);
            }
          });
          seedLabels.length = 0;
          
          // Kill ALL GSAP animations on seeds and clear ALL inline styles
          [seeds.seed1, seeds.seed2, seeds.seed3, seeds.seed4].forEach(seed => {
            if (seed) {
              // Kill all GSAP tweens and clear transforms/inline styles
              gsap.killTweensOf(seed, true, true, true);
              // Completely clear style attribute to remove any GSAP-set values
              seed.style.cssText = '';
              seed.removeAttribute('style');
              // Clear position flags
              delete seed._finalX;
              delete seed._finalY;
              delete seed._isAtFinalPosition;
            }
          });
          
          // Fade out dandelion with seeds and fade in dandelion without seeds simultaneously
          gsap.to(dandelion, { opacity: 0, duration: 0.3 });
          gsap.to(seeds.dandelionNoSeeds, { 
            opacity: 1, 
            duration: 0.3,
            onStart: () => {
              // Show but do NOT block clicks; seeds are above for interaction
              seeds.dandelionNoSeeds.setAttribute('style', 'pointer-events: none; opacity: 1;');
            }
          });
          
          // IMPORTANT: Make seeds visible BEFORE animating to prevent GSAP from hiding them
          [seeds.seed1, seeds.seed2, seeds.seed3, seeds.seed4].forEach(seed => {
            if (seed) {
              // Set visibility BEFORE GSAP can interfere
              seed.style.cssText = 'opacity: 1 !important; visibility: visible !important; display: block !important; pointer-events: auto !important;';
              seed.setAttribute('opacity', '1');
            }
          });
          
          // Mark that seeds are now spreading BEFORE animation starts
          seedsAreSpreading = true;
          seedsVisible = true;
          
          // Small delay to ensure visibility is set before animation
          requestAnimationFrame(() => {
            
            // Animate seeds spreading out to the right
            animateSeedsSpreading([seeds.seed1, seeds.seed2, seeds.seed3, seeds.seed4], seedLabels, seedAnimations, cancelSeedsAutoHide);
            // Start auto-hide timer AFTER animation starts
            scheduleSeedsAutoHide();
          });
        } else {
          console.error('Missing seed elements on hover!', {
            dandelionNoSeeds: !!seeds.dandelionNoSeeds,
            seed1: !!seeds.seed1,
            seed2: !!seeds.seed2,
            seed3: !!seeds.seed3,
            seed4: !!seeds.seed4
          });
        }
      }, HOVER_DEBOUNCE_MS); // Debounce to prevent rapid re-triggers
    });
    
    // On hover exit, hide seeds and show dandelion with seeds again
    // BUT only if we're not hovering over seeds themselves
    let leaveTimeout = null;
    dandelion.addEventListener('pointerleave', (e) => {
      
      // If seeds are visible or spreading, DON'T reset immediately - let the auto-hide timer handle it
      if (seedsVisible || seedsAreSpreading) {
        scheduleSeedsAutoHide();
        return;
      }
      
      // Debounce the leave event - reduce delay to make it more responsive
      if (leaveTimeout) {
        clearTimeout(leaveTimeout);
      }
      
      leaveTimeout = setTimeout(() => {
        // Clear any pending hover timeout
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
          hoverTimeout = null;
        }
      
      // Check if the pointer is leaving to a seed element
      const relatedTarget = e.relatedTarget;
      const seeds = getSeedElements();
      
      // Use elementFromPoint to check what's actually under the cursor NOW
      let isEnteringSeed = false;
      if (e.clientX !== undefined && e.clientY !== undefined) {
        const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
        if (elementUnderCursor) {
          isEnteringSeed = (
            elementUnderCursor === seeds.seed1 || 
            elementUnderCursor === seeds.seed2 || 
            elementUnderCursor === seeds.seed3 || 
            elementUnderCursor === seeds.seed4 ||
            seeds.seed1?.contains?.(elementUnderCursor) ||
            seeds.seed2?.contains?.(elementUnderCursor) ||
            seeds.seed3?.contains?.(elementUnderCursor) ||
            seeds.seed4?.contains?.(elementUnderCursor) ||
            seedLabels.some(label => label === elementUnderCursor || label.contains?.(elementUnderCursor))
          );
        }
      }
      
      // Also check relatedTarget as fallback
      if (!isEnteringSeed && relatedTarget) {
        isEnteringSeed = (
          relatedTarget === seeds.seed1 || 
          relatedTarget === seeds.seed2 || 
          relatedTarget === seeds.seed3 || 
          relatedTarget === seeds.seed4 ||
          seeds.seed1?.contains?.(relatedTarget) ||
          seeds.seed2?.contains?.(relatedTarget) ||
          seeds.seed3?.contains?.(relatedTarget) ||
          seeds.seed4?.contains?.(relatedTarget) ||
          seedLabels.some(label => label === relatedTarget || label.contains?.(relatedTarget))
        );
      }
      
      // If moving to a seed, don't hide - let seed handle its own leave
      if (isEnteringSeed) {
        cancelSeedsAutoHide();
        return;
      }
      
      // If seeds are visible (user choosing), do NOT auto-reset here.
      // Seed/label leave handlers will trigger reset when the pointer truly leaves all options.
      if (seedsVisible) {
        // Start auto-hide countdown when pointer leaves everything
        scheduleSeedsAutoHide();
        return;
      }
      // Otherwise perform normal reset
      resetDandelionState();
      }, 250); // Slightly longer debounce on leave to allow user to aim/click
    });
  }
  
  const butterfly = $('#butterflyClosed');
  if (butterfly) {
    
    // CRITICAL: Move butterfly to end of DOM so it renders on top and can receive pointer events
    const externalLayer = document.getElementById('externalArtwork');
    if (butterfly.parentNode && butterfly.parentNode === externalLayer) {
      externalLayer.removeChild(butterfly);
      externalLayer.appendChild(butterfly);
    }
    
    butterfly.classList.add('hotspot');
    butterfly.setAttribute('data-route', '/contact');
    butterfly.setAttribute('tabindex', '0');
    
    // Ensure butterfly can receive pointer events
    butterfly.setAttribute('pointer-events', 'all');
    butterfly.style.pointerEvents = 'all';
    butterfly.style.cursor = 'pointer';
    
    // Make sure butterfly children can receive events
    Array.from(butterfly.children).forEach(child => {
      if (child.style) {
        child.style.pointerEvents = 'all';
      }
      if (child.setAttribute) {
        child.setAttribute('pointer-events', 'all');
      }
    });
    
    // Create hover label
    const butterflyLabel = createHoverLabel('Contact Us', butterfly);
    allLabels.push(butterflyLabel);
    
    
    let butterflyLiftAnimation = null;
    
    // Add debounce to prevent rapid enter/leave flickering
    let butterflyHoverDebounce = null;
    let isHoveringButterfly = false;
    let butterflyIsFlying = false; // Flag to prevent hover interference during fly-away
    
    butterfly.addEventListener('pointerenter', (e) => {
      e.stopPropagation(); // Prevent bubbling
      
      // Don't trigger hover if butterfly is flying away
      if (butterflyIsFlying) return;
      
      // Clear any pending leave
      if (butterflyHoverDebounce) {
        clearTimeout(butterflyHoverDebounce);
        butterflyHoverDebounce = null;
      }
      
      // If already hovering, don't retrigger
      if (isHoveringButterfly) return;
      isHoveringButterfly = true;
      
      
      // Hide all other labels and show only butterfly label
      hideAllLabelsExcept(butterflyLabel);
      
      // Slowly lift butterfly 30px UP - use transform attribute
      if (butterflyLabel) {
        butterflyLabel.setAttribute('opacity', '1');
      }
      
      // Get current transform to preserve scale and x position
      const currentTransform = butterfly.getAttribute('transform');
      let baseX = 520, baseY = 425, baseScale = 1.2; // Default butterfly position
      
      if (currentTransform) {
        const translateMatch = currentTransform.match(/translate\(([^,]+),([^)]+)\)/);
        const scaleMatch = currentTransform.match(/scale\(([^)]+)\)/);
        if (translateMatch) {
          baseX = parseFloat(translateMatch[1]) || baseX;
          baseY = parseFloat(translateMatch[2]) || baseY;
        }
        if (scaleMatch) {
          baseScale = parseFloat(scaleMatch[1]) || baseScale;
        }
      }
      
      // Target Y: lift up 30px (subtract from Y)
      const targetY = baseY - 30;
      
      // Animate using transform attribute - use object property for GSAP to animate
      const animState = { y: baseY };
      butterflyLiftAnimation = gsap.to(animState, {
        y: targetY,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: function() {
          butterfly.setAttribute('transform', `translate(${baseX}, ${animState.y}) scale(${baseScale})`);
        }
      });
    });
    
    butterfly.addEventListener('pointerleave', (e) => {
      e.stopPropagation(); // Prevent bubbling
      
      // Don't trigger leave if butterfly is flying away
      if (butterflyIsFlying) return;
      
      // Debounce the leave to prevent flicker
      if (butterflyHoverDebounce) {
        clearTimeout(butterflyHoverDebounce);
      }
      
      butterflyHoverDebounce = setTimeout(() => {
        isHoveringButterfly = false;
        
        // Return butterfly to base position if not clicked
        butterflyLabel.setAttribute('opacity', '0');
        if (butterflyLiftAnimation) {
          butterflyLiftAnimation.kill();
        }
      
      // Get current transform
      const currentTransform = butterfly.getAttribute('transform');
      let baseX = 520, baseY = 425, baseScale = 1.2;
      
      if (currentTransform) {
        const translateMatch = currentTransform.match(/translate\(([^,]+),([^)]+)\)/);
        const scaleMatch = currentTransform.match(/scale\(([^)]+)\)/);
        if (translateMatch) {
          baseX = parseFloat(translateMatch[1]) || baseX;
          baseY = parseFloat(translateMatch[2]) || baseY;
        }
        if (scaleMatch) {
          baseScale = parseFloat(scaleMatch[1]) || baseScale;
        }
      }
      
      // Animate back to base Y position
      const returnState = { y: baseY };
      gsap.to(returnState, {
        y: 425, // Return to original Y
        duration: 0.8,
        ease: 'power2.out',
        onUpdate: function() {
          butterfly.setAttribute('transform', `translate(${baseX}, ${returnState.y}) scale(${baseScale})`);
        },
        onComplete: () => {
          // Ensure final position is exactly at base
          butterfly.setAttribute('transform', `translate(${baseX}, 425) scale(${baseScale})`);
        }
      });
      }, 100); // 100ms debounce
    });
    
    // Add mousedown and mouseup as backup
    butterfly.addEventListener('mousedown', (e) => {
    });
    
    // Helper to initiate butterfly fly-away
    const startButterflyFlight = () => {
      butterflyIsFlying = true;
      if (butterflyHoverDebounce) {
        clearTimeout(butterflyHoverDebounce);
        butterflyHoverDebounce = null;
      }
      if (butterflyLiftAnimation) {
        butterflyLiftAnimation.kill();
      }
      butterfly.style.pointerEvents = 'none';
      animateButterflyFlyAway('/contact', butterflyLabel);
    };
    
    butterfly.addEventListener('click', (e) => {
      e.stopPropagation();
      startButterflyFlight();
    });
    
    butterfly.addEventListener('keypress', (e) => { 
      if (e.key === 'Enter') {
        startButterflyFlight();
      }
    });
  } else {
  }
  
  if (brand) {
    brand.classList.add('hotspot');
    brand.setAttribute('data-route', '/');
    brand.setAttribute('tabindex', '0');
    brand.addEventListener('click', (e) => { 
      e.stopPropagation();
      navigate('/'); 
    });
    brand.addEventListener('keypress', (e) => { if (e.key === 'Enter') navigate('/'); });
  } else {
  }
}

// Subtle parallax based on pointer position
(() => {
  const maxTilt = 8; // degrees
  let ticking = false;
  function onMove(e) {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const rect = stage.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const rx = dy * -maxTilt;
      const ry = dx * maxTilt;
      svg.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      ticking = false;
    });
  }
  function resetTilt() { svg.style.transform = 'none'; }
  stage.addEventListener('pointermove', onMove);
  stage.addEventListener('pointerleave', resetTilt);
})();

// Navigation wiring - this runs before elements are loaded, so we skip it
// Event listeners are attached in createInteractiveOverlays() after loading

function navigate(route) {
  if (!route) return;
  // In real site, use your router. For demo, use location.
  if (route.startsWith('/')) window.location.href = route;
  else if (route === '#') return; // dandelion is non-navigational; reveals seeds
  else window.location.href = route;
}

// Create hover label text element
function createHoverLabel(text, parentElement) {
  const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  label.textContent = text;
  label.setAttribute('fill', '#d7b24a');
  label.setAttribute('font-size', '42'); // Scaled 3x: 14 * 3
  label.setAttribute('font-family', 'Allura, cursive');
  label.setAttribute('opacity', '0');
  label.setAttribute('pointer-events', 'none');
  
  // Position label above the element
  const parent = parentElement.parentElement;
  const parentTransform = parentElement.getAttribute('transform');
  
  // Try to extract position from transform
  let x = 0, y = 0;
  if (parentTransform) {
    const translateMatch = parentTransform.match(/translate\(([^,]+),([^)]+)\)/);
    if (translateMatch) {
      x = parseFloat(translateMatch[1]) || 0;
      y = parseFloat(translateMatch[2]) || 0;
    }
  }
  
  // Position label above element
  // Special positioning for butterfly - 50px above
  const isButterflyLabel = text === 'Contact Us' || parentElement.id === 'butterflyClosed' || parentElement.id === 'butterflyOpen';
  const yOffset = isButterflyLabel ? 50 : 25; // 50px above butterfly
  label.setAttribute('x', String(x));
  label.setAttribute('y', String(y - yOffset));
  
  // Add to SVG parent
  if (parent && parent.tagName === 'svg') {
    parent.appendChild(label);
  } else if (parent && parent.parentElement && parent.parentElement.tagName === 'svg') {
    parent.parentElement.appendChild(label);
  } else {
    svg.appendChild(label);
  }
  
  return label;
}

// Wind gust effect - organic swaying motion like a gust of wind
// Bottom stays fixed (like a rooted plant), top sways in the wind
function attachWindGust(target, opts) {
  const config = { 
    rotationAngle: 8,       // Slightly stronger sway
    duration: 0.55,         // Slightly longer for smoothness
    ...opts 
  };
  let gustTl;
  let isGusting = false;
  let innerGroup = null; // Will store wrapper group for rotation
  
  // Wrap visual content in inner group for rotation, keeping outer transform fixed
  function setupRotationWrapper() {
    if (innerGroup) return; // Already set up
    
    // Check if already wrapped
    if (target.querySelector('.wind-rotation-wrapper')) {
      innerGroup = target.querySelector('.wind-rotation-wrapper');
      return;
    }
    
    // Store original transform (will be applied to outer group)
    const originalTransform = target.getAttribute('transform') || '';
    
    // Create inner group for rotation
    innerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    innerGroup.classList.add('wind-rotation-wrapper');
    innerGroup.setAttribute('transform', 'translate(0, 0)'); // Default no rotation
    
    // Move all children to inner group
    const children = Array.from(target.children);
    children.forEach(child => {
      innerGroup.appendChild(child);
    });
    
    // Add inner group to target
    target.appendChild(innerGroup);
    
    // Get bounding box to find pivot point
    const tempTransform = target.getAttribute('transform');
    target.setAttribute('transform', '');
    const bbox = target.getBBox();
    target.setAttribute('transform', tempTransform);
    
    // Pivot point is bottom center in local coordinates
    const pivotX = bbox.x + bbox.width / 2;
    const pivotY = bbox.y + bbox.height;
    
    // Store pivot in inner group for later use
    innerGroup._pivotX = pivotX;
    innerGroup._pivotY = pivotY;
  }
  
  let lastGustTime = 0;
  const GUST_COOLDOWN_MS = 1000; // Wait 1 second before allowing another gust
  
  function enter(e) {
    // If continuous is requested, allow immediate restart and use infinite yoyo
    const now = Date.now();
    if (!config.continuous) {
      // Prevent rapid retriggering - add cooldown when not continuous
      if (isGusting || (now - lastGustTime < GUST_COOLDOWN_MS)) {
        return;
      }
    }
    isGusting = true;
    lastGustTime = now;
    gustTl?.kill();
    
    // Setup wrapper if needed
    setupRotationWrapper();
    
    if (!innerGroup) {
      isGusting = false;
      return;
    }
    
    // Get current outer transform (position/scale stay fixed)
    const currentTransform = target.getAttribute('transform') || '';
    
    // Create animation state - only rotation changes
    const animState = { rotation: 0 };
    
    // Create wind gust animation - continuous when hovering if configured
    gustTl = gsap.timeline({ 
      repeat: config.continuous ? -1 : 1,  // Infinite while hovering for continuous mode
      yoyo: true,
      onComplete: () => {
        // Only mark as not gusting when not continuous
        if (!config.continuous) {
          isGusting = false;
          // Reset inner rotation
          if (innerGroup) {
            innerGroup.setAttribute('transform', 'translate(0, 0)');
          }
        }
      }
    });
    
    // Get pivot from inner group
    const pivotX = innerGroup._pivotX;
    const pivotY = innerGroup._pivotY;
    
    // Wind gust: rotate inner group around bottom center
    // First sway: rotate right (top moves right) - subtle
    gustTl.to(animState, {
      rotation: config.rotationAngle,
      duration: config.duration,
      ease: 'sine.inOut',
      onUpdate: function() {
        const angle = animState.rotation;
        // Rotate inner group around pivot point
        // Formula: translate(pivot) rotate(angle) translate(-pivot)
        innerGroup.setAttribute('transform', `translate(${pivotX}, ${pivotY}) rotate(${angle}) translate(${-pivotX}, ${-pivotY})`);
      }
    })
    // Return swing: rotate left (top moves left) - subtle
    .to(animState, {
      rotation: -config.rotationAngle * 0.8, // Slightly less than full opposite for natural motion
      duration: config.duration * 0.9,
      ease: 'sine.inOut',
      onUpdate: function() {
        const angle = animState.rotation;
        innerGroup.setAttribute('transform', `translate(${pivotX}, ${pivotY}) rotate(${angle}) translate(${-pivotX}, ${-pivotY})`);
      }
    })
    // Final settle: come back to center
    .to(animState, {
      rotation: 0,
      duration: config.duration * 0.7,
      ease: 'power2.out',
      onUpdate: function() {
        const angle = animState.rotation;
        innerGroup.setAttribute('transform', `translate(${pivotX}, ${pivotY}) rotate(${angle}) translate(${-pivotX}, ${-pivotY})`);
      }
    });
  }
  
  function leave(e) {
    // Stop continuous timeline immediately on leave
    if (gustTl) {
      gustTl.kill();
    }
    isGusting = false;
    if (!innerGroup) return;
    const pivotX = innerGroup._pivotX;
    const pivotY = innerGroup._pivotY;
    const currentTransform = innerGroup.getAttribute('transform') || '';
    const rotateMatch = currentTransform.match(/rotate\(([^)]+)\)/);
    const currentRotation = rotateMatch ? parseFloat(rotateMatch[1]) : 0;
    // Smooth return to center
    const returnState = { rotation: currentRotation };
    gsap.to(returnState, {
      rotation: 0,
      duration: 0.25,
      ease: 'power2.out',
      onUpdate: function() {
        const angle = returnState.rotation;
        if (innerGroup) {
          innerGroup.setAttribute('transform', `translate(${pivotX}, ${pivotY}) rotate(${angle}) translate(${-pivotX}, ${-pivotY})`);
        }
      },
      onComplete: () => {
        if (innerGroup) {
          innerGroup.setAttribute('transform', 'translate(0, 0)');
        }
      }
    });
  }
  
  target.addEventListener('pointerenter', enter);
  target.addEventListener('pointerleave', leave);
}

function attachWiggle(target, opts) {
  const config = { angle: 6, duration: 0.35, ...opts };
  let hoverTl;
  let isWiggling = false; // Track if wiggle is active
  
  function enter(e) {
    // Prevent wiggle from triggering if we're already wiggling or if it's a synthetic event
    if (isWiggling) return;
    
    // For dandelion specifically, check if seeds are spreading - if so, don't wiggle
    if (target.id === 'dandelion' && target._seedsAreSpreading) {
      return;
    }
    
    isWiggling = true;
    hoverTl?.kill();
    hoverTl = gsap.timeline({ 
      repeat: 1, 
      yoyo: true,
      onComplete: () => {
        isWiggling = false;
      }
    });
    hoverTl.to(target, { rotation: config.angle, transformOrigin: '50% 100%', duration: config.duration, ease: 'sine.inOut' })
           .to(target, { rotation: -config.angle, duration: config.duration, ease: 'sine.inOut' });
  }
  function leave(e) {
    // Don't reset wiggle if we're in the middle of wiggling and seeds are spreading
    if (target.id === 'dandelion' && target._seedsAreSpreading) {
      return;
    }
    
    isWiggling = false;
    hoverTl?.kill();
    gsap.to(target, { rotation: 0, duration: 0.4, ease: 'power2.out' });
  }
  target.addEventListener('pointerenter', enter);
  target.addEventListener('pointerleave', leave);
}

// Lilly (About)
// Note: Event listeners are attached in createInteractiveOverlays() after SVG load

// Daisy (Team)
// Note: Event listeners are attached in createInteractiveOverlays() after SVG load

// Dandelion seeds reveal to pages
const seedPages = [
  { name: 'Events', route: '/events' },
  { name: 'Workshops', route: '/workshops' },
  { name: 'Capabilities', route: '/capabilities' },
  { name: 'Gallery', route: '/gallery' },
];

const seedEmitter = $('#seedEmitter');
// Note: Dandelion event listeners are attached in createInteractiveOverlays() after SVG load

let seedsCreated = false;
function createSeedsOnce() {
  if (seedsCreated) return; seedsCreated = true;
  const origin = { x: 170, y: 250 };
  seedPages.forEach((page, i) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'seed-link');
    g.setAttribute('data-route', page.route);
    g.style.cursor = 'pointer';
    // simple seed: stem + tuft
    const stem = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    stem.setAttribute('x1', String(origin.x));
    stem.setAttribute('y1', String(origin.y));
    stem.setAttribute('x2', String(origin.x));
    stem.setAttribute('y2', String(origin.y - 8));
    stem.setAttribute('stroke', '#d7b24a');
    stem.setAttribute('stroke-width', '1.5');
    const tuft = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    tuft.setAttribute('d', `M ${origin.x - 6} ${origin.y - 10} Q ${origin.x} ${origin.y - 16} ${origin.x + 6} ${origin.y - 10}`);
    tuft.setAttribute('stroke', '#d7b24a');
    tuft.setAttribute('fill', 'none');
    g.appendChild(stem); g.appendChild(tuft);
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', String(origin.x + 10));
    label.setAttribute('y', String(origin.y - 6));
    label.setAttribute('fill', '#d7b24a');
    label.setAttribute('font-size', '12');
    label.setAttribute('font-family', 'Allura, cursive');
    label.textContent = page.name;
    g.appendChild(label);

    g.addEventListener('click', () => onSeedClick(g, page.route));
    g.addEventListener('keypress', (e) => { if (e.key === 'Enter') navigate(page.route); });
    g.setAttribute('tabindex', '0');

    seedEmitter.appendChild(g);
  });
}

function animateSeeds() {
  createSeedsOnce();
  const groups = $$('.seed-link');
  const base = { x: 170, y: 250 };
  groups.forEach((g, i) => {
    const angle = gsap.utils.mapRange(0, groups.length - 1, -10, 25, i);
    const distance = 140 + i * 20;
    const tx = base.x + Math.cos((angle * Math.PI) / 180) * distance;
    const ty = base.y - Math.sin((angle * Math.PI) / 180) * (distance * 0.6);
    gsap.set(g, { x: 0, y: 0, opacity: 0 });
    gsap.to(g, {
      duration: 1.2 + i * 0.12,
      x: tx - base.x,
      y: ty - base.y,
      opacity: 1,
      ease: 'power2.out',
      delay: 0.05 * i,
    });
    // gentle float loop
    gsap.to(g, { y: `+=${6 + i}`, duration: 2.5 + i * 0.2, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.2 + 0.05 * i });
    gsap.to(g, { rotation: gsap.utils.random(-6, 6), transformOrigin: '50% 50%', duration: 3.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  });
}

// Brand text interactions are now handled in createInteractiveOverlays()

function animateButterflyFlyAway(route, label) {
  const butterflyClosed = $('#butterflyClosed');
  
  if (!butterflyClosed) return;
  
  // Get actual screen/window width instead of SVG viewBox
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  // Get current transform to extract base position
  const currentTransform = butterflyClosed.getAttribute('transform') || '';
  let baseX = 520, baseY = 425, baseScale = 1.2;
  
  const translateMatch = currentTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);
  const scaleMatch = currentTransform.match(/scale\(([^)]+)\)/);
  if (translateMatch) {
    baseX = parseFloat(translateMatch[1]) || baseX;
    baseY = parseFloat(translateMatch[2]) || baseY;
  }
  if (scaleMatch) {
    baseScale = parseFloat(scaleMatch[1]) || baseScale;
  }
  
  
  // Get label's current position if it exists
  let labelStartX = baseX;
  let labelStartY = baseY - 50; // Default offset above butterfly
  if (label) {
    const currentLabelX = parseFloat(label.getAttribute('x')) || labelStartX;
    const currentLabelY = parseFloat(label.getAttribute('y')) || labelStartY;
    labelStartX = currentLabelX;
    labelStartY = currentLabelY;
    // Make label visible if it's not already
    label.setAttribute('opacity', '1');
    label.style.visibility = 'visible';
  }
  
  // Create animation state object
  const animState = { x: baseX, y: baseY, opacity: 1 };
  
  // Create animation timeline with zigzag flying pattern
  const fly = gsap.timeline({ 
    onComplete: () => navigate(route),
    onUpdate: () => {
      // Update transform on every frame
      butterflyClosed.setAttribute('transform', `translate(${animState.x}, ${animState.y}) scale(${baseScale})`);
      butterflyClosed.setAttribute('opacity', String(animState.opacity));
      
      // Update label position to follow butterfly
      if (label && label.parentNode) {
        const labelX = labelStartX + (animState.x - baseX); // Move label by same amount as butterfly
        const labelY = labelStartY + (animState.y - baseY); // Follow vertical movement too
        label.setAttribute('x', String(labelX));
        label.setAttribute('y', String(labelY));
        label.setAttribute('opacity', String(animState.opacity)); // Fade with butterfly
      }
    }
  });
  
  // Smooth undulating wave motion - natural butterfly flight from left to right
  // Creates a flowing sine-wave pattern as it flies across the screen
  
  
  // Calculate distance to edge of viewport (not extra 500px past it)
  const viewportWidth = svg.getBoundingClientRect().width;
  const totalDistance = viewportWidth - baseX + 100; // Just past the visible edge
  const totalDuration = 12.0; // Very slow, leisurely flight across screen (50% slower = 1.5x duration)
  const waveAmplitude = 50; // Height of the wave (up/down movement) - reduced by 50%
  const waveFrequency = 5; // Number of wave cycles across the screen
  const flapCycles = 30; // Number of wing flaps during flight (increased proportionally)
  
  
  // HORIZONTAL MOVEMENT: Smooth left to right over the full duration
  fly.to(animState, {
    x: baseX + totalDistance,
    duration: totalDuration,
    ease: 'none' // Linear horizontal movement
  }, 0); // Start at time 0
  
  // VERTICAL WAVE MOTION: Create sine wave using multiple keyframes
  const waveSteps = waveFrequency * 8; // More steps for smoother wave
  const stepDuration = totalDuration / waveSteps;
  
  for (let i = 0; i <= waveSteps; i++) {
    const progress = i / waveSteps;
    const angle = progress * waveFrequency * Math.PI * 2;
    const yOffset = Math.sin(angle) * waveAmplitude;
    
    fly.to(animState, {
      y: baseY + yOffset,
      duration: stepDuration,
      ease: 'sine.inOut'
    }, i * stepDuration); // Absolute timing
  }
  
  // WING FLAPPING: Subtle opacity pulsing throughout flight
  const flapDuration = totalDuration / flapCycles;
  
  for (let i = 0; i < flapCycles; i++) {
    const flapStartTime = i * flapDuration;
    
    // Dim slightly (wing closing)
    fly.to(animState, {
      opacity: 0.75,
      duration: flapDuration / 2,
      ease: 'sine.inOut'
    }, flapStartTime);
    
    // Brighten (wing opening)
    fly.to(animState, {
      opacity: 1,
      duration: flapDuration / 2,
      ease: 'sine.inOut'
    }, flapStartTime + (flapDuration / 2));
  }
  
  // Calculate when butterfly reaches the edge of the visible box
  const timeToReachEdge = (totalDistance - 100) / totalDistance * totalDuration;
  
  // Start fading out just before it exits the visible area
  fly.to(animState, {
    opacity: 0,
    duration: 0.8,
    ease: 'power2.in'
  }, timeToReachEdge);
  
  // Navigate as soon as it exits the visible box (no extra delay)
  fly.call(() => {
    navigate(route);
  }, null, timeToReachEdge + 0.5); // Navigate 0.5s after reaching edge
  
  // Override the onComplete to prevent double navigation
  fly.eventCallback('onComplete', null);
}

function animateSeedsSpreading(seedGroups, seedLabels, seedAnimations, cancelSeedsAutoHide) {
  
  if (!seedGroups || seedGroups.length === 0) {
    return;
  }
  
  const seedPages = [
    { name: 'Events', route: '/events' },
    { name: 'Workshops', route: '/workshops' },
    { name: 'Displays', route: '/displays' },
    { name: 'Capabilities', route: '/capabilities' },
  ];
  
  
  seedGroups.forEach((seedGroup, i) => {
    
    try {
      if (!seedGroup) {
        return;
      }
      
      
      const page = seedPages[i];
      if (!page) {
        return;
      }
    
    // Make the seed group clickable
    seedGroup.classList.add('hotspot');
    seedGroup.setAttribute('data-route', page.route);
    seedGroup.setAttribute('tabindex', '0');
    seedGroup.style.cursor = 'pointer';
    seedGroup.style.pointerEvents = 'auto';
    
    // Fixed base position - seeds start at same position as dandelion
    const baseX = 142; // Same as dandelion x position
    const baseY = 162; // Same as dandelion y position
    const baseScale = 1.3108095;
    
    // Seeds spread horizontally to the RIGHT - 150px apart for better separation, staying at same Y level
    const spacing = 150; // Increased horizontal spacing between seeds for better visibility
    // Seed 3 (Displays) needs extra 50px, Seed 4 (Capabilities) needs extra 10px to the right (reduced to stay in viewBox)
    const extraOffset = (i === 2) ? 50 : (i === 3) ? 10 : 0; // Add 50px for seed 3, 10px for seed 4 (reduced from 70)
    const finalX = baseX + (spacing * (i + 1)) + extraOffset; // Seed 1: 292, Seed 2: 442, Seed 3: 642, Seed 4: 752
    const finalY = baseY; // All seeds stay at same Y level
    
    // Kill ALL GSAP animations and clear ALL GSAP inline styles
    gsap.killTweensOf(seedGroup); // Kill all tweens
    
    // Remove hidden class if present
    seedGroup.classList.remove('hidden-component');
    
    // Force clear ALL inline styles that GSAP might have set
    seedGroup.style.cssText = ''; // Completely clear all styles
    seedGroup.removeAttribute('style'); // Remove the style attribute entirely
    
    // Set transform first
    seedGroup.setAttribute('transform', `translate(${baseX}, ${baseY}) scale(${baseScale})`);
    
    // Set visibility IMMEDIATELY - don't wait for requestAnimationFrame
    seedGroup.style.cssText = 'opacity: 1 !important; visibility: visible !important; display: block !important; pointer-events: auto !important;';
    seedGroup.setAttribute('opacity', '1');

    // Add an invisible hit area to make the whole seed easily clickable
    // Only add if not already present
    try {
      if (!seedGroup.querySelector('.seed-hit-area')) {
        const save = seedGroup.getAttribute('transform') || '';
        seedGroup.setAttribute('transform', '');
        const bbox = seedGroup.getBBox();
        seedGroup.setAttribute('transform', save);
        const pad = 6;
        const hit = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        hit.classList.add('seed-hit-area');
        hit.setAttribute('x', String(bbox.x - pad));
        hit.setAttribute('y', String(bbox.y - pad));
        hit.setAttribute('width', String(bbox.width + pad * 2));
        hit.setAttribute('height', String(bbox.height + pad * 2));
        hit.setAttribute('fill', 'transparent');
        hit.setAttribute('pointer-events', 'all');
        // Append last so it sits on top inside the group for hit testing
        seedGroup.appendChild(hit);
      } else {
      }
    } catch (error) {
      console.error(`Error adding hit area to seed ${i + 1}:`, error);
    }
    
    // Ensure ALL child elements and nested elements are visible
    const makeAllChildrenVisible = (element) => {
      if (element && element.style) {
        element.style.setProperty('opacity', '1', 'important');
        element.style.setProperty('visibility', 'visible', 'important');
        element.style.setProperty('display', 'block', 'important');
      }
      if (element && element.setAttribute) {
        element.setAttribute('opacity', '1');
      }
      // Recursively handle all children
      if (element && element.children) {
        Array.from(element.children).forEach(child => {
          makeAllChildrenVisible(child);
        });
      }
    };
    
    // Make all children visible immediately
    makeAllChildrenVisible(seedGroup);
    
    // Double-check visibility after a frame
    requestAnimationFrame(() => {
      seedGroup.style.cssText = 'opacity: 1 !important; visibility: visible !important; display: block !important; pointer-events: auto !important;';
      makeAllChildrenVisible(seedGroup);
    });
    
    
    // Debug: log positions for first seed
    if (i === 0) {
    }
    
    // Set seed to START position (baseX) - visibility already set above in requestAnimationFrame
    seedGroup.setAttribute('transform', `translate(${baseX}, ${baseY}) scale(${baseScale})`);
    
    // Create animation object to track position - animate ONLY horizontally to the RIGHT
    const animObj = { x: baseX, y: baseY };
    
    // Set up a MutationObserver to enforce visibility AND POSITION - prevents ANY code from hiding or moving seeds back
    let isEnforcingVisibility = false; // Prevent infinite loop
    const enforceVisibility = () => {
      if (isEnforcingVisibility) return; // Already enforcing
      
      const currentStyle = seedGroup.style.cssText || '';
      const hasOpacity1 = seedGroup.style.getPropertyValue('opacity') === '1' || currentStyle.includes('opacity: 1');
      const hasVisibilityVisible = seedGroup.style.getPropertyValue('visibility') === 'visible' || currentStyle.includes('visibility: visible');
      
      if (!hasOpacity1 || !hasVisibilityVisible) {
        isEnforcingVisibility = true;
        seedGroup.style.cssText = 'opacity: 1 !important; visibility: visible !important; display: block !important; pointer-events: auto !important;';
        seedGroup.setAttribute('opacity', '1');
        setTimeout(() => { isEnforcingVisibility = false; }, 10);
      }
      
      // If animation is complete, lock position at final location
      if (seedGroup._finalX !== undefined && seedGroup._finalY !== undefined) {
        const currentTransform = seedGroup.getAttribute('transform') || '';
        const expectedTransform = `translate(${seedGroup._finalX}, ${seedGroup._finalY}) scale(${baseScale})`;
        if (!currentTransform.includes(`translate(${seedGroup._finalX},`)) {
          seedGroup.setAttribute('transform', expectedTransform);
        }
      }
    };
    
    // Observe style AND transform changes - enforce visibility and position
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          if (mutation.attributeName === 'style') {
            // Only enforce if opacity is being set to something other than 1
            const opacity = seedGroup.style.getPropertyValue('opacity');
            const visibility = seedGroup.style.getPropertyValue('visibility');
            if (opacity !== '1' || visibility !== 'visible') {
              enforceVisibility();
            }
          } else if (mutation.attributeName === 'transform') {
            // If position was set but we have a final position locked, restore it
            if (seedGroup._finalX !== undefined && seedGroup._finalY !== undefined) {
              const currentTransform = seedGroup.getAttribute('transform') || '';
              if (!currentTransform.includes(`translate(${seedGroup._finalX},`)) {
                enforceVisibility(); // This will restore the position
              }
            }
          }
        }
      });
    });
    observer.observe(seedGroup, { attributes: true, attributeFilter: ['style', 'transform'] });
    
    // Also add to seedAnimations so we can disconnect on cleanup
    seedAnimations.push({ _observer: observer });
    
    // Animate seed moving RIGHT horizontally from base to final position - NO vertical movement
    // GSAP only animates the animObj, NOT the seedGroup itself - so GSAP won't touch opacity
    const anim = gsap.to(animObj, {
      x: finalX, // Move RIGHT only
      y: baseY, // Keep Y exactly the same - NO movement up/down
      duration: 2.0, // Longer duration for smoother, more visible animation
      ease: 'power2.out', // Smoother easing
      delay: 0.15 * i, // Slightly longer delay between seeds
      immediateRender: true,
      onUpdate: function() {
        // Update transform - X moves right, Y stays at baseY
        const currentX = animObj.x;
        seedGroup.setAttribute('transform', `translate(${currentX}, ${baseY}) scale(${baseScale})`);
        // Enforce visibility on every frame BUT DON'T reset position
        enforceVisibility();
      },
      onComplete: () => {
        // CRITICAL: Lock seed at final position - don't let anything move it back
        seedGroup.setAttribute('transform', `translate(${finalX}, ${baseY}) scale(${baseScale})`);
        // Store final position to prevent reset
        seedGroup._finalX = finalX;
        seedGroup._finalY = baseY;
        seedGroup._isAtFinalPosition = true; // Mark as complete
        enforceVisibility();
      },
      onStart: () => {
        // Force visibility immediately when animation starts - CRITICAL
        enforceVisibility();
      }
    });
    
    seedAnimations.push(anim);
    
    // Create and position label - make it clickable too
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.textContent = page.name;
    label.setAttribute('fill', '#d7b24a');
    label.setAttribute('font-size', '42'); // Scaled 3x: 14 * 3
    label.setAttribute('font-family', 'Allura, cursive');
    label.setAttribute('pointer-events', 'auto'); // Make label clickable
    label.setAttribute('cursor', 'pointer');
    label.classList.add('hotspot');
    
    // Position label to the right of the seed's final position
    // Labels appear horizontally aligned, with better spacing
    // For seed4 (Capabilities), use adjusted offset
    const labelOffsetX = (i === 3) ? 85 : 40; // seed4: 55px + 30px = 85px total
    label.setAttribute('x', String(finalX + labelOffsetX)); // Offset to the right of seed for better separation
    label.setAttribute('y', String(finalY + 10)); // Slightly below seed center for better alignment with text baseline
    label.setAttribute('opacity', '0');
    label.setAttribute('fill', '#d7b24a'); // Ensure gold color
    label.style.fill = '#d7b24a';
    
    // Helper to animate selection and then navigate
    const selectSeed = () => {
      cancelSeedsAutoHide(); // Cancel auto-hide when seed is selected
      // Hide other seeds and labels immediately
      // Disconnect any observers enforcing visibility
      seedAnimations.forEach(anim => { if (anim && anim._observer) anim._observer.disconnect(); });

      seedGroups.forEach((sg, idx2) => {
        if (!sg || sg === seedGroup) return;
        gsap.killTweensOf(sg, true, true, true);
        // Remove OTHER labels immediately (not this seed's label)
        if (seedLabels[idx2] && seedLabels[idx2] !== label && seedLabels[idx2].parentNode) {
          seedLabels[idx2].parentNode.removeChild(seedLabels[idx2]);
        }
        // Remove the OTHER seed elements entirely to ensure they can't reappear via observers
        if (sg.parentNode) {
          sg.parentNode.removeChild(sg);
        } else {
          // Fallback: hard-hide if DOM removal not possible
          sg.style.cssText = 'opacity: 0 !important; visibility: hidden !important; display: none !important; pointer-events: none !important;';
        }
      });
      
      // Swap dandelion to no-seeds state (seeds are floating away)
      const dandelionNoSeeds = $('#dandelionNoSeeds');
      if (dandelionNoSeeds) gsap.to(dandelionNoSeeds, { opacity: 1, duration: 0.25 });
      gsap.to(dandelion, { opacity: 0, duration: 0.25 });
      
      // Drift this seed AND its label 500px to the right at same Y and fade out (>= 1s)
      const driftState = { x: finalX };
      const labelStartX = finalX + labelOffsetX;
      
      gsap.to(driftState, {
        x: finalX + 500,
        duration: 3.0,
        ease: 'power1.inOut',
        onUpdate: function() {
          // Move seed
          seedGroup.setAttribute('transform', `translate(${driftState.x}, ${finalY}) scale(${baseScale})`);
          // Move label to follow seed
          if (label && label.parentNode) {
            const labelX = labelStartX + (driftState.x - finalX); // Move label by same amount as seed
            label.setAttribute('x', String(labelX));
          }
        },
        onComplete: () => navigate(page.route)
      });
      
      // Fade out both seed and label
      gsap.to(seedGroup, { opacity: 0, duration: 3.0, ease: 'power1.inOut' });
      if (label) {
        gsap.to(label, { opacity: 0, duration: 3.0, ease: 'power1.inOut' });
      }
    };
    
    // Add click/Enter handlers to label to run the same float-out animation
    label.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault?.();
      selectSeed();
    });
    label.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.stopPropagation();
        e.preventDefault?.();
        selectSeed();
      }
    });
    // Hide labels when leaving the seed/label area entirely
    const leaveChecker = (e) => {
      // On leaving a seed or label, start/refresh the auto-hide countdown
      scheduleSeedsAutoHide();
    };
    seedGroup.addEventListener('pointerleave', leaveChecker);
    label.addEventListener('pointerleave', leaveChecker);
    seedGroup.addEventListener('pointerenter', cancelSeedsAutoHide);
    label.addEventListener('pointerenter', cancelSeedsAutoHide);
    
    // Add to SVG
    svg.appendChild(label);
    seedLabels.push(label);
    
    // Make label visible immediately - position it and show it
    label.setAttribute('opacity', '0'); // Start at 0 for fade-in
    label.style.visibility = 'visible';
    label.style.pointerEvents = 'auto';
    label.style.display = 'block';
    
    // Log label creation for debugging
    
    // Fade in label after seed starts moving - shorter delay
    gsap.to(label, { 
      opacity: 1, 
      duration: 0.6, 
      delay: 0.2 + i * 0.15, // Faster appearance
      ease: 'power2.out',
      onStart: () => {
        label.setAttribute('opacity', '1');
        label.style.opacity = '1';
        label.style.visibility = 'visible';
        label.style.pointerEvents = 'auto';
      },
      onComplete: () => {
        // Ensure label is fully visible
        label.setAttribute('opacity', '1');
        label.style.opacity = '1';
        label.style.visibility = 'visible';
        label.style.display = 'block';
      }
    });
    
    // REMOVE float and rotation animations - seeds should stay FIXED horizontally
    // No vertical movement, no rotation - just stay in position while hovered
    
    // Add click handler - navigate to page (seed flies right when clicked)
    seedGroup.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault?.();
      selectSeed();
    });
    
    seedGroup.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.stopPropagation();
        // Same as click behavior
        selectSeed();
      }
    });
    
    } catch (error) {
      console.error(`ERROR processing seed ${i + 1}:`, error);
      console.error('Error stack:', error.stack);
    }
  });
  
}

