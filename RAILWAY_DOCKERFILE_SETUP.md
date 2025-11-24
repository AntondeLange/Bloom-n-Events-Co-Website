# Railway Setup with Dockerfile - Fix "npm: not found"

## Problem

Railway is not detecting Node.js, so `npm` commands fail. This happens when Railway can't find `package.json` to auto-detect Node.js.

## Solution: Use Dockerfile

I've created a `Dockerfile` in the `backend/` folder. This explicitly tells Railway to use Node.js 20.

## What You Need to Do

### Step 1: Update Railway Settings

1. **Go to Railway Dashboard**
   - Click your project → your service
   - Click **"Settings"** tab

2. **Update Service Configuration**

   #### Start Command
   - **Remove it** or **leave empty**
   - Dockerfile handles the start command

   #### Build Command
   - **Remove it** or **leave empty**
   - Dockerfile handles the build

3. **Check Dockerfile Detection**
   - Railway should auto-detect the Dockerfile
   - If not, go to Settings → look for "Docker" or "Container" option
   - Make sure it's set to use Dockerfile

### Step 2: Verify Dockerfile Location

The Dockerfile should be at:
```
backend/Dockerfile
```

Railway should find it automatically if:
- Root Directory is set to `backend`, OR
- You're using the Dockerfile method (Railway looks for Dockerfile in the repo)

### Step 3: Redeploy

1. **Go to Deployments tab**
2. **Click "Redeploy"** on latest deployment
3. **Wait 2-3 minutes**

### Step 4: Check Build Logs

After redeploy, check **Build Logs**:

**You should see:**
```
✅ Good:
Building Docker image...
Step 1/7 : FROM node:20-alpine
Step 2/7 : WORKDIR /app
Step 3/7 : COPY package*.json ./
Step 4/7 : RUN npm install
...
Successfully built
```

**NOT:**
```
❌ Bad:
sh: 1: npm: not found
```

## Alternative: If Dockerfile Doesn't Work

If Railway still doesn't detect the Dockerfile:

### Option A: Move Dockerfile to Root

1. **Copy Dockerfile to project root:**
   ```bash
   cp backend/Dockerfile ./Dockerfile
   ```

2. **Update Dockerfile** to work from root:
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY backend/package*.json ./
   RUN npm install
   COPY backend/ ./
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

3. **In Railway Settings:**
   - **Start Command:** Leave empty
   - **Build Command:** Leave empty
   - Railway will use root Dockerfile

### Option B: Force Nixpacks with Root Directory

If Railway has a "Root Directory" setting somewhere:

1. **Find it** (might be in Advanced settings)
2. **Set to:** `backend`
3. **Start Command:** `npm start` (not `cd backend && npm start`)
4. **Build Command:** Leave empty

### Option C: Use Railway CLI

If you have Railway CLI:

```bash
railway link
railway variables set NODE_ENV=production
railway variables set OPENAI_API_KEY=...
railway variables set MONGODB_URI=...
railway up
```

## Verify It's Working

After deployment, check:

1. **Build Logs** - Should show Docker build or Node.js installation
2. **Runtime Logs** - Should show:
   ```
   🚀 Starting Bloom'n Events backend...
   ✅ Server started successfully on port 3000
   ```
3. **Health Endpoint** - `curl https://your-url.up.railway.app/health`
   - Should return: `{"status":"ok","service":"bloomn-events-chatbot"}`

## Why Dockerfile Works Better

- ✅ Explicitly specifies Node.js 20
- ✅ Railway always respects Dockerfile
- ✅ More reliable than auto-detection
- ✅ Works regardless of Root Directory setting

## Current Setup

Your repo now has:
- ✅ `backend/Dockerfile` - Explicit Node.js 20 setup
- ✅ `backend/nixpacks.toml` - Fallback for Nixpacks
- ✅ `backend/.node-version` - Version specification
- ✅ `backend/railway.json` - Railway config

Railway should use the Dockerfile first, which is the most reliable method.

