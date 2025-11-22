# Railway Deployment Instructions

## Current Issue

The Railway backend is returning **502 errors** and **CORS errors**. The backend needs to be redeployed with the latest code.

## Quick Fix Steps

### Option 1: Manual Redeploy (Fastest)

1. Go to Railway dashboard: https://railway.app
2. Click on your project
3. Click on your backend service
4. Click **"Deployments"** tab
5. Click **"Redeploy"** button on the latest deployment
6. Wait 1-2 minutes for deployment to complete
7. Check **"Logs"** tab to verify it started successfully

### Option 2: Trigger Auto-Deploy (If Connected to GitHub)

If Railway is connected to your GitHub repo, it should auto-deploy when you push. However, if it's not working:

1. Go to Railway dashboard
2. Click on your project
3. Click on your backend service
4. Go to **"Settings"** tab
5. Check **"Source"** - should show your GitHub repo
6. If not connected, click **"Connect GitHub Repo"**
7. Select your repo: `AntondeLange/Bloom-n-Events-Co-Website`
8. Set **Root Directory** to `backend` (if your backend is in a subfolder)
9. Railway will auto-deploy on next push

### Option 3: Force Redeploy with Dummy Commit

If auto-deploy isn't working, you can trigger it:

```bash
# In your project root
git commit --allow-empty -m "Trigger Railway redeploy"
git push origin main
```

## Verify Deployment

After redeploy, check:

### 1. Health Endpoint
```bash
curl https://bloom-n-events-co-website-production.up.railway.app/health
```

Should return:
```json
{"status":"ok","service":"bloomn-events-chatbot"}
```

### 2. CORS Preflight
```bash
curl -X OPTIONS https://bloom-n-events-co-website-production.up.railway.app/api/contact \
  -H "Origin: https://www.bloomneventsco.com.au" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Should return **204** with CORS headers:
```
< HTTP/2 204
< access-control-allow-origin: https://www.bloomneventsco.com.au
< access-control-allow-methods: GET,POST,OPTIONS
```

### 3. Test Contact Form

Go to: https://www.bloomneventsco.com.au/contact.html
- Fill out the form
- Submit
- Should see success message (not CORS error)

## Common Deployment Issues

### Issue: "Build Failed"

**Check:**
- Railway logs for build errors
- `package.json` has correct `start` script
- Dependencies are listed in `package.json`

**Fix:**
- Check Railway logs
- Verify `backend/package.json` has:
  ```json
  {
    "scripts": {
      "start": "node src/server.js"
    }
  }
  ```

### Issue: "Application Crashed"

**Check Railway Logs for:**
- Missing environment variables
- MongoDB connection errors
- Port binding errors

**Common Errors:**
- `MONGODB_URI is not defined` → Add to Railway Variables
- `OPENAI_API_KEY is required` → Add to Railway Variables
- `Cannot connect to MongoDB` → Check MongoDB Atlas network access

### Issue: "502 Bad Gateway"

**Causes:**
- Backend crashed on startup
- Missing environment variables
- Application not listening on correct port

**Fix:**
1. Check Railway logs
2. Verify all environment variables are set
3. Check that `server.js` listens on `process.env.PORT` (Railway sets this automatically)

## Environment Variables Checklist

Make sure these are set in Railway → Your Service → Variables:

- ✅ `NODE_ENV=production`
- ✅ `OPENAI_API_KEY=sk-svcacct-...`
- ✅ `MONGODB_URI=mongodb+srv://...`
- ✅ `FRONTEND_URL=https://www.bloomneventsco.com.au` (optional but recommended)

## Railway Service Configuration

**Settings Tab:**
- **Root Directory:** `backend` (if backend is in subfolder) or `/` (if in root)
- **Start Command:** `npm start` (or `node src/server.js`)
- **Build Command:** `npm install` (or leave empty if no build step)

## After Successful Deploy

1. ✅ Health endpoint returns 200
2. ✅ CORS preflight returns 204
3. ✅ Contact form works on live site
4. ✅ No errors in Railway logs

## Still Having Issues?

Share:
1. Railway deployment status (success/failed)
2. Railway logs (last 50 lines)
3. Environment variables status (which ones are set)

This will help identify the exact problem!

