/**
 * Structured data (JSON-LD) helpers for SEO.
 * Generates schema.org markup for Organization, LocalBusiness, and pages.
 */

import { SITE, CONTACT } from "./constants";

export interface OrganizationSchema {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  legalName: string;
  url: string;
  logo: string;
  contactPoint: {
    "@type": "ContactPoint";
    telephone: string;
    contactType: string;
    email: string;
    areaServed: string;
  };
  address: {
    "@type": "PostalAddress";
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  sameAs: string[];
}

export interface LocalBusinessSchema {
  "@context": "https://schema.org";
  "@type": "LocalBusiness";
  name: string;
  image: string;
  "@id": string;
  url: string;
  telephone: string;
  priceRange: string;
  address: {
    "@type": "PostalAddress";
    streetAddress?: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    "@type": "GeoCoordinates";
    latitude: string;
    longitude: string;
  };
  openingHoursSpecification?: Array<{
    "@type": "OpeningHoursSpecification";
    dayOfWeek: string[];
    opens: string;
    closes: string;
  }>;
}

export interface WebPageSchema {
  "@context": "https://schema.org";
  "@type": "WebPage";
  name: string;
  description: string;
  url: string;
  inLanguage: string;
  isPartOf: {
    "@type": "WebSite";
    name: string;
    url: string;
  };
  about?: {
    "@type": "Thing";
    name: string;
  };
  primaryImageOfPage?: {
    "@type": "ImageObject";
    url: string;
  };
}

export interface ServiceSchema {
  "@context": "https://schema.org";
  "@type": "Service";
  name: string;
  description: string;
  provider: {
    "@type": "Organization";
    name: string;
  };
  areaServed: {
    "@type": "State";
    name: string;
  };
}

/**
 * Generate Organization schema (appears on all pages)
 */
export function getOrganizationSchema(): OrganizationSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.baseUrl,
    logo: `${SITE.baseUrl}/assets/images/logo-wht.png`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: CONTACT.phone,
      contactType: "Customer Service",
      email: CONTACT.email,
      areaServed: "AU",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Brookton",
      addressRegion: "WA",
      postalCode: "6306",
      addressCountry: "AU",
    },
    sameAs: [
      "https://www.facebook.com/bloomneventsco/",
      "https://www.instagram.com/bloomneventsco/",
      "https://www.linkedin.com/company/bloom-n-events-co/",
      "https://www.tiktok.com/@bloomneventsco",
    ],
  };
}

/**
 * Generate LocalBusiness schema (appears on contact page)
 */
export function getLocalBusinessSchema(): LocalBusinessSchema {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE.name,
    image: `${SITE.baseUrl}/assets/images/logo-wht.png`,
    "@id": `${SITE.baseUrl}/#organization`,
    url: SITE.baseUrl,
    telephone: CONTACT.phone,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Brookton",
      addressRegion: "WA",
      postalCode: "6306",
      addressCountry: "AU",
    },
  };
}

/**
 * Generate WebPage schema for a specific page
 */
export function getWebPageSchema(
  name: string,
  description: string,
  url: string,
  image?: string
): WebPageSchema {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url,
    inLanguage: SITE.locale,
    isPartOf: {
      "@type": "WebSite",
      name: SITE.name,
      url: SITE.baseUrl,
    },
    ...(image && {
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: image,
      },
    }),
  };
}

/**
 * Generate Service schema for service pages
 */
export function getServiceSchema(
  name: string,
  description: string
): ServiceSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: SITE.name,
    },
    areaServed: {
      "@type": "State",
      name: "Western Australia",
    },
  };
}
