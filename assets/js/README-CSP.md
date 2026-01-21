# Content Security Policy (CSP) Configuration

## Overview

The CSP configuration is now centralized in `assets/js/csp-config.js` to ensure consistency across all HTML pages.

## Current Status

⚠️ **Note:** CSP headers are still duplicated across HTML files. This is a known technical debt item.

## Usage

### For New Pages

When creating a new HTML page, use the CSP config:

```javascript
import { generateCSPString } from './assets/js/csp-config.js';

// In your HTML head:
const cspContent = generateCSPString();
// Then use in meta tag
```

### For Existing Pages

Currently, CSP is hardcoded in each HTML file. To update:

1. Open `assets/js/csp-config.js`
2. Modify the `CSP_DIRECTIVES` object
3. Manually update all HTML files (or use a find/replace)

## Future Improvements

- [ ] Create a build script that injects CSP from config into all HTML files
- [ ] Remove `'unsafe-inline'` from script-src and style-src (requires moving inline scripts/styles)
- [ ] Use nonces or hashes for inline scripts/styles

## Security Notes

Current CSP allows:
- `'unsafe-inline'` for scripts and styles (XSS risk - should be removed)
- External CDNs (cdn.jsdelivr.net, fonts.googleapis.com)
- Third-party services (Google Analytics, OpenAI, FormSubmit)

To improve security:
1. Move all inline scripts to external files
2. Move all inline styles to external files or use `<link>` tags
3. Remove `'unsafe-inline'` from CSP directives
4. Consider using nonces for any remaining inline content
