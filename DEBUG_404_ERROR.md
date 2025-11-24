# Debugging 404 Error on Contact Form

## What the Error Means

The 404 error "The page could not be found" means the browser is trying to access an API endpoint that doesn't exist.

## Quick Checks

### 1. Is the Backend Server Running?

Check if the backend server is running:

```bash
lsof -ti:3000
```

If nothing is returned, start the backend:

```bash
cd backend
npm start
```

You should see:
```
🚀 Bloom'n Events backend listening on http://localhost:3000
📡 Chat API: http://localhost:3000/api/chat
📧 Contact API: http://localhost:3000/api/contact
```

### 2. Test the API Directly

Test if the API endpoint works:

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","message":"Hello"}'
```

You should get a success response.

### 3. Check Browser Console

1. Open the contact page: `http://localhost:8080/contact.html`
2. Open Developer Tools (F12 or Cmd+Option+I)
3. Go to the "Console" tab
4. Submit the form
5. Look for the debug messages that start with:
   - `🌐 Contact Form API Debug:`
   - `📡 Response status:`
   - `📡 Response URL:`

These will show you:
- What URL the form is trying to call
- What response it's getting
- Why it's failing

### 4. Check Network Tab

1. Open Developer Tools (F12)
2. Go to the "Network" tab
3. Submit the form
4. Find the request to `/api/contact`
5. Check:
   - **Request URL** - Should be `http://localhost:3000/api/contact`
   - **Request Method** - Should be `POST`
   - **Status Code** - Should be `201` or `200` (not `404`)
   - **Response** - Should be JSON with `success: true`

## Common Issues

### Issue 1: Backend Server Not Running

**Symptom:** 404 error, connection refused

**Solution:** Start the backend server:
```bash
cd backend
npm start
```

### Issue 2: Wrong URL Being Called

**Symptom:** Form is calling `/api/contact` instead of `http://localhost:3000/api/contact`

**Solution:** Check browser console for the debug message showing the actual URL being called. If it shows a relative path (`/api/contact`), the frontend thinks it's in production mode.

**Fix:** Make sure you're accessing the page via `http://localhost:8080/contact.html`, not `file://`

### Issue 3: CORS Error

**Symptom:** Browser console shows CORS error

**Solution:** 
- Make sure backend CORS is configured (it should allow `*` in development)
- Access the page via `http://localhost`, not `file://`

### Issue 4: MongoDB Connection Failed

**Symptom:** 503 error instead of 404

**Solution:** Check that `MONGODB_URI` is set in `backend/.env` and MongoDB is accessible.

## Step-by-Step Debugging

1. **Verify backend is running:**
   ```bash
   curl http://localhost:3000/health
   ```
   Should return: `{"status":"ok","service":"bloomn-events-chatbot"}`

2. **Test API endpoint directly:**
   ```bash
   curl -X POST http://localhost:3000/api/contact \
     -H "Content-Type: application/json" \
     -d '{"firstName":"Test","lastName":"User","email":"test@example.com","message":"Hello"}'
   ```
   Should return success response.

3. **Open contact page:**
   - Start web server: `python3 -m http.server 8080`
   - Open: `http://localhost:8080/contact.html`
   - Open browser console (F12)
   - Submit form
   - Check console for debug messages

4. **Check Network tab:**
   - Open Network tab in DevTools
   - Submit form
   - Check the request to `/api/contact`
   - Verify URL, method, status, and response

## Expected Behavior

When everything is working:

1. Form submits to: `http://localhost:3000/api/contact`
2. Backend receives request
3. Backend validates data
4. Backend saves to MongoDB
5. Backend returns: `{"success":true,"message":"Thank you for your message! We will get back to you soon."}`
6. Frontend shows success message

## Still Having Issues?

Check the browser console and share:
1. The exact URL being called (from `🌐 Contact Form API Debug`)
2. The response status (from `📡 Response status`)
3. Any error messages

This will help identify the exact problem!

