# Railway 502 Error - Backend Not Responding

## Current Status

The Railway backend is returning **502 errors** - "Application failed to respond". This means the backend application isn't running or crashed.

## Immediate Steps

### 1. Check Railway Dashboard

Go to your Railway project: https://railway.app

**Check these tabs:**

#### Deployments Tab
- Is the latest deployment **successful** (green)?
- Or is it **failed** (red)?
- If failed, click on it to see error details

#### Logs Tab
- Click on your service
- Go to **"Logs"** tab
- Look for error messages
- Common errors:
  - `MONGODB_URI is not defined`
  - `OPENAI_API_KEY is required`
  - `Cannot connect to MongoDB`
  - `Error: listen EADDRINUSE: address already in use`

#### Variables Tab
- Verify these are set:
  - ✅ `OPENAI_API_KEY`
  - ✅ `MONGODB_URI`
  - ✅ `NODE_ENV=production`
  - ✅ `FRONTEND_URL=https://www.bloomneventsco.com.au`

### 2. Common Issues & Fixes

#### Issue: Missing Environment Variables

**Symptom:** Logs show "MONGODB_URI is not defined" or "OPENAI_API_KEY is required"

**Fix:**
1. Go to Railway → Your Service → Variables
2. Add missing variables:
   ```
   OPENAI_API_KEY=sk-svcacct-...
   MONGODB_URI=mongodb+srv://bloomneventsco_db_user:277taDl1609%24@bloomnevents.aglivok.mongodb.net/bloomneventsco?retryWrites=true&w=majority
   NODE_ENV=production
   FRONTEND_URL=https://www.bloomneventsco.com.au
   ```
3. Railway will auto-redeploy

#### Issue: MongoDB Connection Failed

**Symptom:** Logs show "Cannot connect to MongoDB" or "MongoServerError"

**Fix:**
1. Check MongoDB Atlas Network Access:
   - Go to MongoDB Atlas dashboard
   - Click "Network Access"
   - Make sure Railway IPs are allowed OR "Allow Access from Anywhere" (0.0.0.0/0)
2. Verify `MONGODB_URI` is correct in Railway
3. Check MongoDB connection string format

#### Issue: Backend Crashed on Startup

**Symptom:** Deployment shows "Failed" or logs show crash errors

**Fix:**
1. Check Railway logs for the exact error
2. Common causes:
   - Syntax error in code
   - Missing dependencies
   - Port conflict (unlikely on Railway)
   - Invalid environment variables

#### Issue: Service Not Running

**Symptom:** 502 error, but no recent deployment

**Fix:**
1. Go to Railway → Your Service
2. Click **"Redeploy"** or **"Restart"**
3. Wait 1-2 minutes
4. Check logs again

### 3. Verify Backend is Working

After fixing issues, test:

```bash
curl https://bloom-n-events-co-website-production.up.railway.app/health
```

Should return:
```json
{"status":"ok","service":"bloomn-events-chatbot"}
```

If you still get 502, the backend isn't running yet.

### 4. Railway Service Configuration

Make sure Railway knows how to start your backend:

**Settings Tab:**
- **Root Directory:** Should be `backend` (if your backend is in a subfolder)
- **Start Command:** Should be `npm start` or `cd backend && npm start`
- **Build Command:** Should be `npm install` or `cd backend && npm install`

**If backend is in root:**
- Root Directory: `/` (or leave empty)
- Start Command: `npm start`
- Build Command: `npm install`

**If backend is in `backend/` folder:**
- Root Directory: `backend`
- Start Command: `npm start`
- Build Command: `npm install`

### 5. Check Railway Logs for Specific Errors

The logs will tell you exactly what's wrong:

1. Go to Railway dashboard
2. Click on your service
3. Click **"Logs"** tab
4. Look for:
   - Red error messages
   - Stack traces
   - "Failed to start" messages
   - Environment variable errors

**Share the error message from logs if you need help!**

## Quick Checklist

- [ ] Railway deployment is successful (green status)
- [ ] All environment variables are set in Railway
- [ ] Railway logs show no errors
- [ ] MongoDB Atlas network access allows Railway
- [ ] Backend service is running (check Railway dashboard)
- [ ] Health endpoint returns 200: `curl https://bloom-n-events-co-website-production.up.railway.app/health`

## After Fixing

1. Wait 1-2 minutes for Railway to redeploy
2. Test health endpoint: `curl https://bloom-n-events-co-website-production.up.railway.app/health`
3. Test contact form on live site
4. Check Railway logs to see if submissions are being received

## Still Having Issues?

Share:
1. Railway logs (the error messages)
2. Deployment status (success/failed)
3. Environment variables status (which ones are set)

This will help identify the exact problem!

