/**
 * Structured Data (JSON-LD) for SEO
 * This file contains the structured data for the homepage
 * Can be extended for other pages
 */

export const homepageStructuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://www.bloomneventsco.com.au/#organization",
  "name": "Bloom'n Events Co Pty Ltd",
  "url": "https://www.bloomneventsco.com.au/",
  "logo": "https://www.bloomneventsco.com.au/assets/images/logo-wht.png",
  "image": "https://www.bloomneventsco.com.au/assets/images/logo-wht.png",
  "description": "Professional event planning and custom displays in Brookton, WA. Corporate events, creative workshops, and bespoke installations across Perth and Western Australia.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Brookton",
    "addressRegion": "WA",
    "postalCode": "6306",
    "addressCountry": "AU"
  },
  "telephone": "1800826268",
  "email": "enquiries@bloomneventsco.com.au",
  "priceRange": "$$",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "17:00"
    }
  ],
  "areaServed": {
    "@type": "State",
    "name": "Western Australia"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -32.3667,
    "longitude": 116.9833
  },
  "sameAs": [
    "https://www.facebook.com/bloomneventsco/",
    "https://www.instagram.com/bloomneventsco/",
    "https://www.linkedin.com/company/bloom-n-events-co/"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Event Production Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Corporate Event Planning",
          "description": "Full-service corporate event planning in Perth and Western Australia. Networking events, conferences, product launches with in-house design, engineering, and fabrication.",
          "provider": {
            "@type": "LocalBusiness",
            "name": "Bloom'n Events Co Pty Ltd"
          },
          "areaServed": {
            "@type": "State",
            "name": "Western Australia"
          },
          "url": "https://www.bloomneventsco.com.au/events.html"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Creative Workshops",
          "description": "Creative workshops for kids and adults in Perth and Western Australia. School holiday programmes, team building, community events with in-house design and delivery.",
          "provider": {
            "@type": "LocalBusiness",
            "name": "Bloom'n Events Co Pty Ltd"
          },
          "areaServed": {
            "@type": "State",
            "name": "Western Australia"
          },
          "url": "https://www.bloomneventsco.com.au/workshops.html"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Custom Displays and Installations",
          "description": "Custom displays and installations in Perth and Western Australia. Seasonal decorations, event displays, permanent installations with in-house design, engineering, and fabrication.",
          "provider": {
            "@type": "LocalBusiness",
            "name": "Bloom'n Events Co Pty Ltd"
          },
          "areaServed": {
            "@type": "State",
            "name": "Western Australia"
          },
          "url": "https://www.bloomneventsco.com.au/displays.html"
        }
      }
    ]
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5",
    "reviewCount": "3"
  },
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Sophie Brinklow"
      },
      "reviewBody": "Tamara and Anton were given the brief to provide a one-day event at Hawaiian's Forrestfield that celebrated the opening of a key tenant, but also highlighted the diversity of our food offering at the Centre. We wanted to create a fun and engaging family friendly activation that encouraged dwell and participation. Every aspect of the event was managed with professionalism and attention to detail, ensuring a seamless experience for both our retailers and the community. We highly recommend Bloom n Co for their creativity, organisation, and commitment to delivering outstanding results.",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5"
      },
      "datePublished": "2024-01-01"
    },
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Val Neal"
      },
      "reviewBody": "We couldn't have done it without you. Everyone loved the concept.",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5"
      },
      "datePublished": "2024-01-01"
    },
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Sarah Moore"
      },
      "reviewBody": "Hawaiian engaged Bloom'n Events Co to run a food-based July school holiday activity across seven of our suburban neighbourhood assets. The activity was not only unique but beautifully presented, with every detail considered. Commercially, the activities drove traffic uplifts and encouraged dwell amongst our most valuable market segment – families. We would not hesitate to engage the Bloom'n team again.",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5"
      },
      "datePublished": "2024-01-01"
    }
  ]
};

/**
 * Inject structured data into page
 */
export function injectStructuredData(data) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}
