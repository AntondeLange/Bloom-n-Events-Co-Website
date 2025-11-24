# Clear Browser Cache - Fix Empty PROD_URL Issue

## Problem

The console shows `PROD_URL from config: ` (empty), which means the browser is using a cached version of `config.js` that doesn't have the Railway URL.

## Solution: Clear Browser Cache

### Option 1: Hard Refresh (Quickest)

**Chrome/Edge (Windows/Linux):**
- Press `Ctrl + Shift + R`
- Or `Ctrl + F5`

**Chrome/Edge (Mac):**
- Press `Cmd + Shift + R`

**Safari (Mac):**
- Press `Cmd + Option + R`

**Firefox:**
- Press `Ctrl + Shift + R` (Windows/Linux)
- Press `Cmd + Shift + R` (Mac)

### Option 2: Clear Site Data (Most Thorough)

1. Open Developer Tools (F12 or Cmd+Option+I)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Clear site data** or **Clear storage**
4. Check all boxes
5. Click **Clear site data**
6. Refresh the page

### Option 3: Disable Service Worker

1. Open Developer Tools (F12)
2. Go to **Application** tab
3. Click **Service Workers** in the left sidebar
4. Find your site's service worker
5. Click **Unregister**
6. Refresh the page

### Option 4: Incognito/Private Mode

Test in a private/incognito window:
- **Chrome:** `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)
- **Firefox:** `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
- **Safari:** `Cmd+Shift+N`

This will load the site without any cache.

## Verify It's Fixed

After clearing cache, check the browser console:

1. Open Developer Tools (F12)
2. Go to **Console** tab
3. Submit the contact form
4. Look for: `🔍 getBackendUrl() debug:`
5. Check `PROD_URL` - it should show: `https://bloom-n-events-co-website-production.up.railway.app`

If it still shows empty, wait 1-2 minutes for GitHub Pages to deploy the latest changes, then try again.

## What I Fixed

1. ✅ Updated service worker to bypass cache for `config.js`
2. ✅ Incremented cache version to force refresh
3. ✅ Added better debugging to identify the issue
4. ✅ Fixed butterfly icon centering on mobile

## After Clearing Cache

The contact form should work! The backend URL is configured correctly in the code - it just needs to load the latest version.

