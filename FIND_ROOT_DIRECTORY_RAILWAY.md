# How to Find Root Directory in Railway

## Where to Look

### Option 1: Service Settings (Most Common)

1. **Go to Railway Dashboard**
   - Click your project
   - Click your service

2. **Click "Settings" tab** (at the top)

3. **Scroll down** to find these sections:
   - **"Service"** section - might have Root Directory here
   - **"Build & Deploy"** section - might have Root Directory here
   - **"Nixpacks"** section - might have Root Directory here

4. **Look for:**
   - "Root Directory"
   - "Working Directory"
   - "Source Root"
   - "Base Directory"

### Option 2: Service Configuration (New UI)

If you don't see "Root Directory" in Settings:

1. **Go to your service**
2. **Click "Settings"**
3. **Look for "Service Configuration"** section
4. **Click "Edit"** or **"Configure"** button
5. Root Directory might be in a modal/popup

### Option 3: Nixpacks Configuration

1. **Go to Settings**
2. **Look for "Nixpacks"** or **"Build Configuration"** section
3. **Click "Edit"** or expand it
4. Root Directory might be there

### Option 4: If You Still Can't Find It

**Don't worry!** Railway might auto-detect it, OR you can set it via the `railway.json` file (which we already have).

## Alternative: Use railway.json

The `backend/railway.json` file should handle this, but if Railway isn't reading it:

1. **Check if the service is using the correct source**
   - Go to Settings → Source
   - Make sure it's connected to your GitHub repo
   - Make sure it's pointing to the `main` branch

2. **The Root Directory might be set automatically**
   - Railway might detect `package.json` in the `backend/` folder
   - Check the Build Logs to see what directory it's using

## What to Check Instead

If you can't find Root Directory, check these:

### 1. Start Command
- **Location:** Settings → Build & Deploy → Start Command
- **Should be:** `npm start`
- **OR:** `cd backend && npm start` (if Root Directory can't be set)

### 2. Build Command
- **Location:** Settings → Build & Deploy → Build Command
- **Should be:** Empty (or `cd backend && npm install`)

### 3. Service Source
- **Location:** Settings → Source
- **Should show:** Your GitHub repo
- **Branch:** Should be `main`

## Workaround: Use Commands with `cd`

If you can't set Root Directory, you can work around it:

### Start Command:
```
cd backend && npm start
```

### Build Command:
```
cd backend && npm install
```

This will change to the `backend/` directory before running commands.

## Check What Railway is Using

1. **Go to Deployments tab**
2. **Click on latest deployment**
3. **Check Build Logs**
4. **Look for:** "Working directory:" or "Building in:"
   - Should show: `/app/backend` or similar
   - If it shows `/app` (root), then Root Directory isn't set

## Screenshot Locations to Check

Railway UI can vary. Check these areas:

1. **Settings Tab:**
   - Scroll all the way down
   - Look for collapsible sections
   - Click "Advanced" or "More Options"

2. **Service Overview:**
   - Click on service name
   - Look for configuration options

3. **Deployments:**
   - Click on a deployment
   - Check "Configuration" or "Settings" in deployment view

## Quick Test

After setting up, check the Build Logs:

**Good signs:**
```
Installing Node.js 20...
Running npm install in /app/backend...
Found package.json
```

**Bad signs:**
```
npm: not found
Cannot find package.json
Building in /app (should be /app/backend)
```

## If All Else Fails

Use the workaround commands:

**In Railway Settings:**
- **Start Command:** `cd backend && npm start`
- **Build Command:** `cd backend && npm install`

This will work even without Root Directory setting!

