# Testing the Contact Form - Troubleshooting 405 Error

## Important: How to Access the Contact Page

The contact page **MUST** be accessed through a web server, NOT by opening the HTML file directly (file://).

### Option 1: Use Python Simple HTTP Server (Recommended for Testing)

1. **Open a terminal** in the project root directory
2. **Run this command:**
   ```bash
   python3 -m http.server 8080
   ```
   (or `python -m http.server 8080` on Windows)

3. **Open your browser** and go to:
   ```
   http://localhost:8080/contact.html
   ```

### Option 2: Use Node.js HTTP Server

```bash
npx http-server -p 8080
```

Then open: `http://localhost:8080/contact.html`

### Option 3: Use VS Code Live Server

If you're using VS Code:
1. Install "Live Server" extension
2. Right-click on `contact.html`
3. Select "Open with Live Server"

## Verify Backend is Running

Before testing the form, make sure the backend server is running:

```bash
cd backend
npm start
```

You should see:
```
🚀 Bloom'n Events backend listening on http://localhost:3000
📡 Chat API: http://localhost:3000/api/chat
📧 Contact API: http://localhost:3000/api/contact
✅ Health check: http://localhost:3000/health
```

## Test the API Directly

Test if the API endpoint works:

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","message":"Hello"}'
```

You should get a success response.

## Check Browser Console

1. Open the contact page in your browser
2. Open Developer Tools (F12 or Cmd+Option+I)
3. Go to the "Console" tab
4. Submit the form
5. Look for any errors in red

The errors will show:
- The actual URL being called
- The error message
- Whether it's a CORS, network, or server error

## Common Issues

### 405 Error Still Happening?

**Possible causes:**
1. **Opening file directly** - Don't use `file:///path/to/contact.html`, use `http://localhost:8080/contact.html`
2. **Backend not running** - Make sure backend server is running on port 3000
3. **Wrong URL** - Check browser console to see what URL is being called
4. **Form action** - The form should NOT have an `action` attribute (it's handled by JavaScript)

### CORS Errors?

- Make sure you're accessing the page via `http://localhost` not `file://`
- Check that backend CORS settings allow your frontend URL

### Connection Refused?

- Backend server is not running
- Start it: `cd backend && npm start`

## What URL Should Be Called?

The form should call:
- **Development:** `http://localhost:3000/api/contact`
- **Production:** `/api/contact` (relative path)

Check the browser Network tab (in DevTools) to see the actual request being made.

## Still Having Issues?

1. Open browser Developer Tools (F12)
2. Go to "Network" tab
3. Submit the form
4. Look at the request to `/api/contact`
5. Check:
   - Request Method (should be POST)
   - Request URL (should be `http://localhost:3000/api/contact`)
   - Response Status (should be 201 or 200)
   - Response Body (should be JSON with success: true)

Share the Network tab details if you're still getting errors!

