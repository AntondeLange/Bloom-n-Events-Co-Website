# Railway 502 Error - Diagnosis Checklist

## Current Status
Railway is returning **502 Bad Gateway** - the backend application is not responding.

## Quick Diagnosis Steps

### 1. Check Railway Logs (MOST IMPORTANT)

**Go to:** Railway Dashboard → Your Service → **Logs** tab

**Look for:**
- ❌ Red error messages
- ❌ "Failed to start" messages
- ❌ "Cannot find module" errors
- ❌ "Port already in use" errors
- ❌ Environment variable errors

**What to look for:**
```
✅ Good: "✅ Server started successfully on port 3000"
❌ Bad: "Error: Cannot find module..."
❌ Bad: "MONGODB_URI is required"
❌ Bad: "OPENAI_API_KEY is required"
❌ Bad: "EADDRINUSE: address already in use"
```

### 2. Check Deployment Status

**Go to:** Railway Dashboard → Your Service → **Deployments** tab

**Check:**
- Is the latest deployment **green** (successful)?
- Or is it **red** (failed)?
- When was the last deployment?

**If failed:**
- Click on the failed deployment
- Check the build logs
- Look for error messages

### 3. Verify Railway Service Configuration

**Go to:** Railway Dashboard → Your Service → **Settings** tab

**Check these settings:**

#### Root Directory
- Should be: `backend` (if backend is in a subfolder)
- OR: `/` (if backend is in root)
- **Current structure:** Backend is in `backend/` folder, so should be `backend`

#### Start Command
- Should be: `npm start`
- OR: `node src/server.js`
- **Current:** `npm start` (which runs `node src/server.js`)

#### Build Command
- Should be: `npm install`
- OR: Leave empty if no build step needed

### 4. Verify Environment Variables

**Go to:** Railway Dashboard → Your Service → **Variables** tab

**Required variables:**
- ✅ `NODE_ENV=production` (optional, defaults to production)
- ✅ `OPENAI_API_KEY=sk-svcacct-...` (required for chat)
- ✅ `MONGODB_URI=mongodb+srv://...` (required for contact form)
- ✅ `FRONTEND_URL=https://www.bloomneventsco.com.au` (optional, for CORS)

**Check:**
- Are all variables set?
- Are there any typos?
- Are values correct (no extra spaces)?

### 5. Check GitHub Connection

**Go to:** Railway Dashboard → Your Service → **Settings** → **Source**

**Check:**
- Is GitHub repo connected?
- Is it pointing to the correct repo: `AntondeLange/Bloom-n-Events-Co-Website`?
- Is it set to auto-deploy on push?

**If not connected:**
- Click "Connect GitHub Repo"
- Select your repo
- Set Root Directory to `backend`
- Railway will auto-deploy

### 6. Test Locally (Optional)

To verify the code works:

```bash
cd backend
npm install
npm start
```

Should see:
```
🚀 Starting Bloom'n Events backend...
📋 Environment: development
🔌 Port: 3000
✅ Server started successfully on port 3000
```

If it works locally but not on Railway, it's a Railway configuration issue.

## Common Issues & Solutions

### Issue 1: "Cannot find module"

**Cause:** Dependencies not installed or wrong root directory

**Fix:**
1. Check Railway Settings → Root Directory = `backend`
2. Check that `package.json` exists in `backend/` folder
3. Railway should auto-run `npm install` during build

### Issue 2: "Port already in use" or "EADDRINUSE"

**Cause:** Railway sets PORT automatically, but code might be hardcoded

**Fix:** ✅ Already fixed - code uses `process.env.PORT`

### Issue 3: "MONGODB_URI is required" or "OPENAI_API_KEY is required"

**Cause:** Environment variables not set in Railway

**Fix:**
1. Go to Railway → Variables
2. Add missing variables
3. Redeploy

**Note:** ✅ Code now allows server to start without these (with warnings)

### Issue 4: "Application failed to respond" (502)

**Cause:** Server crashed on startup or not listening on correct interface

**Fix:** ✅ Already fixed - code now listens on `0.0.0.0` and has better error handling

### Issue 5: Build succeeds but 502 error

**Cause:** Server crashes after startup

**Fix:**
1. Check Railway logs for runtime errors
2. Check if all imports are working
3. Verify all dependencies are installed

## What to Do Right Now

1. **Check Railway Logs** - This will tell you exactly what's wrong
2. **Check Deployment Status** - Is it deploying successfully?
3. **Verify Root Directory** - Should be `backend`
4. **Check Environment Variables** - Are they all set?
5. **Try Manual Redeploy** - Sometimes helps

## After Fixing

Test the health endpoint:
```bash
curl https://bloom-n-events-co-website-production.up.railway.app/health
```

Should return:
```json
{"status":"ok","service":"bloomn-events-chatbot"}
```

## Still Stuck?

**Share these details:**
1. Railway logs (last 50 lines)
2. Deployment status (success/failed)
3. Root Directory setting
4. Environment variables (names only, not values)
5. Any error messages from logs

This will help identify the exact problem!

