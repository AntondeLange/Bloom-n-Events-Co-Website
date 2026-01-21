# Deployment Guide

## Pre-Deployment Checklist

### 1. Update Service Worker Cache Version
- [ ] Open `sw.js`
- [ ] Update `CACHE_VERSION` to current date: `vYYYYMMDD` (e.g., `v20250115`)
- [ ] Commit the change

### 2. Verify Environment Configuration
- [ ] Check `scripts/config.js` - ensure `PROD_URL` is correct
- [ ] Verify backend is running and accessible
- [ ] Test chatbot functionality

### 3. Security Headers
- [ ] Verify CSP headers are consistent across all HTML files
- [ ] Check `.htaccess` is configured (if using Apache)
- [ ] Note: GitHub Pages doesn't support `.htaccess` - headers must be set via meta tags or GitHub Actions

### 4. Test Locally
- [ ] Run site locally and test all pages
- [ ] Verify forms work correctly
- [ ] Check console for errors
- [ ] Test on mobile viewport

### 5. Build/Compile (if applicable)
- [ ] Currently: No build process - files are served directly
- [ ] Future: Run build script if implemented

## Deployment Process

### Frontend (GitHub Pages)

1. **Commit all changes**
   ```bash
   git add -A
   git commit -m "Deploy: [description]"
   ```

2. **Push to main branch**
   ```bash
   git push origin main
   ```

3. **GitHub Pages auto-deploys** from `main` branch
   - Deployment typically takes 1-2 minutes
   - Check Actions tab for deployment status

4. **Verify deployment**
   - Visit https://www.bloomneventsco.com.au
   - Check browser console for errors
   - Test critical paths (contact form, chatbot)

### Backend (Railway)

1. **Verify environment variables** in Railway dashboard:
   - `OPENAI_API_KEY`
   - `NODE_ENV=production`
   - `FRONTEND_URL` (optional)
   - `PORT` (auto-set by Railway)

2. **Deploy via Railway**
   - Railway auto-deploys on git push (if connected)
   - Or manually trigger deployment in Railway dashboard

3. **Verify backend health**
   - Check `/health` endpoint: `https://[railway-url]/health`
   - Test chatbot API endpoint

## Post-Deployment Verification

### Frontend
- [ ] All pages load correctly
- [ ] Images display properly
- [ ] Forms submit successfully
- [ ] Chatbot connects to backend
- [ ] Service worker registers correctly
- [ ] No console errors
- [ ] Mobile responsive design works

### Backend
- [ ] Health check returns 200
- [ ] Chatbot API responds correctly
- [ ] CORS headers are correct
- [ ] Rate limiting is active
- [ ] Error logging works

### Performance
- [ ] Page load times acceptable
- [ ] Core Web Vitals in good range
- [ ] Images load efficiently
- [ ] No render-blocking resources

### SEO
- [ ] Meta tags present on all pages
- [ ] Structured data validates
- [ ] Sitemap is accessible
- [ ] Robots.txt is correct

## Rollback Procedure

### Frontend
1. Revert to previous commit:
   ```bash
   git revert HEAD
   git push origin main
   ```

2. Or checkout previous version:
   ```bash
   git checkout [previous-commit-hash]
   git push origin main --force
   ```

### Backend
1. Use Railway's rollback feature in dashboard
2. Or redeploy previous commit

## Environment-Specific Notes

### Development
- Backend URL: `http://localhost:3000`
- Frontend: Local file or `http://localhost:8000`
- Debug logging: Enabled
- Service worker: May need manual unregister

### Production
- Backend URL: Railway deployment URL
- Frontend: https://www.bloomneventsco.com.au
- Debug logging: Disabled
- Service worker: Auto-updates on cache version change

## Troubleshooting

### Service Worker Not Updating
- **Issue:** Old cache persists after deployment
- **Solution:** Update `CACHE_VERSION` in `sw.js` and redeploy
- **Manual:** Users can clear cache or unregister service worker

### Backend Connection Fails
- **Issue:** Chatbot shows "Service unavailable"
- **Check:** 
  - Backend is running on Railway
  - `PROD_URL` in `scripts/config.js` is correct
  - CORS allows frontend origin
  - Network tab for CORS errors

### CSP Errors
- **Issue:** Resources blocked by Content Security Policy
- **Solution:** Update CSP in `scripts/csp-config.js` and all HTML files
- **Check:** Browser console for blocked resource URLs

## Future Improvements

- [ ] Automated deployment via GitHub Actions
- [ ] Automated cache version bumping
- [ ] Automated testing before deployment
- [ ] Staging environment for pre-production testing
- [ ] Monitoring and alerting setup
