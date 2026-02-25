(function () {
  const currentScript = document.currentScript;
  if (!(currentScript instanceof HTMLScriptElement)) return;

  const gaMeasurementId = (currentScript.dataset.gaId || "").trim();
  if (!gaMeasurementId) return;

  const CONSENT_STORAGE_KEY = "bloom_analytics_consent";
  const CONSENT_GRANTED = "granted";
  const CONSENT_DENIED = "denied";
  let gaInitialized = false;
  let consentState = null;

  function readConsent() {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored === CONSENT_GRANTED || stored === CONSENT_DENIED) {
        return stored;
      }
    } catch (_error) {
      // Ignore storage access failures.
    }
    return null;
  }

  function saveConsent(value) {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, value);
    } catch (_error) {
      // Ignore storage access failures.
    }
  }

  function getSafeText(value, maxLength) {
    if (typeof value !== "string") return "";
    return value.trim().slice(0, maxLength);
  }

  function normalizeEventParams(params) {
    const normalized = {
      page_path: window.location.pathname,
      page_title: document.title,
    };

    if (!params || typeof params !== "object") {
      return normalized;
    }

    const maxStringLength = 120;

    for (const [key, value] of Object.entries(params)) {
      if (!key) continue;
      if (typeof value === "string") {
        normalized[key] = getSafeText(value, maxStringLength);
      } else if (typeof value === "number" && Number.isFinite(value)) {
        normalized[key] = value;
      } else if (typeof value === "boolean") {
        normalized[key] = value;
      }
    }

    return normalized;
  }

  function gtag() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(arguments);
  }

  function initializeGa() {
    if (gaInitialized) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || gtag;

    window.gtag("js", new Date());
    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    window.gtag("config", gaMeasurementId, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });

    const gaScript = document.createElement("script");
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`;
    document.head.appendChild(gaScript);

    gaInitialized = true;
  }

  function removeConsentBanner() {
    const banner = document.getElementById("analytics-consent-banner");
    if (banner) {
      banner.remove();
    }
  }

  function applyConsent(value) {
    consentState = value;
    saveConsent(value);

    if (value === CONSENT_GRANTED) {
      initializeGa();
      if (window.gtag) {
        window.gtag("consent", "update", { analytics_storage: "granted" });
      }
    }

    removeConsentBanner();
  }

  function createConsentBanner() {
    if (document.getElementById("analytics-consent-banner")) return;

    const style = document.createElement("style");
    style.id = "analytics-consent-banner-style";
    style.textContent =
      "#analytics-consent-banner{position:fixed;left:1rem;right:1rem;bottom:1rem;z-index:1100;background:#1f1f1f;color:#fff;padding:1rem;border-radius:.75rem;box-shadow:0 10px 30px rgba(0,0,0,.35);font-size:.92rem;line-height:1.4}#analytics-consent-banner p{margin:0 0 .75rem}#analytics-consent-banner a{color:#f6cc5b}#analytics-consent-banner .analytics-consent-actions{display:flex;gap:.5rem;flex-wrap:wrap}#analytics-consent-banner button{border:0;border-radius:.5rem;padding:.5rem .8rem;font-weight:700;cursor:pointer}#analytics-consent-banner .accept{background:#bf9b30;color:#111}#analytics-consent-banner .decline{background:#efefef;color:#222}";

    if (!document.getElementById(style.id)) {
      document.head.appendChild(style);
    }

    const banner = document.createElement("div");
    banner.id = "analytics-consent-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Analytics preferences");
    banner.innerHTML =
      '<p>We use Google Analytics to measure how people use this site (form, phone, and email enquiries). You can accept or decline analytics cookies.</p><p><a href="/policies">View privacy policy</a></p><div class="analytics-consent-actions"><button type="button" class="accept">Accept analytics</button><button type="button" class="decline">Decline analytics</button></div>';

    const acceptButton = banner.querySelector("button.accept");
    const declineButton = banner.querySelector("button.decline");

    if (acceptButton instanceof HTMLButtonElement) {
      acceptButton.addEventListener("click", function () {
        applyConsent(CONSENT_GRANTED);
      });
    }

    if (declineButton instanceof HTMLButtonElement) {
      declineButton.addEventListener("click", function () {
        applyConsent(CONSENT_DENIED);
      });
    }

    document.body.appendChild(banner);
  }

  function trackEvent(name, params) {
    if (!name || consentState !== CONSENT_GRANTED) return;

    const normalizedParams = normalizeEventParams(params);

    if (window.gtag) {
      window.gtag("event", name, normalizedParams);
    }
  }

  function findNearestLink(target) {
    if (!(target instanceof Element)) return null;
    return target.closest("a[href]");
  }

  function getLinkPathname(anchor) {
    try {
      return new URL(anchor.getAttribute("href") || "", window.location.origin).pathname;
    } catch (_error) {
      return "";
    }
  }

  function bindClickTracking() {
    document.addEventListener(
      "click",
      function (event) {
        const link = findNearestLink(event.target);
        if (!(link instanceof HTMLAnchorElement)) return;

        const href = (link.getAttribute("href") || "").trim();
        const linkText = getSafeText(link.textContent || "", 80);

        if (href.startsWith("tel:")) {
          trackEvent("lead_phone_clicked", {
            lead_method: "phone",
            link_context: linkText,
            transport_type: "beacon",
          });
          return;
        }

        if (href.startsWith("mailto:")) {
          trackEvent("lead_email_clicked", {
            lead_method: "email",
            link_context: linkText,
            transport_type: "beacon",
          });
          return;
        }

        const pathname = getLinkPathname(link);
        if (pathname === "/contact") {
          trackEvent("contact_cta_clicked", {
            cta_label: linkText,
          });
        }
      },
      { capture: true }
    );
  }

  window.bloomTrack = trackEvent;
  consentState = readConsent();

  if (consentState === CONSENT_GRANTED) {
    initializeGa();
    if (window.gtag) {
      window.gtag("consent", "update", { analytics_storage: "granted" });
    }
  } else {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", createConsentBanner, { once: true });
    } else {
      createConsentBanner();
    }
  }

  bindClickTracking();
})();
