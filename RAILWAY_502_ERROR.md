# Railway 502 Error - Backend Not Responding

## Error

The Railway backend is returning:
```json
{"status":"error","code":502,"message":"Application failed to respond"}
```

This means the backend application isn't running or crashed.

## Common Causes

### 1. Environment Variables Missing

Railway needs these environment variables set:

- ✅ `OPENAI_API_KEY` - Your OpenAI API key
- ✅ `MONGODB_URI` - Your MongoDB connection string
- ✅ `NODE_ENV` - Set to `production`
- ✅ `FRONTEND_URL` - Set to `https://www.bloomneventsco.com.au` (optional but recommended)

**How to check:**
1. Go to Railway dashboard
2. Click on your service
3. Go to "Variables" tab
4. Verify all variables are set

### 2. Backend Not Deployed

**How to check:**
1. Go to Railway dashboard
2. Check "Deployments" tab
3. Look for latest deployment status
4. If it says "Failed" or "Building", there's an issue

### 3. Backend Crashed on Startup

**How to check:**
1. Go to Railway dashboard
2. Click on your service
3. Go to "Logs" tab
4. Look for error messages

Common errors:
- `MONGODB_URI is not defined` - Missing MongoDB connection string
- `OPENAI_API_KEY is required` - Missing OpenAI API key
- `Cannot connect to MongoDB` - MongoDB connection failed
- `Port already in use` - Port conflict (unlikely on Railway)

### 4. Wrong Start Command

Railway needs to know how to start your backend.

**Check Railway settings:**
1. Go to Railway dashboard
2. Click on your service
3. Go to "Settings" tab
4. Check "Start Command"

Should be:
```bash
cd backend && npm start
```

Or if Railway detects it automatically:
```bash
npm start
```

But make sure it's running from the `backend` directory.

## Quick Fix Steps

### Step 1: Check Railway Logs

1. Go to Railway dashboard
2. Click on your service
3. Click "Logs" tab
4. Look for error messages
5. Share the errors if you need help

### Step 2: Verify Environment Variables

1. Go to Railway dashboard
2. Click on your service
3. Go to "Variables" tab
4. Add/verify these variables:

```
OPENAI_API_KEY=sk-svcacct-... (your key)
MONGODB_URI=mongodb+srv://bloomneventsco_db_user:277taDl1609%24@bloomnevents.aglivok.mongodb.net/bloomneventsco?retryWrites=true&w=majority
NODE_ENV=production
FRONTEND_URL=https://www.bloomneventsco.com.au
```

### Step 3: Check Deployment

1. Go to Railway dashboard
2. Click on your service
3. Go to "Deployments" tab
4. Check if latest deployment succeeded
5. If it failed, click on it to see error details

### Step 4: Redeploy

If environment variables were missing:

1. Add the variables
2. Railway will auto-redeploy
3. Wait 1-2 minutes
4. Check logs again

Or manually trigger redeploy:
1. Go to "Deployments" tab
2. Click "Redeploy" on latest deployment

## Verify Backend is Working

After fixing, test:

```bash
curl https://bloom-n-events-co-website-production.up.railway.app/health
```

Should return:
```json
{"status":"ok","service":"bloomn-events-chatbot"}
```

If you still get 502, check Railway logs for the specific error.

## Railway Project Structure

Make sure Railway knows where your backend is:

**Option 1: Root Detection**
- Railway should auto-detect `backend/package.json`
- If not, you may need to configure it

**Option 2: Manual Configuration**
- In Railway settings, set:
  - **Root Directory:** `backend`
  - **Start Command:** `npm start`

## Still Having Issues?

1. Check Railway logs (most important!)
2. Verify all environment variables are set
3. Make sure `backend/package.json` exists
4. Check that `backend/src/server.js` is the entry point
5. Verify MongoDB connection string is correct
6. Check MongoDB Atlas network access allows Railway IPs

Share the Railway logs if you need help debugging!

