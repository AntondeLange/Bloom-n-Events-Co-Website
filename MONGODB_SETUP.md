# MongoDB Setup Instructions

The contact form backend requires MongoDB to store contact form submissions. Follow these steps to set up MongoDB:

## Option 1: MongoDB Atlas (Cloud - Recommended for Production)

1. **Create a free MongoDB Atlas account:**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up for a free account

2. **Create a cluster:**
   - Click "Build a Database"
   - Select the free tier (M0 Sandbox)
   - Choose your preferred cloud provider and region
   - Click "Create Cluster"

3. **Set up database access:**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and password (save these!)
   - Set user privileges to "Read and write to any database"
   - Click "Add User"

4. **Configure network access:**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your server's IP address only (more secure)
   - Click "Confirm"

5. **Get your connection string:**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name (e.g., `bloomneventsco`)

   Example connection string:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/bloomneventsco?retryWrites=true&w=majority
   ```

6. **Add to .env file:**
   - Open `backend/.env`
   - Add the connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/bloomneventsco?retryWrites=true&w=majority
   ```

## Option 2: Local MongoDB (For Development)

1. **Install MongoDB Community Edition:**
   - macOS: `brew install mongodb-community`
   - Windows: Download from https://www.mongodb.com/try/download/community
   - Linux: Follow instructions at https://docs.mongodb.com/manual/installation/

2. **Start MongoDB:**
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Or run manually
   mongod --config /usr/local/etc/mongod.conf
   ```

3. **Add to .env file:**
   ```
   MONGODB_URI=mongodb://localhost:27017/bloomneventsco
   ```

## Environment Variables

Add this to your `backend/.env` file:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/bloomneventsco?retryWrites=true&w=majority

# Existing environment variables
OPENAI_API_KEY=sk-...
PORT=3000
FRONTEND_URL=http://localhost:8080
NODE_ENV=development
```

## Testing the Connection

After setting up MongoDB and adding the connection string:

1. **Restart the backend server:**
   ```bash
   cd backend
   npm start
   ```

2. **Check the console output:**
   - You should see: `✅ Connected to MongoDB`
   - If you see an error, check:
     - Is the connection string correct?
     - Is MongoDB running (for local) or accessible (for Atlas)?
     - Are network access rules configured correctly?

3. **Test the contact form:**
   - Open your website
   - Go to the contact page
   - Submit the form
   - Check the MongoDB database to see the submission

## Viewing Data in MongoDB Atlas

1. Go to MongoDB Atlas dashboard
2. Click "Browse Collections"
3. Select your database
4. View the `contacts` collection to see form submissions

## Database Structure

The contact form creates documents with this structure:

```javascript
{
  _id: ObjectId("..."),
  firstName: "John",
  lastName: "Doe",
  company: "Example Corp", // or null
  email: "john@example.com",
  message: "Your message here...",
  status: "new", // new, read, replied, archived
  ipAddress: "127.0.0.1",
  userAgent: "Mozilla/5.0...",
  createdAt: ISODate("2025-01-XX..."),
  updatedAt: ISODate("2025-01-XX...")
}
```

## Security Notes

- **Never commit `.env` files to version control**
- **Use strong passwords for database users**
- **Restrict network access in production to your server IP only**
- **Enable MongoDB Atlas encryption at rest**
- **Use connection string parameters for additional security options**

## Troubleshooting

**"MONGODB_URI is not defined" error:**
- Check that `.env` file exists in the `backend` directory
- Verify `MONGODB_URI` is set in `.env`
- Restart the server after adding the variable

**"Connection timeout" error:**
- Check network access rules in MongoDB Atlas
- Verify the connection string is correct
- Check if MongoDB is running (for local)

**"Authentication failed" error:**
- Verify username and password are correct
- Check database user privileges in MongoDB Atlas
- Ensure special characters in password are URL-encoded

