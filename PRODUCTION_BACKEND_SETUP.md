# Production Backend Setup Guide

## Problem

Your website is hosted on **GitHub Pages** (`https://antondelange.github.io/Bloom-n-Events-Co-Website/`), which only serves static files. The contact form needs a backend API to function, but GitHub Pages doesn't support backend servers.

## Solution

You need to deploy your backend to a separate hosting service and configure the frontend to point to it.

## Quick Options

### Option 1: Railway (Recommended - Easiest)

**Why Railway:**
- Free tier available
- Easy deployment from GitHub
- Automatic HTTPS
- Simple environment variable setup

**Steps:**

1. **Sign up:** https://railway.app
2. **Create new project** from GitHub repository
3. **Add your backend folder** or create a new service
4. **Set environment variables:**
   - `OPENAI_API_KEY`
   - `MONGODB_URI`
   - `NODE_ENV=production`
   - `PORT` (Railway sets this automatically)
   - `FRONTEND_URL=https://antondelange.github.io`
5. **Deploy** - Railway will give you a URL like: `https://your-app.railway.app`
6. **Update frontend config:**
   - Edit `scripts/config.js`
   - Replace `PROD_URL: 'https://YOUR-BACKEND-URL.railway.app'` with your Railway URL

### Option 2: Render

**Steps:**

1. **Sign up:** https://render.com
2. **Create new Web Service**
3. **Connect GitHub repository**
4. **Configure:**
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Environment: `Node`
5. **Set environment variables** (same as Railway)
6. **Deploy** and get URL
7. **Update frontend config** with Render URL

### Option 3: Vercel Serverless Functions

**Steps:**

1. **Install Vercel CLI:** `npm i -g vercel`
2. **Create `vercel.json` in backend folder:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "src/server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "src/server.js"
       }
     ]
   }
   ```
3. **Deploy:** `cd backend && vercel`
4. **Set environment variables** in Vercel dashboard
5. **Update frontend config** with Vercel URL

### Option 4: Heroku

**Steps:**

1. **Install Heroku CLI**
2. **Login:** `heroku login`
3. **Create app:** `cd backend && heroku create your-app-name`
4. **Set environment variables:**
   ```bash
   heroku config:set OPENAI_API_KEY=your-key
   heroku config:set MONGODB_URI=your-uri
   heroku config:set NODE_ENV=production
   ```
5. **Deploy:** `git push heroku main`
6. **Update frontend config** with Heroku URL

## Update Frontend Configuration

After deploying your backend, update `scripts/config.js`:

```javascript
BACKEND: {
  DEV_URL: 'http://localhost:3000',
  PROD_URL: 'https://your-backend-url.railway.app', // Replace with your actual URL
  CHAT_ENDPOINT: '/api/chat',
  CONTACT_ENDPOINT: '/api/contact',
  TIMEOUT: 30000,
},
```

## Important: CORS Configuration

Make sure your backend allows requests from your GitHub Pages domain:

In `backend/src/server.js`, update CORS:

```javascript
app.use(cors({
  origin: [
    'https://antondelange.github.io',
    'http://localhost:8080', // For local testing
    // Add your custom domain if you have one
  ],
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

Or use environment variable:

```javascript
app.use(cors({
  origin: env.FRONTEND_URL || (env.NODE_ENV === 'production' 
    ? 'https://antondelange.github.io' 
    : '*'),
  // ... rest of config
}));
```

## Testing Production

1. Deploy backend to chosen platform
2. Update `PROD_URL` in `scripts/config.js`
3. Commit and push to GitHub
4. Test the contact form on your live site
5. Check backend logs for any errors

## Environment Variables for Production

Set these in your hosting platform:

```
OPENAI_API_KEY=sk-svcacct-...
MONGODB_URI=mongodb+srv://bloomneventsco_db_user:277taDl1609%24@bloomnevents.aglivok.mongodb.net/bloomneventsco?retryWrites=true&w=majority
NODE_ENV=production
FRONTEND_URL=https://antondelange.github.io
PORT=3000 (or let the platform set it automatically)
```

## Quick Start: Railway (5 minutes)

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will detect the `backend` folder
5. Add environment variables (copy from `backend/.env`)
6. Railway will auto-deploy
7. Copy the URL (e.g., `https://bloomn-events-backend.railway.app`)
8. Update `scripts/config.js` with the Railway URL
9. Push to GitHub

**Done!** Your contact form will work on the live site.

## Troubleshooting

**Still getting 404?**
- Verify backend is deployed and running
- Check backend logs for errors
- Verify `PROD_URL` in `scripts/config.js` is correct
- Test backend URL directly: `curl https://your-backend.railway.app/health`

**CORS errors?**
- Make sure `FRONTEND_URL` environment variable includes your GitHub Pages URL
- Check CORS configuration in `backend/src/server.js`

**MongoDB connection issues?**
- Verify `MONGODB_URI` is set correctly in production
- Check MongoDB Atlas network access allows your hosting platform's IPs

