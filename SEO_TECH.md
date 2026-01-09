# SEO Technical Implementation - Bloom'n Events Co

**Date:** January 2026  
**Engineer:** Senior SEO Engineer

## Overview

This document outlines the structured data (Schema.org) implementation strategy, canonical tag configuration, sitemap structure, and robots.txt setup for the Bloom'n Events Co website.

## Structured Data Strategy

### Schema Types Implemented

#### 1. LocalBusiness (Site-wide)
**Purpose:** Primary business entity schema for local SEO and rich snippets.

**Implementation:**
- **Homepage (`index.html`):** Full LocalBusiness schema with `@id` for entity reference
- **All other pages:** Minimal LocalBusiness schema with `@id` pointing to homepage entity

**Key Properties:**
- `@id`: `https://www.bloomneventsco.com.au/#organization` (consistent across all pages)
- `name`: "Bloom'n Events Co Pty Ltd"
- `address`: Brookton, WA 6306, Australia
- `telephone`: "1800826268"
- `email`: "enquiries@bloomneventsco.com.au"
- `priceRange`: "$$"
- `areaServed`: Western Australia (State)
- `sameAs`: Social media profiles (Facebook, Instagram, LinkedIn)
- `openingHoursSpecification`: Monday-Friday, 09:00-17:00
- `hasOfferCatalog`: Service offerings with links to service pages

**Pages with LocalBusiness:**
- `index.html` (full schema)
- `about.html`
- `team.html`
- `gallery.html`
- `capabilities.html`
- `contact.html` (full schema with additional properties)

**Rationale:** LocalBusiness is more appropriate than Organization for a local service business serving Western Australia. The `@id` property ensures consistent entity recognition across pages.

#### 2. Service Schema
**Purpose:** Detailed service information for service-specific pages.

**Implementation:**
- **Service Pages:** `events.html`, `workshops.html`, `displays.html`
- Each includes a nested `LocalBusiness` provider reference
- Includes `areaServed` (Perth, Western Australia)
- Includes `hasOfferCatalog` with specific service offerings

**Key Properties:**
- `serviceType`: Specific service name (e.g., "Corporate Event Planning")
- `provider`: References the main LocalBusiness entity
- `areaServed`: City (Perth) and State (Western Australia)
- `hasOfferCatalog`: Detailed service breakdowns

**Rationale:** Service schema helps search engines understand what services are offered and where, improving local search visibility.

#### 3. CreativeWork Schema
**Purpose:** Case study pages representing completed projects.

**Implementation:**
- **Case Study Pages:** 
  - `case-study-centuria-connect140.html`
  - `case-study-hawaiian-forrestfield.html`
  - `case-study-hawaiian-neighbourhood-nibbles.html`

**Key Properties:**
- `name`: Project title
- `description`: Project summary
- `creator`: References Bloom'n Events Co as Organization
- `client`: Client organization (where appropriate)
- `locationCreated`: Event location
- `about`: Project type/category

**Rationale:** CreativeWork is appropriate for case studies as they represent creative/professional work delivered to clients. This helps showcase portfolio work in search results.

#### 4. FAQPage Schema
**Purpose:** Rich snippets for FAQ sections on service pages.

**Implementation:**
- **Service Pages with FAQs:** `events.html`, `workshops.html`, `displays.html`
- Each FAQ section has 5 questions with answers
- Questions and answers match visible content exactly

**Key Properties:**
- `mainEntity`: Array of Question/Answer pairs
- Each Question includes `name` (question text)
- Each Answer includes `text` (answer text)

**Rationale:** FAQPage schema enables FAQ rich snippets in search results, improving click-through rates and providing direct answers to user queries.

### Schema Validation

All schemas:
- Use valid JSON-LD format
- Match visible page content exactly
- Include only real, verifiable information
- Follow Schema.org best practices
- Are validated using Google's Rich Results Test

## Canonical Tags

### Strategy

**Implementation:** Every HTML page includes a canonical tag pointing to its canonical URL.

**Format:**
```html
<link rel="canonical" href="https://www.bloomneventsco.com.au/[page].html">
```

**Pages with Canonical Tags:**
- `index.html` → `https://www.bloomneventsco.com.au/`
- `about.html` → `https://www.bloomneventsco.com.au/about.html`
- `team.html` → `https://www.bloomneventsco.com.au/team.html`
- `events.html` → `https://www.bloomneventsco.com.au/events.html`
- `workshops.html` → `https://www.bloomneventsco.com.au/workshops.html`
- `displays.html` → `https://www.bloomneventsco.com.au/displays.html`
- `gallery.html` → `https://www.bloomneventsco.com.au/gallery.html`
- `capabilities.html` → `https://www.bloomneventsco.com.au/capabilities.html`
- `contact.html` → `https://www.bloomneventsco.com.au/contact.html`
- `case-study-centuria-connect140.html` → `https://www.bloomneventsco.com.au/case-study-centuria-connect140.html`
- `case-study-hawaiian-forrestfield.html` → `https://www.bloomneventsco.com.au/case-study-hawaiian-forrestfield.html`
- `case-study-hawaiian-neighbourhood-nibbles.html` → `https://www.bloomneventsco.com.au/case-study-hawaiian-neighbourhood-nibbles.html`
- `tandcs.html` → `https://www.bloomneventsco.com.au/tandcs.html`
- `policies.html` → `https://www.bloomneventsco.com.au/policies.html`
- `404.html` → `https://www.bloomneventsco.com.au/404.html`

**Rationale:** Canonical tags prevent duplicate content issues and ensure search engines index the correct version of each page.

## Sitemap.xml

### Structure

**Location:** `https://www.bloomneventsco.com.au/sitemap.xml`

**URLs Included:**
1. **Homepage** (priority: 1.0, changefreq: weekly)
2. **Service Pages** (priority: 0.9, changefreq: monthly)
   - `events.html`
   - `workshops.html`
   - `displays.html`
   - `capabilities.html`
3. **Company Information Pages** (priority: 0.8, changefreq: monthly/yearly)
   - `about.html` (yearly)
   - `team.html` (yearly)
   - `gallery.html` (monthly)
   - `contact.html` (monthly)
4. **Case Studies** (priority: 0.7, changefreq: yearly)
   - `case-study-centuria-connect140.html`
   - `case-study-hawaiian-forrestfield.html`
   - `case-study-hawaiian-neighbourhood-nibbles.html`
5. **Legal Pages** (priority: 0.5, changefreq: yearly)
   - `tandcs.html`
   - `policies.html`

**Last Modified:** 2026-01-08 (all URLs)

**Rationale:** Sitemap prioritizes key service and conversion pages while ensuring all indexable content is discoverable. Case studies and legal pages have lower priority as they change infrequently.

## Robots.txt

### Configuration

**Location:** `https://www.bloomneventsco.com.au/robots.txt`

**Content:**
```
User-agent: *
Allow: /

Sitemap: https://www.bloomneventsco.com.au/sitemap.xml
Crawl-delay: 1
```

**Rationale:**
- `Allow: /` - All content is crawlable (no restrictions)
- `Sitemap` directive points crawlers to sitemap location
- `Crawl-delay: 1` - Polite crawling (1 second delay between requests)

**No Blocked Content:** All pages, assets, and resources are accessible to search engines.

## Implementation Summary

### Files Modified

**Structured Data Added/Updated:**
- `index.html` - Updated Organization → LocalBusiness
- `events.html` - Added FAQPage schema
- `workshops.html` - Added FAQPage schema
- `displays.html` - Added FAQPage schema
- `about.html` - Added LocalBusiness schema
- `team.html` - Added LocalBusiness schema
- `gallery.html` - Added LocalBusiness schema
- `capabilities.html` - Added LocalBusiness schema

**Canonical Tags:** Verified on all 15 HTML pages

**Sitemap:** Validated - includes all key pages

**Robots.txt:** Verified - allows all content, points to sitemap

### Schema Coverage

- **LocalBusiness:** 6 pages (homepage + 5 supporting pages)
- **Service:** 3 pages (service pages)
- **CreativeWork:** 3 pages (case studies)
- **FAQPage:** 3 pages (service pages with FAQs)

### Best Practices Followed

1. **Content Matching:** All schema data matches visible page content exactly
2. **Minimal Schema:** Only essential properties included (no padding)
3. **Consistent Entity IDs:** `@id` used for entity recognition across pages
4. **Valid JSON-LD:** All schemas use valid JSON-LD format
5. **No Duplication:** Each page has appropriate schema type (no redundant schemas)
6. **Canonical Consistency:** All canonical URLs use production domain
7. **Sitemap Completeness:** All indexable pages included
8. **Crawlability:** No content blocked from search engines

## Validation & Testing

### Recommended Tools

1. **Google Rich Results Test:** https://search.google.com/test/rich-results
   - Validate structured data
   - Check for errors/warnings
   - Preview rich snippets

2. **Google Search Console:**
   - Monitor structured data coverage
   - Track rich snippet performance
   - Identify indexing issues

3. **Schema.org Validator:** https://validator.schema.org/
   - Validate JSON-LD syntax
   - Check property usage

4. **Sitemap Validator:**
   - Validate XML syntax
   - Check URL accessibility
   - Verify lastmod dates

## Maintenance Notes

### When to Update

1. **Sitemap `lastmod` dates:** Update when content changes significantly
2. **Schema data:** Update when business information changes (address, phone, hours)
3. **FAQPage schema:** Update when FAQ questions/answers change
4. **Service schema:** Update when service offerings change
5. **CreativeWork schema:** Update when case study content changes

### Adding New Pages

1. Add canonical tag to new page
2. Add LocalBusiness schema (if not a service/case study page)
3. Add Service schema (if service page)
4. Add CreativeWork schema (if case study page)
5. Add FAQPage schema (if page has visible FAQs)
6. Add URL to sitemap.xml with appropriate priority/changefreq
7. Verify robots.txt doesn't block new page

## Future Enhancements

### Potential Additions

1. **BreadcrumbList Schema:** For navigation breadcrumbs
2. **Review Schema:** If client reviews/testimonials are added
3. **Event Schema:** For upcoming events (if event calendar added)
4. **VideoObject Schema:** For video content
5. **ImageObject Schema:** For gallery images (if needed)

### Considerations

- Only add schema types that match actual content
- Validate all new schemas before deployment
- Monitor Search Console for schema errors
- Keep schemas minimal and accurate

## Conclusion

The site now has comprehensive structured data coverage, proper canonical tags, a complete sitemap, and an open robots.txt configuration. All schemas match visible content and follow Schema.org best practices. The implementation supports local SEO, rich snippets, and proper search engine crawling/indexing.
