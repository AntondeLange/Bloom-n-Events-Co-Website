# Quick Backend Deployment Guide

## ⚡ Fastest Way: Railway (5 minutes)

### Step 1: Deploy Backend

1. Go to https://railway.app
2. Sign up/login with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select: `AntondeLange/Bloom-n-Events-Co-Website`
5. Railway will detect your backend folder
6. Click **"Add Environment Variables"** and add:
   ```
   OPENAI_API_KEY=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
   MONGODB_URI=mongodb+srv://bloomneventsco_db_user:277taDl1609%24@bloomnevents.aglivok.mongodb.net/bloomneventsco?retryWrites=true&w=majority
   NODE_ENV=production
   FRONTEND_URL=https://antondelange.github.io
   ```
7. Railway will auto-deploy
8. Copy the **deployed URL** (e.g., `https://bloomn-events-backend.railway.app`)

### Step 2: Update Frontend Config

1. Edit `scripts/config.js`
2. Find line with `PROD_URL: 'https://YOUR-BACKEND-URL.railway.app'`
3. Replace with your Railway URL:
   ```javascript
   PROD_URL: 'https://bloomn-events-backend.railway.app', // Your Railway URL
   ```

### Step 3: Deploy Frontend

1. Commit and push to GitHub:
   ```bash
   git add scripts/config.js
   git commit -m "Configure production backend URL"
   git push origin main
   ```

2. GitHub Pages will auto-deploy

### Step 4: Test

1. Visit: https://antondelange.github.io/Bloom-n-Events-Co-Website/contact.html
2. Submit the contact form
3. Check Railway logs to see the submission

**Done! 🎉**

## Alternative: Render.com

1. Go to https://render.com
2. Sign up/login
3. New → Web Service
4. Connect GitHub repo
5. Settings:
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
6. Add environment variables (same as above)
7. Deploy and copy URL
8. Update `scripts/config.js` with Render URL

## Need Help?

See `PRODUCTION_BACKEND_SETUP.md` for detailed instructions.

