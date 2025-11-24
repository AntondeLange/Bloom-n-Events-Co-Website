# MongoDB Atlas Project Information

## Project Details

- **Project Name:** Bloomeventsco
- **Project ID:** 692138b60318aa7916ec1bea

## Database Connection

- **Username:** bloomneventsco_db_user
- **Password:** 277taDl1609$
- **Cluster:** bloomnevents.aglivok.mongodb.net
- **Database Name:** bloomneventsco

## Connection String

```
mongodb+srv://bloomneventsco_db_user:277taDl1609%24@bloomnevents.aglivok.mongodb.net/bloomneventsco?retryWrites=true&w=majority
```

**Note:** Password is URL-encoded (`$` → `%24`)

## MongoDB Atlas Dashboard

Access your MongoDB Atlas project:
- URL: https://cloud.mongodb.com
- Project: Bloomeventsco
- Project ID: 692138b60318aa7916ec1bea

## Collections

### Contacts Collection

The contact form stores submissions in the `contacts` collection with the following schema:

```javascript
{
  _id: ObjectId("..."),
  firstName: String,
  lastName: String,
  company: String | null,
  email: String,
  message: String (max 200 characters),
  status: "new" | "read" | "replied" | "archived",
  ipAddress: String,
  userAgent: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Viewing Data

To view contact form submissions:

1. Log in to MongoDB Atlas: https://cloud.mongodb.com
2. Select project: **Bloomeventsco**
3. Click "Browse Collections"
4. Select database: **bloomneventsco**
5. View collection: **contacts**

## Security Notes

⚠️ **Important:**
- Never commit `.env` files to Git
- Keep MongoDB credentials secure
- The `.env` file is in `.gitignore` and should not be shared
- Use environment variables in production

## Connection Status

To check if MongoDB is connected:

```bash
# Check backend server logs
cd backend
npm start

# You should see:
# ✅ Connected to MongoDB
```

If you see:
```
⚠️ Failed to connect to MongoDB
```

Check:
1. `MONGODB_URI` is set in `backend/.env`
2. Connection string is correct
3. Network access is configured in MongoDB Atlas
4. Database user has correct permissions

