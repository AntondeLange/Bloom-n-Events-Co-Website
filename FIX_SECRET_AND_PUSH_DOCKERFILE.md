# Fix Secret Issue and Push Dockerfile

## The Problem

GitHub is blocking pushes because commit `d8e6550` contains an API key in `RAILWAY_COMPLETE_SETUP.md`. The Dockerfile can't be pushed until this is resolved.

## Solution: Remove Secret from History

### Step 1: Remove the Secret from the File

1. **Edit the file:**
   ```bash
   # The file is already fixed locally, but the old commit has the secret
   ```

2. **The file `RAILWAY_COMPLETE_SETUP.md` already has the placeholder** - that's good!

### Step 2: Fix the Commit History

You have two options:

#### Option A: Allow the Secret (Quickest)

1. **Visit this URL:**
   ```
   https://github.com/AntondeLange/Bloom-n-Events-Co-Website/security/secret-scanning/unblock-secret/35uHuxPxSE5AmKtgkrqvsulSJCL
   ```

2. **Click "Allow" or "Authorize"**

3. **Then push:**
   ```bash
   git push origin main
   ```

#### Option B: Remove Secret from History (More Secure)

1. **Use git filter-branch or BFG to remove the secret:**
   ```bash
   # This is complex - Option A is easier
   ```

## Quick Fix: Push Dockerfile Only

If you just want to get the Dockerfile pushed:

1. **Create a new branch:**
   ```bash
   git checkout -b fix-dockerfile
   ```

2. **Add only the Dockerfile:**
   ```bash
   git add Dockerfile backend/Dockerfile
   git commit -m "Add Dockerfile for Railway"
   git push origin fix-dockerfile
   ```

3. **Then merge to main** (might still hit the secret issue)

## Recommended: Use Railway's File Editor

Since we can't push right now, **create the Dockerfile directly in Railway:**

1. **Go to Railway Dashboard**
2. **Click your service**
3. **Look for "Files" or "Code" or "Source" tab**
4. **Create new file: `Dockerfile`** (in root) with this content:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./

RUN npm install

COPY backend/ ./

EXPOSE 3000

CMD ["npm", "start"]
```

5. **Save and Railway will auto-deploy**

## Or: Use Railway's Environment

Since Railway connects to GitHub, once you allow the secret push, it will automatically pull the Dockerfile.

**Easiest path:**
1. Visit the GitHub URL above
2. Allow the secret
3. Run `git push origin main`
4. Railway will auto-detect the Dockerfile


