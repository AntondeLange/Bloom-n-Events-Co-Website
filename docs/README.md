# Documentation Index

This directory contains technical documentation for the Bloom'n Events Co website.

## Quick Links

- **[Deployment Guide](../DEPLOYMENT.md)** - How to deploy frontend and backend
- **[Environment Variables](../backend/ENV_VARIABLES.md)** - Backend environment configuration
- **[CSP Removal Guide](./CSP_REMOVAL_GUIDE.md)** - Guide for removing unsafe-inline from CSP
- **[CSP Configuration](../scripts/README-CSP.md)** - CSP configuration documentation
- **[Fixes Applied](../FIXES_APPLIED.md)** - Summary of audit fixes

## Architecture Documentation

- **[Design System](../DESIGN_SYSTEM.md)** - Design tokens and system architecture
- **[Trust & Compliance Audit](../TRUST_COMPLIANCE_AUDIT.md)** - Compliance status

## Development

- **Frontend:** Static HTML/CSS/JS (no build process currently)
- **Backend:** Node.js/Express on Railway
- **Form Handling:** FormSubmit.co (third-party)
- **Hosting:** GitHub Pages (frontend) + Railway (backend)

## Key Files

- `scripts/config.js` - Frontend configuration
- `scripts/logger.js` - Logging utility
- `scripts/csp-config.js` - CSP configuration
- `backend/src/config/env.mjs` - Backend environment validation
- `sw.js` - Service worker for caching

## Getting Started

1. **Frontend:** Clone repo, open HTML files in browser or use local server
2. **Backend:** See `backend/README.md` for setup instructions
3. **Deployment:** See `DEPLOYMENT.md` for deployment process

## Contributing

When making changes:
1. Follow existing code style
2. Update relevant documentation
3. Test locally before committing
4. Update service worker cache version on deployment
5. Review `DEPLOYMENT.md` checklist
