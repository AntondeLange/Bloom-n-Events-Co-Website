# Backend Setup Instructions

## Quick Start

The chatbot needs the backend server running to integrate with ChatGPT. Here's how to set it up:

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Verify Environment Variables

The `.env` file should already exist with your OpenAI API key. Verify it's there:

```bash
cat backend/.env
```

You should see:
```
OPENAI_API_KEY=sk-svcacct-...
PORT=3000
FRONTEND_URL=http://localhost:8080
```

### 3. Start the Backend Server

In a terminal, run:

```bash
cd backend
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

You should see:
```
🚀 Bloom'n Events chatbot backend listening on http://localhost:3000
📡 API endpoint: http://localhost:3000/api/chat
✅ Health check: http://localhost:3000/health
```

### 4. Test the Connection

Open your website in the browser. The chatbot should now connect to ChatGPT via the backend.

**Note:** If you're testing locally:
- Frontend should be running on `http://localhost` (or your local dev server)
- Backend should be running on `http://localhost:3000`
- The frontend will automatically detect `localhost` and use the local backend

## Production Deployment

### For Vercel:

1. **Deploy backend as serverless functions:**
   - Create `vercel.json` in the backend directory
   - Configure serverless function routes
   - Deploy backend separately or as part of your monorepo

2. **Update frontend config:**
   - The frontend already uses relative paths (`/api/chat`) for production
   - Ensure your Vercel deployment serves the backend at `/api/*`

### Alternative: Deploy backend separately (Railway, Heroku, etc.)

1. Deploy backend to your hosting platform
2. Update `scripts/config.js`:
   ```javascript
   PROD_URL: 'https://your-backend-domain.com',
   ```

## Troubleshooting

**Issue: Chatbot falls back to rule-based responses**
- **Solution:** Backend server is not running or not accessible
  - Check if backend is running: `lsof -ti:3000`
  - Check browser console for errors
  - Verify backend is accessible at the configured URL

**Issue: CORS errors in browser console**
- **Solution:** Update `FRONTEND_URL` in `backend/.env` to match your frontend URL

**Issue: "API request failed" errors**
- **Solution:** 
  - Verify backend is running
  - Check backend logs for errors
  - Verify `OPENAI_API_KEY` is set correctly in `.env`

## Testing

To test if the backend is working:

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test chat endpoint (replace with your actual message)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","conversationHistory":[]}'
```

If you see JSON responses, the backend is working correctly!


