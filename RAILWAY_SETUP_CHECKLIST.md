# Railway Backend Setup Checklist

## ✅ Completed

- [x] Backend deployed to Railway
- [x] Railway URL: `bloom-n-events-co-website-production.up.railway.app`
- [x] Frontend config updated with Railway URL
- [x] Changes pushed to GitHub

## ⚠️ Required: Railway Environment Variables

Make sure these are set in your Railway project dashboard:

### Required Variables:

1. **OPENAI_API_KEY**
   ```
   (Your OpenAI API key - get from backend/.env or OpenAI dashboard)
   ```

2. **MONGODB_URI**
   ```
   (Your MongoDB connection string - get from backend/.env or MongoDB Atlas)
   Format: mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   ```

3. **NODE_ENV**
   ```
   production
   ```

4. **FRONTEND_URL**
   ```
   https://antondelange.github.io
   ```

5. **PORT** (usually auto-set by Railway, but verify)

## How to Set Environment Variables in Railway

1. Go to your Railway project dashboard
2. Click on your service
3. Go to **"Variables"** tab
4. Click **"New Variable"**
5. Add each variable above
6. Railway will automatically redeploy

## Verify Backend is Working

Test the backend health endpoint:

```bash
curl https://bloom-n-events-co-website-production.up.railway.app/health
```

Should return:
```json
{"status":"ok","service":"bloomn-events-chatbot"}
```

Test the contact endpoint:

```bash
curl -X POST https://bloom-n-events-co-website-production.up.railway.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","message":"Hello"}'
```

Should return:
```json
{"success":true,"message":"Thank you for your message! We will get back to you soon.",...}
```

## CORS Configuration

The backend CORS is configured to allow:
- `https://antondelange.github.io` (your GitHub Pages site)
- `https://www.bloomneventsco.com.au` (if you have a custom domain)

If you need to add more domains, update `backend/src/server.js` CORS configuration.

## MongoDB Atlas Network Access

Make sure MongoDB Atlas allows connections from Railway:

1. Go to MongoDB Atlas dashboard
2. Click **"Network Access"**
3. Add Railway's IP ranges OR click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. For production, it's safer to add specific IPs, but Railway IPs can change

## Test on Live Site

After Railway is configured:

1. Wait for GitHub Pages to deploy (usually 1-2 minutes)
2. Visit: https://antondelange.github.io/Bloom-n-Events-Co-Website/contact.html
3. Submit the contact form
4. Check Railway logs to see the submission
5. Check MongoDB Atlas to verify data was saved

## Troubleshooting

**Backend returns HTML instead of JSON:**
- Check Railway logs for errors
- Verify environment variables are set
- Make sure the backend service is running

**CORS errors in browser:**
- Verify `FRONTEND_URL` is set correctly in Railway
- Check CORS configuration in `backend/src/server.js`
- Make sure the frontend URL matches exactly (including https://)

**404 errors:**
- Verify Railway URL is correct in `scripts/config.js`
- Check Railway service is deployed and running
- Test the health endpoint directly

**MongoDB connection errors:**
- Verify `MONGODB_URI` is set correctly in Railway
- Check MongoDB Atlas network access allows Railway
- Check Railway logs for connection errors

## Next Steps

1. ✅ Set all environment variables in Railway
2. ✅ Verify backend health endpoint works
3. ✅ Test contact form on live site
4. ✅ Monitor Railway logs for any errors
5. ✅ Check MongoDB for saved submissions

Your contact form should now work on the live site! 🎉

