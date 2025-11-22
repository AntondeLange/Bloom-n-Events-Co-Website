# Railway Caddy Issue - Fix Guide

## Problem

Railway logs show **Caddy** (a web server) is running instead of your **Node.js backend**. This means Railway is detecting Caddy and trying to run it instead of your Node.js application.

## Why This Happens

Railway has **auto-detection** that tries to detect what type of application you're running. If it finds a `Caddyfile`, it will try to run Caddy instead of Node.js.

## Solution

### Option 1: Remove Caddyfile (If It Exists)

If there's a `Caddyfile` in your repository:

1. **Delete it** (or move it out of the repo)
2. **Commit and push:**
   ```bash
   git rm Caddyfile  # or caddyfile
   git commit -m "Remove Caddyfile - using Node.js backend"
   git push origin main
   ```

### Option 2: Configure Railway to Use Node.js

**Go to Railway Dashboard:**

1. Click on your **backend service**
2. Go to **Settings** tab
3. Scroll to **"Build & Deploy"** section
4. Check these settings:

#### Root Directory
- Should be: `backend`
- This tells Railway where your Node.js app is

#### Start Command
- Should be: `npm start`
- OR: `node src/server.js`
- This explicitly tells Railway to run Node.js

#### Build Command
- Should be: `npm install`
- This installs dependencies before starting

#### Nixpacks Configuration (If Available)
- If you see "Nixpacks" settings, make sure it's set to detect **Node.js**, not Caddy

### Option 3: Create railway.json (Explicit Configuration)

Create a file `backend/railway.json` to explicitly tell Railway to use Node.js:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Then commit and push:
```bash
git add backend/railway.json
git commit -m "Explicitly configure Railway to use Node.js"
git push origin main
```

### Option 4: Check Service Type in Railway

1. Go to Railway Dashboard
2. Click on your service
3. Check the **service type** - it might say "Caddy" or "Web Service"
4. If it says "Caddy", you may need to:
   - Delete the service
   - Create a new service
   - Connect it to your GitHub repo
   - Set Root Directory to `backend`
   - Railway should auto-detect Node.js

## Verify It's Working

After fixing, check Railway logs. You should see:

```
✅ Good logs (Node.js):
🚀 Starting Bloom'n Events backend...
📋 Environment: production
🔌 Port: 3000
✅ Server started successfully on port 3000
```

**NOT:**
```
❌ Bad logs (Caddy):
maxprocs: Updating GOMAXPROCS=2
using config from file
server running
```

## Quick Checklist

- [ ] No `Caddyfile` in repository (or in `backend/` folder)
- [ ] Railway Root Directory = `backend`
- [ ] Railway Start Command = `npm start`
- [ ] Railway Build Command = `npm install`
- [ ] Service type in Railway = "Web Service" or "Node.js" (not "Caddy")
- [ ] Redeploy after making changes

## Still Not Working?

If Railway is still running Caddy:

1. **Delete the Railway service**
2. **Create a new service**
3. **Connect to GitHub repo**
4. **Set Root Directory to `backend`**
5. **Railway should auto-detect Node.js**

Or manually set:
- **Start Command:** `npm start`
- **Build Command:** `npm install`

This will force Railway to use Node.js instead of Caddy.

