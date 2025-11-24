# CORS Fix for Custom Domain

## Issue

The contact form was getting CORS errors because the backend only allowed `https://antondelange.github.io`, but your site is using a custom domain: `https://www.bloomneventsco.com.au`

## Fix Applied

Updated `backend/src/server.js` to allow:
- ✅ `https://antondelange.github.io` (GitHub Pages)
- ✅ `https://www.bloomneventsco.com.au` (Custom domain with www)
- ✅ `https://bloomneventsco.com.au` (Custom domain without www)
- ✅ Any URL set in `FRONTEND_URL` environment variable

## Railway Configuration

Make sure your Railway backend has these environment variables:

1. **FRONTEND_URL** (optional but recommended):
   ```
   https://www.bloomneventsco.com.au
   ```

2. **NODE_ENV**:
   ```
   production
   ```

## After Deploying

1. Railway will automatically redeploy when you push to GitHub
2. Wait 1-2 minutes for Railway to redeploy
3. Test the contact form on: https://www.bloomneventsco.com.au/contact.html
4. It should work now! ✅

## Verify CORS is Working

Test with curl:

```bash
curl -X OPTIONS https://bloom-n-events-co-website-production.up.railway.app/api/contact \
  -H "Origin: https://www.bloomneventsco.com.au" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

You should see:
```
< HTTP/1.1 204 No Content
< Access-Control-Allow-Origin: https://www.bloomneventsco.com.au
< Access-Control-Allow-Methods: GET,POST,OPTIONS
```

## If Still Getting CORS Errors

1. Check Railway logs to see if backend redeployed
2. Verify environment variables are set correctly
3. Clear browser cache and hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
4. Check browser console for exact error message

