# Complete Railway Setup Guide - From Scratch

## Step-by-Step Instructions

### Step 1: Create New Railway Service

1. **Go to Railway Dashboard**
   - Visit: https://railway.app
   - Log in to your account

2. **Create New Project (if needed)**
   - Click **"+ New Project"** (top right)
   - Select **"Deploy from GitHub repo"**
   - OR click **"+ New"** in an existing project

3. **Connect GitHub Repository**
   - Select your repository: `AntondeLange/Bloom-n-Events-Co-Website`
   - Click **"Deploy Now"**

4. **Railway will create a new service**
   - Wait for it to initialize
   - You'll see a new service in your project

---

### Step 2: Configure Service Settings

1. **Click on the new service** (it might be named after your repo)

2. **Go to Settings Tab**
   - Click **"Settings"** at the top

3. **Update Service Configuration**

   Scroll to **"Build & Deploy"** section:

   #### Service Name (Optional)
   - Change to: `bloomn-events-backend` (or any name you prefer)
   - This is just for organization

   #### Root Directory ⚠️ CRITICAL
   - **Set to:** `backend`
   - This tells Railway where your Node.js app is located
   - **This is the most important setting!**

   #### Start Command
   - **Set to:** `npm start`
   - This runs `node src/server.js` (from package.json)

   #### Build Command
   - **Leave EMPTY** or remove it
   - Railway will auto-detect and use `npm install` from `package.json`
   - The `nixpacks.toml` file will ensure Node.js is installed first

4. **Save Changes**
   - Railway will automatically start deploying when you save

---

### Step 3: Set Environment Variables

1. **Go to Variables Tab**
   - Click **"Variables"** at the top

2. **Add Required Variables**

   Click **"+ New Variable"** for each:

   #### Variable 1: NODE_ENV
   - **Name:** `NODE_ENV`
   - **Value:** `production`
   - Click **"Add"**

   #### Variable 2: OPENAI_API_KEY
   - **Name:** `OPENAI_API_KEY`
   - **Value:** `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`
   - Click **"Add"**

   #### Variable 3: MONGODB_URI
   - **Name:** `MONGODB_URI`
   - **Value:** `mongodb+srv://bloomneventsco_db_user:277taDl1609%24@bloomnevents.aglivok.mongodb.net/bloomneventsco?retryWrites=true&w=majority`
   - **Note:** The `%24` is URL-encoded `$` for the password
   - Click **"Add"**

   #### Variable 4: FRONTEND_URL (Optional but Recommended)
   - **Name:** `FRONTEND_URL`
   - **Value:** `https://www.bloomneventsco.com.au`
   - Click **"Add"**

3. **Verify All Variables**
   - You should see 4 variables listed:
     - `NODE_ENV`
     - `OPENAI_API_KEY`
     - `MONGODB_URI`
     - `FRONTEND_URL`

---

### Step 4: Wait for Deployment

1. **Go to Deployments Tab**
   - Click **"Deployments"** at the top
   - You'll see a deployment in progress

2. **Monitor Build Progress**
   - Click on the latest deployment
   - Check **"Build Logs"** tab
   - You should see:
     ```
     Installing Node.js 20...
     Running npm install...
     npm install completed successfully
     ```

3. **Check Runtime Logs**
   - After build completes, check **"Logs"** tab (not Build Logs)
   - You should see:
     ```
     🚀 Starting Bloom'n Events backend...
     📋 Environment: production
     🔌 Port: 3000
     ✅ Server started successfully on port 3000
     ```

4. **Wait 2-3 minutes** for deployment to complete

---

### Step 5: Get Your Railway URL

1. **Go to Settings Tab**
   - Scroll to **"Domains"** section

2. **Copy the Railway URL**
   - You'll see a URL like: `https://bloom-n-events-co-website-production.up.railway.app`
   - Copy this URL
   - This is your backend API URL

3. **Verify It's Working**
   - Open the URL in a browser: `https://your-railway-url.up.railway.app/health`
   - Should return: `{"status":"ok","service":"bloomn-events-chatbot"}`

---

### Step 6: Update Frontend Configuration (If Needed)

1. **Check `scripts/config.js`**
   - Verify `PROD_URL` matches your Railway URL
   - It should be: `https://your-railway-url.up.railway.app`

2. **If URL Changed:**
   - Update `scripts/config.js`:
     ```javascript
     PROD_URL: 'https://your-new-railway-url.up.railway.app',
     ```
   - Commit and push to GitHub
   - GitHub Pages will auto-update

---

### Step 7: Test Everything

1. **Test Health Endpoint**
   ```bash
   curl https://your-railway-url.up.railway.app/health
   ```
   Should return: `{"status":"ok","service":"bloomn-events-chatbot"}`

2. **Test Contact Form**
   - Go to: https://www.bloomneventsco.com.au/contact.html
   - Fill out the form
   - Submit
   - Should see success message (not CORS error)

3. **Test Chatbot**
   - Go to: https://www.bloomneventsco.com.au
   - Click chatbot button
   - Send a message
   - Should get AI response

---

## Configuration Checklist

Before testing, verify:

- [ ] **Root Directory** = `backend` (in Railway Settings)
- [ ] **Start Command** = `npm start` (in Railway Settings)
- [ ] **Build Command** = empty (in Railway Settings)
- [ ] **NODE_ENV** = `production` (in Railway Variables)
- [ ] **OPENAI_API_KEY** = set (in Railway Variables)
- [ ] **MONGODB_URI** = set (in Railway Variables)
- [ ] **FRONTEND_URL** = `https://www.bloomneventsco.com.au` (in Railway Variables)
- [ ] **Build Logs** show Node.js installed successfully
- [ ] **Runtime Logs** show "Server started successfully"
- [ ] **Health endpoint** returns `{"status":"ok"}`

---

## Troubleshooting

### Issue: "npm: not found" in Build Logs

**Fix:**
- Verify **Root Directory** = `backend`
- Check that `backend/nixpacks.toml` exists in your repo
- Check that `backend/package.json` exists

### Issue: "502 Bad Gateway"

**Fix:**
- Check **Runtime Logs** (not Build Logs)
- Look for error messages
- Verify all environment variables are set
- Check that server started successfully

### Issue: CORS Error

**Fix:**
- Verify `FRONTEND_URL` is set in Railway Variables
- Check that `https://www.bloomneventsco.com.au` is in allowed origins
- Check Railway logs for CORS warnings

### Issue: "MongoDB connection failed"

**Fix:**
- Verify `MONGODB_URI` is correct in Railway Variables
- Check MongoDB Atlas Network Access allows Railway IPs
- Server will still start, but contact form won't work

### Issue: "Chat not working"

**Fix:**
- Verify `OPENAI_API_KEY` is set in Railway Variables
- Check Railway logs for API key errors
- Server will still start, but chat won't work

---

## Quick Reference: Railway Dashboard Navigation

```
Railway Dashboard
  └── Your Project
      └── Your Service (bloomn-events-backend)
          ├── Deployments (check build status & logs)
          ├── Logs (check runtime logs)
          ├── Variables (set environment variables) ⚠️ IMPORTANT
          ├── Settings (configure service) ⚠️ IMPORTANT
          │   ├── Root Directory = backend
          │   ├── Start Command = npm start
          │   └── Build Command = empty
          └── Metrics (monitor performance)
```

---

## Important Files in Your Repo

These files help Railway work correctly:

- ✅ `backend/package.json` - Tells Railway it's a Node.js app
- ✅ `backend/nixpacks.toml` - Forces Node.js 20 installation
- ✅ `backend/.node-version` - Specifies Node.js version
- ✅ `backend/railway.json` - Railway configuration
- ✅ `backend/src/server.js` - Your Express server

---

## After Setup

Once everything is working:

1. ✅ Health endpoint returns 200
2. ✅ Contact form works on live site
3. ✅ Chatbot works on live site
4. ✅ No CORS errors
5. ✅ No 502 errors

**You're all set!** 🎉

---

## Need Help?

If something isn't working:

1. **Check Railway Logs** - This will tell you exactly what's wrong
2. **Verify Settings** - Root Directory and Start Command are critical
3. **Check Variables** - All environment variables must be set
4. **Check Build Logs** - Make sure Node.js installed successfully

Share the error messages from Railway logs if you need help!

