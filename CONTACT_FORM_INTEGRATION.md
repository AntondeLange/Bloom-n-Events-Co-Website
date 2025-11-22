# Contact Form Backend Integration - Complete

The contact form has been integrated with MongoDB to collect and store client data.

## What's Been Done

### Backend (Node.js + Express + MongoDB)

1. **MongoDB Integration:**
   - Added `mongoose` package for MongoDB connection
   - Created database connection configuration (`backend/src/config/database.js`)
   - Automatic connection handling and error management

2. **Contact Model:**
   - Created Contact schema (`backend/src/models/Contact.js`)
   - Fields: firstName, lastName, company, email, message, status, ipAddress, userAgent
   - Automatic timestamps (createdAt, updatedAt)
   - Indexes for better query performance
   - Virtual field for fullName

3. **API Routes:**
   - POST `/api/contact` - Submit contact form (with rate limiting: 5 per 15 minutes)
   - GET `/api/contact` - Get all submissions (admin endpoint - needs authentication)
   - Input validation using Zod schema
   - Comprehensive error handling

4. **Security:**
   - Rate limiting to prevent spam (5 submissions per 15 minutes per IP)
   - Input validation and sanitization
   - Request size limits (50kb for contact form)
   - IP address and user agent tracking

### Frontend

1. **Contact Form Updates:**
   - Replaced `mailto:` solution with backend API call
   - Integrated with backend using `/api/contact` endpoint
   - Proper error handling and user feedback
   - Success/error messages displayed to users
   - Form validation and loading states

2. **Configuration:**
   - Added `CONTACT_ENDPOINT` to `scripts/config.js`
   - Created `getContactApiUrl()` helper function
   - Supports both development and production environments

## Setup Required

### 1. Add MongoDB Connection String

You need to add `MONGODB_URI` to your `backend/.env` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/bloomneventsco?retryWrites=true&w=majority
```

See `MONGODB_SETUP.md` for detailed instructions on:
- Setting up MongoDB Atlas (cloud - recommended)
- Setting up local MongoDB (development)
- Testing the connection

### 2. Restart Backend Server

After adding the MongoDB connection string:

```bash
cd backend
npm start
```

You should see:
```
✅ Connected to MongoDB
📧 Contact API: http://localhost:3000/api/contact
```

## API Endpoints

### POST /api/contact

Submit a contact form.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "company": "Example Corp",  // optional
  "email": "john@example.com",
  "message": "Hello, I'm interested in..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Thank you for your message! We will get back to you soon.",
  "data": {
    "id": "...",
    "submittedAt": "2025-01-XX..."
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Please check your form data and try again",
  "details": [...]
}
```

### GET /api/contact (Admin)

Get all contact submissions (requires authentication - TODO).

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by status (new, read, replied, archived)

## Database Schema

Contact documents are stored in the `contacts` collection:

```javascript
{
  _id: ObjectId("..."),
  firstName: "John",
  lastName: "Doe",
  company: "Example Corp", // or null
  email: "john@example.com",
  message: "Your message...",
  status: "new", // new, read, replied, archived
  ipAddress: "127.0.0.1",
  userAgent: "Mozilla/5.0...",
  createdAt: ISODate("2025-01-XX..."),
  updatedAt: ISODate("2025-01-XX...")
}
```

## Features

✅ Form validation (frontend and backend)
✅ Rate limiting (5 submissions per 15 minutes)
✅ Input sanitization
✅ Error handling
✅ User feedback (success/error messages)
✅ IP address and user agent tracking
✅ Timestamps (createdAt, updatedAt)
✅ Status tracking (new, read, replied, archived)
✅ Google Analytics integration
✅ MongoDB indexes for performance

## Next Steps

1. **Set up MongoDB:**
   - Follow instructions in `MONGODB_SETUP.md`
   - Add `MONGODB_URI` to `backend/.env`
   - Restart backend server

2. **Test the form:**
   - Open the contact page
   - Submit a test form
   - Verify data is saved in MongoDB

3. **View submissions:**
   - Use MongoDB Atlas dashboard
   - Or implement admin panel (TODO)

4. **Production deployment:**
   - Set up MongoDB Atlas (cloud)
   - Configure environment variables on hosting platform
   - Update CORS settings if needed

## Security Notes

- ✅ Rate limiting prevents spam
- ✅ Input validation prevents malicious input
- ✅ IP address tracking for security auditing
- ✅ MongoDB connection uses secure authentication
- ⚠️ GET `/api/contact` endpoint should be protected with authentication (TODO)
- ⚠️ Network access should be restricted in production

## Troubleshooting

**Form not submitting:**
- Check if backend server is running
- Verify MongoDB connection in backend logs
- Check browser console for errors

**"MONGODB_URI is not defined" error:**
- Add `MONGODB_URI` to `backend/.env`
- Restart backend server

**Rate limit errors:**
- Wait 15 minutes between submissions from the same IP
- Adjust rate limits in `backend/src/config/rateLimiter.js` if needed

