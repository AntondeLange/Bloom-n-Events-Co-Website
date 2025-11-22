# How to Start the Backend Server

The chatbot needs the backend server running to connect to ChatGPT. Here's how to set it up:

## Step 1: Install Node.js (if not already installed)

If you don't have Node.js installed:
1. Download from: https://nodejs.org/
2. Install the LTS version
3. Verify installation: `node --version` and `npm --version`

## Step 2: Install Backend Dependencies

Open a terminal and run:

```bash
cd "/Users/antondelange/Desktop/ICT50220 Diploma of Information Technology/Projects/Bloom'n Events Co - Project - Anton/Bloom'n Events Co - Project/backend"
npm install
```

This will install:
- express
- openai
- dotenv
- cors
- helmet
- express-rate-limit
- zod
- compression

## Step 3: Start the Backend Server

In the same terminal, run:

```bash
npm start
```

You should see:
```
🚀 Bloom'n Events chatbot backend listening on http://localhost:3000
📡 API endpoint: http://localhost:3000/api/chat
✅ Health check: http://localhost:3000/health
🔒 Environment: development
```

## Step 4: Keep the Server Running

**IMPORTANT:** Keep this terminal window open while testing the chatbot. The server must be running for the chatbot to work.

## Testing

1. Open your website in a browser
2. Open the chatbot
3. Send a message - it should now use ChatGPT via the backend!

## Troubleshooting

**"Cannot connect to backend" error:**
- Make sure the backend server is running
- Check that it's running on port 3000
- Verify the `.env` file exists with your API key

**"Module not found" errors:**
- Run `npm install` again in the backend directory
- Make sure you're in the `backend` directory when running npm commands

## For Production Deployment

Once deployed to Vercel or another platform, the backend should start automatically. You won't need to manually start it.

---

**Current Status:** The backend code is ready, but the server needs to be started manually for local testing.


