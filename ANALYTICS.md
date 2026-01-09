# Analytics Implementation - Bloom'n Events Co

**Date:** January 2026  
**Engineer:** Senior Full-Stack Developer

## Overview

This document outlines the Google Analytics 4 (GA4) implementation strategy, event tracking configuration, and privacy considerations for the Bloom'n Events Co website.

## GA4 Integration

### Implementation

**Measurement ID:** `G-T5DJCCT19V`

**Loading Strategy:**
- **Deferred Loading:** GA4 script loads after page is interactive using `requestIdleCallback` or `setTimeout`
- **Performance Optimized:** Does not block initial page render
- **Fallback Support:** Works with or without `requestIdleCallback` support

**Code Pattern:**
```javascript
// Initialize dataLayer
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-T5DJCCT19V', {
  'send_page_view': false  // Defer page view until script loads
});

// Load script asynchronously after page is interactive
if ('requestIdleCallback' in window) {
  requestIdleCallback(function() {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-T5DJCCT19V';
    document.head.appendChild(script);
    script.onload = function() {
      gtag('config', 'G-T5DJCCT19V', {
        'send_page_view': true  // Send page view after script loads
      });
    };
  });
}
```

**Rationale:** 
- Deferred loading ensures analytics doesn't impact Core Web Vitals (LCP, FID, CLS)
- Async loading prevents blocking page render
- Page view is sent only after script fully loads to ensure accurate tracking

## Event Tracking

### Event Categories

Events are organized into logical categories for easy analysis:

1. **Conversion:** Primary conversion events (form submissions, lead generation)
2. **Engagement:** User engagement events (clicks, interactions)
3. **Content:** Content selection events (service cards, case studies)
4. **Performance:** Web Vitals and performance metrics
5. **Error:** Error and exception tracking

### Tracked Events

#### 1. Primary CTA Clicks

**Event Name:** `generate_lead`

**When It Fires:**
- Hero section CTA buttons (e.g., "Get a Free Consultation")
- Final CTA section buttons (e.g., "Get a Free Consultation", "View Our Portfolio")

**Event Parameters:**
```javascript
{
  'event_category': 'Conversion',
  'event_label': 'CTA Button Text',  // e.g., "Get a Free Consultation"
  'location': 'hero' | 'final_cta',  // Where the CTA appears
  'method': 'contact_form' | 'portfolio_view',  // Action type
  'value': 1
}
```

**Example:**
```javascript
gtag('event', 'generate_lead', {
  'event_category': 'Conversion',
  'event_label': 'Get a Free Consultation',
  'location': 'hero',
  'method': 'contact_form',
  'value': 1
});
```

**Pages:** Homepage (`index.html`), Service pages, Case study pages

**Rationale:** `generate_lead` is a GA4 recommended event for tracking lead generation actions. This helps identify which CTAs are most effective.

#### 2. Contact Form Submissions

**Event Name:** `generate_lead`

**When It Fires:**
- After successful form submission (when `?success=true` appears in URL)
- Form submission is handled by FormSubmit service

**Event Parameters:**
```javascript
{
  'event_category': 'Conversion',
  'event_label': 'Contact Form Submission',
  'method': 'contact_form',
  'form_name': 'contact_form',
  'value': 1
}
```

**Example:**
```javascript
gtag('event', 'generate_lead', {
  'event_category': 'Conversion',
  'event_label': 'Contact Form Submission',
  'method': 'contact_form',
  'form_name': 'contact_form',
  'value': 1
});
```

**Pages:** Contact page (`contact.html`)

**Rationale:** Tracks successful form submissions as conversion events. Only fires on successful submission (not on validation errors).

#### 3. Service Card Clicks

**Event Name:** `select_content`

**When It Fires:**
- User clicks on a service card link on the homepage
- Service cards: Corporate Events, Creative Workshops, Custom Displays

**Event Parameters:**
```javascript
{
  'content_type': 'service',
  'content_id': 'service_name',  // e.g., "corporate_events"
  'item_name': 'Service Title',  // e.g., "Corporate Events"
  'event_label': 'href',  // Destination URL
  'value': 1
}
```

**Example:**
```javascript
gtag('event', 'select_content', {
  'content_type': 'service',
  'content_id': 'corporate_events',
  'item_name': 'Corporate Events',
  'event_label': 'events.html',
  'value': 1
});
```

**Pages:** Homepage (`index.html`)

**Rationale:** `select_content` is a GA4 recommended event for tracking content selection. Helps identify which services generate the most interest.

#### 4. Case Study Clicks

**Event Name:** `select_content`

**When It Fires:**
- User clicks on a case study card link on the homepage
- Case studies: Centuria Connect140, Hawaiian Forrestfield, Hawaiian Neighbourhood Nibbles

**Event Parameters:**
```javascript
{
  'content_type': 'case_study',
  'content_id': 'case_study_id',  // e.g., "case-study-centuria-connect140"
  'item_name': 'Case Study Title',  // e.g., "Corporate Networking Event Delivers Meaningful Connections"
  'event_label': 'href',  // Destination URL
  'value': 1
}
```

**Example:**
```javascript
gtag('event', 'select_content', {
  'content_type': 'case_study',
  'content_id': 'case-study-centuria-connect140',
  'item_name': 'Corporate Networking Event Delivers Meaningful Connections',
  'event_label': 'case-study-centuria-connect140.html',
  'value': 1
});
```

**Pages:** Homepage (`index.html`)

**Rationale:** Tracks which case studies are most engaging. Helps identify which project types resonate with potential clients.

#### 5. Contact Method Clicks

**Event Name:** `contact_click`

**When It Fires:**
- User clicks on telephone link (`tel:`)
- User clicks on email link (`mailto:`)

**Event Parameters:**
```javascript
{
  'event_category': 'Engagement',
  'event_label': 'Phone' | 'Email',
  'method': 'telephone' | 'email',
  'value': 1
}
```

**Example:**
```javascript
// Telephone click
gtag('event', 'contact_click', {
  'event_category': 'Engagement',
  'event_label': 'Phone',
  'method': 'telephone',
  'value': 1
});

// Email click
gtag('event', 'contact_click', {
  'event_category': 'Engagement',
  'event_label': 'Email',
  'method': 'email',
  'value': 1
});
```

**Pages:** All pages with contact information

**Rationale:** Tracks preferred contact methods. Helps understand how users prefer to reach out.

#### 6. Secondary CTA Clicks

**Event Name:** `click`

**When It Fires:**
- User clicks on secondary CTA buttons (not primary CTAs)
- Buttons with classes `btn-gold` or `btn-outline-gold` that are not in hero or final CTA sections

**Event Parameters:**
```javascript
{
  'event_category': 'Engagement',
  'event_label': 'Button Text',
  'location': 'section_name',
  'value': 1
}
```

**Example:**
```javascript
gtag('event', 'click', {
  'event_category': 'Engagement',
  'event_label': 'Learn More About Our Capabilities',
  'location': 'why_us',
  'value': 1
});
```

**Pages:** All pages with secondary CTAs

**Rationale:** Tracks engagement with secondary actions. Helps identify which content sections drive interest.

#### 7. Performance Events (Web Vitals)

**Event Names:** `lcp`, `fid`, `cls`

**When It Fires:**
- Automatically tracked via Performance Observer API
- Measures Core Web Vitals for performance monitoring

**Event Parameters:**
```javascript
{
  'event_category': 'Performance',
  'value': metric_value,  // Numeric value of the metric
  'event_label': 'metric_name'
}
```

**Pages:** All pages

**Rationale:** Tracks page performance metrics. Helps identify performance issues and optimization opportunities.

#### 8. Error Tracking

**Event Name:** `exception`

**When It Fires:**
- JavaScript errors occur
- Unhandled promise rejections

**Event Parameters:**
```javascript
{
  'event_category': 'Error',
  'description': 'Error message',
  'fatal': false  // Usually false for caught errors
}
```

**Pages:** All pages

**Rationale:** Tracks errors to identify and fix issues. Helps maintain site reliability.

#### 9. Chatbot Events

**Event Names:** `chatbot_opened`, `chatbot_closed`, `chatbot_notification_shown`

**When It Fires:**
- User opens chatbot
- User closes chatbot
- Chatbot notification is shown

**Event Parameters:**
```javascript
{
  'event_category': 'Engagement',
  'event_label': 'Chatbot Interaction',
  'value': 1
}
```

**Pages:** All pages with chatbot

**Rationale:** Tracks chatbot engagement. Helps understand if chatbot is being used effectively.

## Privacy Considerations

### Data Collection

**What We Track:**
- User interactions (clicks, form submissions)
- Page views
- Performance metrics
- Error events

**What We Don't Track:**
- Personal identifiable information (PII)
- Form field values (only submission success)
- User IP addresses (handled by GA4)
- Cross-site tracking

### Privacy Features

1. **No Invasive Tracking:**
   - No user profiling beyond standard GA4 metrics
   - No fingerprinting
   - No cross-site tracking cookies

2. **Respects User Privacy:**
   - GA4 respects Do Not Track (DNT) signals
   - Users can opt out via browser settings
   - No forced consent banners (not required for basic analytics)

3. **Data Minimization:**
   - Only tracks essential conversion and engagement events
   - No unnecessary user behavior tracking
   - No sensitive data collection

### GDPR Compliance

**Note:** For EU users, consider implementing:
- Cookie consent banner (if required by jurisdiction)
- Privacy policy link
- Data retention settings in GA4

**Current Implementation:** Basic analytics without consent banner (may need adjustment based on jurisdiction requirements).

## Event Naming Conventions

### GA4 Recommended Events

We use GA4 recommended event names where applicable:

- `generate_lead` - Lead generation events (CTAs, form submissions)
- `select_content` - Content selection events (service cards, case studies)
- `click` - Generic click events (secondary CTAs)
- `exception` - Error tracking

### Custom Events

Custom events follow consistent naming:

- `contact_click` - Contact method clicks (tel, email)
- `chatbot_opened` - Chatbot interactions
- `chatbot_closed` - Chatbot interactions
- `chatbot_notification_shown` - Chatbot interactions

### Event Parameters

All events include:
- `event_category` - Logical grouping (Conversion, Engagement, Content, Performance, Error)
- `event_label` - Human-readable description
- `value` - Numeric value (usually 1 for count events)

Additional parameters are added based on event type:
- `location` - Where the event occurred (hero, final_cta, etc.)
- `method` - How the action was taken (contact_form, email, telephone)
- `content_type` - Type of content (service, case_study)
- `content_id` - Unique identifier for content
- `item_name` - Display name of content

## Implementation Files

### Files Modified

1. **`scripts.js`** - Enhanced event tracking for:
   - Service card clicks
   - Case study clicks
   - Primary CTA clicks
   - Contact method clicks
   - Secondary CTA clicks

2. **`contact.html`** - Form submission tracking:
   - Success event tracking
   - Uses `generate_lead` event

3. **`index.html`** - GA4 initialization:
   - Deferred loading implementation
   - Performance monitoring

### Event Tracking Logic

**Location:** `scripts.js` (lines ~1566-1620)

**Pattern:**
```javascript
document.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a || typeof gtag === 'undefined') return;
  
  // Determine event type based on link characteristics
  // Fire appropriate GA4 event with relevant parameters
});
```

**Rationale:** Single event listener for all click tracking. Efficient and maintainable.

## Testing & Validation

### Testing Checklist

- [x] GA4 script loads correctly
- [x] Page views are tracked
- [x] Primary CTA clicks fire `generate_lead` events
- [x] Form submissions fire `generate_lead` events
- [x] Service card clicks fire `select_content` events
- [x] Case study clicks fire `select_content` events
- [x] Contact method clicks fire `contact_click` events
- [x] Performance events are tracked
- [x] Error events are tracked

### Validation Tools

1. **Google Analytics DebugView:**
   - Real-time event monitoring
   - Verify events fire correctly
   - Check event parameters

2. **Google Tag Assistant:**
   - Browser extension for testing
   - Validates GA4 implementation
   - Checks for errors

3. **Chrome DevTools:**
   - Network tab to verify GA4 requests
   - Console for debugging
   - Performance tab for Web Vitals

### Testing Procedure

1. Open site in browser
2. Open Chrome DevTools → Network tab
3. Filter by "collect" (GA4 requests)
4. Perform actions (click CTAs, submit form, etc.)
5. Verify events appear in Network tab
6. Check event parameters in request payload

## Analytics Dashboard Setup

### Recommended Reports

1. **Conversion Funnel:**
   - Service card clicks → Case study clicks → CTA clicks → Form submissions
   - Identify drop-off points

2. **Content Performance:**
   - Which services are most popular
   - Which case studies drive engagement
   - Which CTAs convert best

3. **Engagement Metrics:**
   - Contact method preferences
   - Chatbot usage
   - Secondary CTA performance

4. **Performance Monitoring:**
   - Core Web Vitals trends
   - Error rates
   - Page load times

### Custom Dimensions (Optional)

Consider adding custom dimensions for:
- Service type (Corporate Events, Workshops, Displays)
- Case study type
- CTA location (hero, final_cta, other)
- Page type (homepage, service page, case study)

## Maintenance Notes

### When to Update

1. **New Services:** Add service card tracking if new services are added
2. **New Case Studies:** Add case study tracking if new case studies are added
3. **New CTAs:** Ensure new CTAs are tracked appropriately
4. **Form Changes:** Update form submission tracking if form structure changes

### Adding New Events

1. Determine if event fits existing category or needs new one
2. Use GA4 recommended event names where applicable
3. Include consistent parameters (`event_category`, `event_label`, `value`)
4. Document in this file
5. Test in DebugView before deploying

## Future Enhancements

### Potential Additions

1. **Scroll Tracking:**
   - Track scroll depth (25%, 50%, 75%, 100%)
   - Identify content engagement

2. **Video Tracking:**
   - Track hero video play/pause
   - Measure video engagement

3. **Search Tracking:**
   - If site search is added
   - Track search queries and results

4. **E-commerce Tracking:**
   - If online booking/payment is added
   - Track purchase events

### Considerations

- Only add tracking that provides actionable insights
- Maintain privacy-conscious approach
- Keep event naming consistent
- Document all new events

## Conclusion

The analytics implementation provides comprehensive tracking of key user interactions while maintaining privacy and performance. All events are documented, consistent, and follow GA4 best practices. The implementation is clean, maintainable, and ready for production use.
