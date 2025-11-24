# Railway "npm: not found" Error - Fix Guide

## Problem

Railway is trying to run `npm install` but Node.js is not installed in the build environment. This means Railway is not detecting your Node.js application properly.

## Error Message

```
sh: 1: npm: not found
ERROR: failed to build: failed to solve: process "sh -c npm install" did not complete successfully: exit code: 127
```

## Solution

I've added configuration files to explicitly tell Railway to use Node.js:

1. ✅ **`nixpacks.toml`** - Explicitly tells Nixpacks (Railway's builder) to install Node.js 20
2. ✅ **`.node-version`** - Specifies Node.js version for Railway to use
3. ✅ **Updated `railway.json`** - Removed explicit buildCommand (let Nixpacks handle it)

## What You Need to Do

### Step 1: Verify Files Are Pushed

The configuration files are now in your repo. Make sure they're pushed:

```bash
git status
git add backend/nixpacks.toml backend/.node-version backend/railway.json
git commit -m "Add explicit Node.js configuration for Railway"
git push origin main
```

### Step 2: Update Railway Settings

**Go to Railway Dashboard:**

1. Click your project → backend service
2. Go to **Settings** tab
3. Scroll to **"Build & Deploy"**

**Update these settings:**

#### Root Directory
- **Must be:** `backend`
- This is critical - Railway needs to find `package.json` in the `backend/` folder

#### Start Command
- **Set to:** `npm start`
- OR leave empty (Railway will use `railway.json`)

#### Build Command
- **Leave EMPTY** or remove it
- Nixpacks will auto-detect and use `npm install` from `package.json`
- The `nixpacks.toml` file will ensure Node.js is installed first

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. OR wait for auto-redeploy (if connected to GitHub)
4. Wait 2-3 minutes

### Step 4: Check Build Logs

After redeploy, check the **Build Logs** (not Runtime Logs):

**Go to:** Deployments → Click latest deployment → **Build Logs**

**You should see:**
```
✅ Good:
Installing Node.js 20...
Running npm install...
npm install completed successfully
```

**NOT:**
```
❌ Bad:
sh: 1: npm: not found
```

## Alternative: Manual Railway Configuration

If the files don't work, manually configure in Railway:

### Option 1: Use Dockerfile (Most Reliable)

Create `backend/Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

Then in Railway Settings:
- **Build Command:** Leave empty
- **Start Command:** Leave empty
- Railway will auto-detect Dockerfile

### Option 2: Force Nixpacks Node.js Detection

In Railway Settings:
- **Root Directory:** `backend`
- **Build Command:** Remove it (leave empty)
- **Start Command:** `npm start`

Railway should auto-detect Node.js from `package.json` in the `backend/` folder.

## Why This Happens

Railway uses **Nixpacks** to auto-detect your application type. If it doesn't find `package.json` in the root directory, it won't install Node.js.

**Common causes:**
1. Root Directory not set to `backend`
2. `package.json` not in the root directory Railway is looking at
3. Nixpacks not detecting Node.js application

## Verify Configuration

After fixing, the build logs should show:

```
[1/4] Installing Node.js 20...
[2/4] Installing dependencies...
[3/4] Building application...
[4/4] Starting application...
```

Then runtime logs should show:
```
🚀 Starting Bloom'n Events backend...
✅ Server started successfully on port 3000
```

## Still Not Working?

If Railway still can't find npm:

1. **Check Root Directory:**
   - Must be exactly `backend` (not `/backend` or `./backend`)
   - Railway looks for `package.json` in this directory

2. **Check package.json exists:**
   - Verify `backend/package.json` exists in your repo
   - Check it's committed to Git

3. **Try Dockerfile method:**
   - Create `backend/Dockerfile` (see above)
   - Railway will use Docker instead of Nixpacks
   - More reliable but slower builds

4. **Check Railway Service Type:**
   - Should be "Web Service"
   - Not "Static Site" or "Caddy"

## Quick Checklist

- [ ] `backend/nixpacks.toml` exists and specifies Node.js 20
- [ ] `backend/.node-version` exists with "20"
- [ ] `backend/package.json` exists
- [ ] Railway Root Directory = `backend`
- [ ] Railway Build Command = empty (or removed)
- [ ] Railway Start Command = `npm start`
- [ ] Files are committed and pushed to GitHub
- [ ] Railway service is redeployed

After these steps, Railway should successfully install Node.js and run your backend!

