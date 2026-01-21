# Environment Variables Documentation

## Required Variables

### `OPENAI_API_KEY`
- **Type:** String
- **Required:** Yes (for chatbot functionality)
- **Format:** Starts with `sk-`
- **Description:** OpenAI API key for chatbot functionality
- **Where to get:** https://platform.openai.com/api-keys
- **Security:** ⚠️ Never commit to git. Store in Railway environment variables.

### `NODE_ENV`
- **Type:** Enum (`development` | `production` | `test`)
- **Required:** No (defaults to `production`)
- **Description:** Environment mode
- **Production:** Use `production` for Railway deployment

## Optional Variables

### `PORT`
- **Type:** Number
- **Required:** No (defaults to `3000`)
- **Description:** Server port
- **Note:** Railway automatically sets this - don't override unless needed

### `FRONTEND_URL`
- **Type:** URL string
- **Required:** No
- **Description:** Frontend URL for CORS configuration
- **Example:** `https://www.bloomneventsco.com.au`
- **Note:** If not set, uses default allowed origins

### `MONGODB_URI`
- **Type:** MongoDB connection string
- **Required:** No (chatbot doesn't require database)
- **Description:** MongoDB connection URI (if using database features)
- **Format:** `mongodb://[username:password@]host[:port][/database]`

### Email Configuration (Optional)
These are only needed if implementing email functionality:

- `ENQUIRIES_EMAIL` - Email address for enquiries
- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `SMTP_SECURE` - Use TLS (`true`/`false`)
- `SMTP_FROM` - From email address

## Railway Configuration

### Setting Environment Variables

1. Go to Railway project dashboard
2. Select your service
3. Go to "Variables" tab
4. Click "New Variable"
5. Add variable name and value
6. Click "Add"

### Required for Production

Minimum required variables for chatbot to work:
```
OPENAI_API_KEY=sk-...
NODE_ENV=production
```

### Recommended Variables

For better CORS handling:
```
FRONTEND_URL=https://www.bloomneventsco.com.au
```

## Validation

Environment variables are validated on server startup using Zod schema. If validation fails:
- Server will log errors but continue running
- Missing required variables will cause features to be disabled
- Check server logs for specific validation errors

## Security Best Practices

1. ✅ Never commit `.env` files to git
2. ✅ Use Railway's environment variables (not hardcoded)
3. ✅ Rotate API keys regularly
4. ✅ Use different keys for development/production
5. ✅ Monitor API usage for unexpected activity

## Troubleshooting

### Chatbot shows "Service unavailable"
- **Check:** `OPENAI_API_KEY` is set and valid
- **Verify:** Key starts with `sk-`
- **Test:** Check server logs for validation errors

### CORS errors
- **Check:** `FRONTEND_URL` matches your frontend domain
- **Verify:** Backend allows your frontend origin
- **Check:** Server logs for CORS rejection messages

### Server won't start
- **Check:** All required variables are set
- **Check:** Variable values are correct format
- **Check:** Server logs for validation errors

## Development Setup

For local development, create a `.env` file in `backend/` directory:

```env
OPENAI_API_KEY=sk-your-dev-key-here
NODE_ENV=development
FRONTEND_URL=http://localhost:8000
PORT=3000
```

**Note:** `.env` is in `.gitignore` - never commit it.

## Production Checklist

Before deploying to Railway:

- [ ] `OPENAI_API_KEY` is set (production key)
- [ ] `NODE_ENV=production`
- [ ] `FRONTEND_URL` matches production domain (optional but recommended)
- [ ] All sensitive values are in Railway (not in code)
- [ ] Test chatbot after deployment
