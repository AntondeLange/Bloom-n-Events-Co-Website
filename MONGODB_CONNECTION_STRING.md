# MongoDB Connection String Setup

## Your Credentials
- **Username:** `bloomneventsco_db_user`
- **Password:** `277taDl1609$`

## Step 1: Get Your Cluster Connection String

You need to get your cluster hostname from MongoDB Atlas:

1. **Log in to MongoDB Atlas:** https://cloud.mongodb.com
2. **Go to your cluster** (click "Database" in the left sidebar)
3. **Click "Connect"** on your cluster
4. **Choose "Connect your application"**
5. **Copy the connection string** - it will look like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Note your cluster hostname** (the part after `@` and before `/?`):
   - Example: `cluster0.xxxxx.mongodb.net`

## Step 2: Construct Your Connection String

Replace the placeholders in this format:

```
mongodb+srv://bloomneventsco_db_user:277taDl1609$@<YOUR_CLUSTER_HOSTNAME>/bloomneventsco?retryWrites=true&w=majority
```

**Important:** 
- Replace `<YOUR_CLUSTER_HOSTNAME>` with your actual cluster hostname
- The password `277taDl1609$` contains special characters - they need to be URL-encoded in the connection string
- The database name is `bloomneventsco` (you can change this if needed)

## Step 3: URL-Encode Special Characters in Password

Your password `277taDl1609$` contains a `$` which needs to be encoded as `%24` in the URL.

**URL-encoded password:** `277taDl1609%24`

So your connection string should be:
```
mongodb+srv://bloomneventsco_db_user:277taDl1609%24@<YOUR_CLUSTER_HOSTNAME>/bloomneventsco?retryWrites=true&w=majority
```

## Step 4: Add to .env File

Once you have your cluster hostname, add this to `backend/.env`:

```
MONGODB_URI=mongodb+srv://bloomneventsco_db_user:277taDl1609%24@<YOUR_CLUSTER_HOSTNAME>/bloomneventsco?retryWrites=true&w=majority
```

Replace `<YOUR_CLUSTER_HOSTNAME>` with your actual cluster hostname.

## Quick Reference: Special Character Encoding

- `$` → `%24`
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`
- `?` → `%3F`
- `/` → `%2F`
- `:` → `%3A`

## Example (Replace with your actual cluster hostname)

```
MONGODB_URI=mongodb+srv://bloomneventsco_db_user:277taDl1609%24@cluster0.abc123.mongodb.net/bloomneventsco?retryWrites=true&w=majority
```

## After Adding the Connection String

1. Save the `.env` file
2. Restart the backend server:
   ```bash
   cd backend
   npm start
   ```
3. You should see: `✅ Connected to MongoDB`

