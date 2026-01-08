# MongoDB Atlas IP Whitelist Fix

## Error

```
❌ MongoDB connection error: Could not connect to any servers in your MongoDB Atlas cluster. 
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

## Problem

MongoDB Atlas requires IP addresses to be whitelisted for security. Railway's servers have dynamic IPs, so you need to allow all IPs (or Railway's specific IP ranges).

## Solution: Whitelist All IPs (Recommended for Railway)

Since Railway uses dynamic IPs that change, the easiest solution is to allow all IPs:

### Step 1: Go to MongoDB Atlas

1. **Log in to MongoDB Atlas**: https://cloud.mongodb.com/
2. **Select your cluster** (bloomnevents.aglivok.mongodb.net)
3. **Click "Network Access"** in the left sidebar

### Step 2: Add IP Address

1. **Click "Add IP Address"** button
2. **Click "Allow Access from Anywhere"** button (or manually enter `0.0.0.0/0`)
3. **Click "Confirm"**
4. **Wait 1-2 minutes** for the change to propagate

### Step 3: Verify Connection

After whitelisting, Railway should automatically reconnect. Check Railway logs to confirm:

```
✅ MongoDB connected successfully
```

## Alternative: Whitelist Specific Railway IPs (More Secure)

If you want to be more restrictive:

1. **Get Railway's IP addresses** from Railway logs or support
2. **Add each IP** to MongoDB Atlas Network Access
3. **Note**: Railway IPs can change, so this may require updates

## Security Note

Allowing `0.0.0.0/0` means any IP can attempt to connect. However:
- ✅ Your MongoDB connection string still requires authentication (username/password)
- ✅ Your database user has limited permissions
- ✅ This is standard practice for cloud deployments

## After Whitelisting

1. **Railway will auto-reconnect** (no redeploy needed)
2. **Check Railway logs** for: `✅ MongoDB connected successfully`
3. **Test contact form** on your live site

## Quick Checklist

- [ ] Logged into MongoDB Atlas
- [ ] Went to Network Access
- [ ] Added `0.0.0.0/0` (Allow from anywhere)
- [ ] Confirmed the change
- [ ] Waited 1-2 minutes
- [ ] Checked Railway logs for successful connection

