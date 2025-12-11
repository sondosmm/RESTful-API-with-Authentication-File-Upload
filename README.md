# RESTful API with Authentication & File Upload

A full-featured RESTful API for managing notes with secure user authentication, file uploads, and email notifications. Built with Node.js, Express, MongoDB, and containerized with Docker.

## Features

### 🔐 Authentication System
- **User Registration** - Create new user accounts with email/password
- **User Login** - Authenticate users and receive JWT tokens
- **Token Refresh** - Automatic token renewal for continuous sessions
- **Logout** - Secure session termination
- **Email Notifications** - Welcome emails sent upon registration
- **Password Encryption** - Bcrypt hashing for secure password storage
- **JWT Authentication** - Access and refresh token system with rotation
- **HTTP-Only Cookies** - Secure token storage preventing XSS attacks

### 📝 Notes Management
- **Create Notes** - Add new notes with title and optional image
- **Read Notes** - Retrieve all notes with pagination support
- **Read Single Note** - Get specific note by ID or slug
- **Update Notes** - Modify note title and/or image
- **Delete Notes** - Remove notes and associated images
- **Image Upload** - Attach images to notes (JPG, JPEG, PNG)
- **Auto Slug Generation** - SEO-friendly URL slugs
- **Image Management** - Automatic deletion of old images on update/delete

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Email Service**: Nodemailer (Gmail)
- **Containerization**: Docker & Docker Compose
- **Environment Variables**: dotenv

## Quick Start with Docker (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- MongoDB Atlas account (or local MongoDB)

### Steps

1. Clone the repository
```bash
git clone https://github.com/sondosmm/RESTful-API-with-Authentication-File-Upload.git
cd RESTful-API-with-Authentication-File-Upload
```

2. Create `config.env` file in the root directory
```env
PORT=8000
NODE_ENV=production
DB_URI=your database URI
JWT_ACCESS_SECRET=your_access_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
BASE_URL=http://localhost:8000
```

3. Run with Docker Compose
```bash
docker-compose up -d
```

4. API will be available at `http://localhost:5000`

### Docker Commands

```bash
# Start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

## Manual Installation (Without Docker)

1. Clone the repository
```bash
git clone https://github.com/sondosmm/RESTful-API-with-Authentication-File-Upload.git
cd RESTful-API-with-Authentication-File-Upload
```

2. Install dependencies
```bash
npm install
```

3. Create `config.env` file (same as above)

4. Start the server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication Routes

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "id": "user_id_here"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "accessToken": "jwt_token_here"
}
```
*Sets HTTP-only cookies: accessToken, refreshToken*

#### Refresh Token
```http
POST /api/auth/refresh
Cookie: refreshToken=<token>
```

**Response:**
```json
{
  "accessToken": "new_jwt_token_here"
}
```

#### Logout
```http
POST /api/auth/logout
Cookie: refreshToken=<token>
```

**Response:**
```json
{
  "message": "user logged out successfully"
}
```

### Notes Routes

All notes routes require authentication via accessToken cookie.

#### Get All Notes
```http
GET /api/notes?page=1&limit=4
Cookie: accessToken=<token>
```

**Response:**
```json
{
  "total": 4,
  "page": 1,
  "data": [
    {
      "_id": "note_id",
      "title": "My Note",
      "slug": "my-note",
      "image": "uploads/notes/image.jpg",
      "createdAt": "2025-10-17T10:00:00.000Z"
    }
  ]
}
```

#### Get Single Note
```http
GET /api/notes/:id
Cookie: accessToken=<token>
```

**Response:**
```json
{
  "data": {
    "_id": "note_id",
    "title": "My Note",
    "slug": "my-note",
    "image": "uploads/notes/image.jpg"
  }
}
```

#### Create Note
```http
POST /api/notes
Content-Type: multipart/form-data
Cookie: accessToken=<token>

title: My New Note
image: <file>
```

**Response:**
```json
{
  "message": "Note created successfully",
  "data": {
    "_id": "note_id",
    "title": "My New Note",
    "slug": "my-new-note",
    "image": "uploads/notes/image.jpg"
  }
}
```

#### Update Note
```http
PUT /api/notes/:id
Content-Type: multipart/form-data
Cookie: accessToken=<token>

title: Updated Note Title
image: <file> (optional)
```

**Response:**
```json
{
  "data": {
    "_id": "note_id",
    "title": "Updated Note Title",
    "slug": "updated-note-title",
    "image": "uploads/notes/new-image.jpg"
  }
}
```

#### Delete Note
```http
DELETE /api/notes/:id
Cookie: accessToken=<token>
```

**Response:**
```
204 No Content
```

## Gmail Setup for Email Notifications

To enable email notifications, you need a Gmail App Password:

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Navigate to 2-Step Verification → App Passwords
   - Select "Mail" and your device
   - Copy the 16-character password
3. Add to `config.env`:
   ```env
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   ```

## Project Structure

```
├── controllers/
│   ├── authController.js       # Authentication logic
│   └── NoteController.js       # Notes CRUD operations
├── models/
│   ├── userModel.js            # User schema
│   ├── tokenModel.js           # Refresh token schema
│   └── NoteModel.js            # Note schema
├── middleware/
│   ├── auth.js                 # JWT verification middleware
│   └── uploadImage.js          # Multer file upload config
├── routes/
│   ├── authRoutes.js           # Authentication endpoints
│   └── noteRoutes.js           # Notes endpoints
├── utils/
│   ├── apiError.js             # Custom error handler
│   ├── generateTokens.js       # JWT token generation
│   └── asyncHandler.js         # Async error wrapper
├── uploads/
│   └── notes/                  # Uploaded images storage
├── Dockerfile                  # Docker image definition
├── docker-compose.yml          # Docker orchestration
├── .dockerignore               # Docker ignore rules
├── config.env                  # Environment variables
└── server.js                   # Application entry point
```

## Troubleshooting

### Docker Issues

**Container won't start:**
```bash
# Check logs
docker-compose logs backend

# Rebuild image
docker-compose down
docker-compose up -d --build
```

**Port already in use:**
```bash
# Change port in docker-compose.yml
ports:
  - "3000:8000"  # Use 3000 instead of 5000
```

### MongoDB Connection Issues

- Verify `MONGODB_URI` in `config.env`
- Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for testing)
- Ensure network access is configured

### Email Not Sending

- Verify Gmail App Password is correct (16 characters, no spaces)
- Check 2FA is enabled on Gmail account
- Ensure "Less secure app access" is NOT enabled (use App Password instead)
