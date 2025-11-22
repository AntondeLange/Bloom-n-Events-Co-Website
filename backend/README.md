# Bloom'n Events Co - Chatbot Backend

Backend proxy server for secure OpenAI API integration.

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the `backend` directory:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   FRONTEND_URL=http://localhost:8080
   NODE_ENV=development
   ```

3. **Start the server:**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

## API Endpoints

- `POST /api/chat` - Chat endpoint for OpenAI integration
  - Body: `{ "message": "user message", "conversationHistory": [...] }`
  - Response: `{ "reply": "AI response", "model": "gpt-3.5-turbo" }`

- `GET /health` - Health check endpoint
  - Response: `{ "status": "ok", "service": "bloomn-events-chatbot" }`

## Deployment

### For Vercel:
The backend can be deployed as Vercel serverless functions. Update `scripts/config.js` to use the production API URL.

### For Railway/Heroku:
1. Set environment variables in your hosting platform
2. Update `FRONTEND_URL` to your production frontend URL
3. Deploy the backend
4. Update frontend `scripts/config.js` with your backend URL

## Troubleshooting

1. **Backend not responding:**
   - Check if server is running: `lsof -ti:3000`
   - Check backend logs for errors
   - Verify `.env` file exists and has `OPENAI_API_KEY`

2. **CORS errors:**
   - Update `FRONTEND_URL` in `.env` to match your frontend URL
   - In production, ensure CORS is configured correctly

3. **OpenAI API errors:**
   - Verify API key is correct and active
   - Check rate limits on your OpenAI account
   - Review backend logs for specific error messages
