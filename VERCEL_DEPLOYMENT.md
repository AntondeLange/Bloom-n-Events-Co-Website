# Vercel Deployment Guide

This project uses **Vercel serverless functions** for the backend API, providing a free and scalable solution.

## 🚀 Quick Start

### 1. Deploy to Vercel

1. **Install Vercel CLI** (optional, for local testing):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

3. **Or deploy via CLI**:
   ```bash
   vercel
   ```

### 2. Configure Environment Variables

In your Vercel project dashboard, go to **Settings → Environment Variables** and add:

#### Required for Chatbot:
```
OPENAI_API_KEY=sk-your-openai-api-key-here
```

#### Required for Contact Form (Email):
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Bloom'n Events Co Website <your-email@gmail.com>"
ENQUIRIES_EMAIL=enquiries@bloomneventsco.com.au
```

#### Optional:
```
NODE_ENV=production
FRONTEND_URL=https://www.bloomneventsco.com.au
```

### 3. API Endpoints

Once deployed, your API endpoints will be available at:
- **Chat API**: `https://your-domain.vercel.app/api/chat`
- **Contact Form**: `https://your-domain.vercel.app/api/contact`
- **Health Check**: `https://your-domain.vercel.app/api/health`

## 📁 Project Structure

```
/
├── api/                    # Vercel serverless functions
│   ├── chat.js            # Chatbot endpoint
│   ├── contact.js          # Contact form endpoint
│   ├── health.js           # Health check endpoint
│   └── _utils/             # Shared utilities
│       ├── env.js          # Environment variables
│       ├── cors.js         # CORS handling
│       └── rateLimit.js    # Rate limiting
├── vercel.json             # Vercel configuration
└── package.json            # Dependencies (includes API deps)
```

## 🔧 Local Development

### Test API Functions Locally

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Run development server**:
   ```bash
   vercel dev
   ```

3. **Test endpoints**:
   - Chat: `http://localhost:3000/api/chat`
   - Contact: `http://localhost:3000/api/contact`
   - Health: `http://localhost:3000/api/health`

### Environment Variables for Local Development

Create a `.env.local` file in the project root:

```env
OPENAI_API_KEY=sk-your-key-here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Bloom'n Events Co Website <your-email@gmail.com>"
ENQUIRIES_EMAIL=enquiries@bloomneventsco.com.au
NODE_ENV=development
```

## 🆚 Vercel vs Railway

### Advantages of Vercel:
- ✅ **Free tier**: 100GB bandwidth/month, unlimited requests
- ✅ **Same domain**: API and frontend on same domain (no CORS issues)
- ✅ **Auto-scaling**: Handles traffic spikes automatically
- ✅ **Fast**: Global CDN, edge functions
- ✅ **Easy deployment**: Connect GitHub, auto-deploy on push
- ✅ **No cold starts**: Frequently used functions stay warm

### Limitations:
- ⚠️ **10-second execution limit** on free tier (sufficient for your endpoints)
- ⚠️ **In-memory rate limiting** (per-instance, not global)

## 🔄 Migration from Railway

If you were previously using Railway:

1. **Remove Railway configuration** (optional):
   - `backend/railway.json` can be kept for reference
   - Backend folder can remain for local development

2. **Update frontend config**:
   - `assets/js/config.js` is already updated to use relative paths
   - API endpoints will be on the same domain

3. **Deploy to Vercel**:
   - Follow the deployment steps above
   - Set environment variables in Vercel dashboard

## 📊 Monitoring

- **Vercel Dashboard**: View function logs, analytics, and errors
- **Health Check**: Monitor `/api/health` endpoint
- **Function Logs**: Available in Vercel dashboard under "Functions"

## 🐛 Troubleshooting

### API Not Working
1. Check environment variables are set in Vercel dashboard
2. Verify function logs in Vercel dashboard
3. Test health endpoint: `/api/health`

### CORS Errors
- CORS is configured in `api/_utils/cors.js`
- Make sure `FRONTEND_URL` matches your production domain

### Rate Limiting
- Chat: 20 requests per 15 minutes per IP
- Contact: 5 submissions per 15 minutes per IP
- Rate limits are per-instance (not global across all Vercel instances)

### Email Not Sending
- Verify SMTP credentials in environment variables
- Check Vercel function logs for errors
- Test SMTP connection locally first

## 📝 Notes

- **Rate Limiting**: Current implementation uses in-memory storage (per-instance). For production with high traffic, consider using Vercel Edge Config or Upstash Redis.
- **Email**: Contact form requires SMTP configuration. If not configured, submissions are logged but not emailed.
- **OpenAI API**: Chatbot requires `OPENAI_API_KEY`. If not set, returns 503 error.
