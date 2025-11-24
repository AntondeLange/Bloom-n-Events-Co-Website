# How to Switch Railway from Caddy to Node.js

## Quick Fix Steps

### Method 1: Update Service Settings (Recommended)

1. **Go to Railway Dashboard**
   - Visit: https://railway.app
   - Log in to your account

2. **Select Your Project**
   - Click on your project name

3. **Click on Your Backend Service**
   - Click on the service that's currently running Caddy

4. **Go to Settings Tab**
   - Click the **"Settings"** tab at the top

5. **Update Service Configuration**

   Scroll down to **"Build & Deploy"** section:

   #### Root Directory
   - **Change to:** `backend`
   - This tells Railway where your Node.js app is located
   - **Important:** Must be `backend` (not `/` or empty)

   #### Start Command
   - **Set to:** `npm start`
   - OR: `node src/server.js`
   - This explicitly tells Railway to run Node.js

   #### Build Command
   - **Set to:** `npm install`
   - This installs dependencies before starting

6. **Save Changes**
   - Railway will automatically redeploy when you save

7. **Wait for Redeploy**
   - Wait 2-3 minutes for deployment to complete
   - Check the **"Logs"** tab to verify Node.js is starting

---

### Method 2: Delete and Recreate Service (If Method 1 Doesn't Work)

If updating settings doesn't work, create a fresh service:

1. **Delete Current Service**
   - Go to Railway Dashboard → Your Project
   - Click on the Caddy service
   - Click **"Settings"** → Scroll to bottom → Click **"Delete Service"**
   - Confirm deletion

2. **Create New Service**
   - In your project, click **"+ New"** button
   - Select **"GitHub Repo"**
   - Choose your repository: `AntondeLange/Bloom-n-Events-Co-Website`
   - Click **"Deploy"**

3. **Configure New Service**
   - Railway will create a new service
   - Go to **"Settings"** tab
   - Set **Root Directory** to: `backend`
   - Set **Start Command** to: `npm start`
   - Set **Build Command** to: `npm install`

4. **Set Environment Variables**
   - Go to **"Variables"** tab
   - Add these variables:
     ```
     NODE_ENV=production
     OPENAI_API_KEY=sk-svcacct-...
     MONGODB_URI=mongodb+srv://...
     FRONTEND_URL=https://www.bloomneventsco.com.au
     ```

5. **Wait for Deployment**
   - Railway will auto-deploy
   - Check **"Logs"** tab to verify Node.js is starting

---

### Method 3: Use Railway CLI (Advanced)

If you have Railway CLI installed:

```bash
# Install Railway CLI (if not installed)
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Set service configuration
railway variables set NODE_ENV=production
railway variables set OPENAI_API_KEY=sk-svcacct-...
railway variables set MONGODB_URI=mongodb+srv://...

# Deploy
railway up
```

---

## Verify It's Working

After making changes, check the **Logs** tab. You should see:

### ✅ Good (Node.js Running):
```
🚀 Starting Bloom'n Events backend...
📋 Environment: production
🔌 Port: 3000
✅ Server started successfully on port 3000
```

### ❌ Bad (Still Caddy):
```
maxprocs: Updating GOMAXPROCS=2
using config from file
server running
```

---

## Important Settings Checklist

Make sure these are set correctly in Railway:

- [ ] **Root Directory** = `backend`
- [ ] **Start Command** = `npm start` (or `node src/server.js`)
- [ ] **Build Command** = `npm install`
- [ ] **Service Type** = "Web Service" (not "Caddy" or "Static Site")
- [ ] **Environment Variables** are set (NODE_ENV, OPENAI_API_KEY, MONGODB_URI)

---

## Why This Happens

Railway has **auto-detection** that tries to guess what type of application you're running. If it finds certain files (like a `Caddyfile`), it will try to run Caddy instead of Node.js.

**Solutions:**
1. Set **Root Directory** to `backend` - this helps Railway find your `package.json`
2. Set **Start Command** explicitly - this forces Railway to use Node.js
3. The `railway.json` file I created should help, but Railway settings override it

---

## Test After Fixing

Once Node.js is running, test the health endpoint:

```bash
curl https://bloom-n-events-co-website-production.up.railway.app/health
```

Should return:
```json
{"status":"ok","service":"bloomn-events-chatbot"}
```

Then test the contact form on your live site - the CORS error should be gone!

---

## Still Having Issues?

If Railway is still running Caddy after these steps:

1. **Check if there's a Caddyfile in your repo:**
   ```bash
   find . -name "Caddyfile" -o -name "caddyfile"
   ```
   If found, delete it or move it out of the repo.

2. **Check Railway Build Logs:**
   - Go to Deployments tab
   - Click on latest deployment
   - Check "Build Logs" - what does it show?

3. **Contact Railway Support:**
   - They can help force a specific runtime
   - Or check if there's a service-level setting preventing Node.js detection

---

## Quick Reference: Railway Dashboard Navigation

```
Railway Dashboard
  └── Your Project
      └── Your Service
          ├── Deployments (check build status)
          ├── Logs (check runtime logs)
          ├── Variables (set environment variables)
          └── Settings (configure service)
              ├── Root Directory
              ├── Start Command
              └── Build Command
```

