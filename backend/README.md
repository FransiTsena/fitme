# FitMe Backend API

Authentication and gym management backend using **Express 5**, **Better Auth**, and **MongoDB**.

## Quick Start

```bash
npm install
npm run dev
```

Server runs on `http://localhost:3005`

## Environment Variables

```env
MONGO_URI=mongodb://localhost:27017/fitme
BETTER_AUTH_SECRET=your-secret-key
BACKEND_URL=http://localhost:3005
FRONTEND_URL=http://localhost:3000

# Cloudinary Configuration
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>

# SMTP Configuration
SMTP_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## Architecture: Controller/Service Pattern

The backend follows a clean separation of concerns:
- **Routes**: Define endpoints and apply middleware.
- **Controllers**: Handle request/response, validation, and status codes.
- **Services**: Contain all business logic, database operations, and external API calls (Better Auth, Cloudinary).

---

## Authentication

Uses **Better Auth** with the **JWT strategy**. 
- Sessions are stateless (JWT-based).
- Tokens are passed via the `Authorization` header.

### Headers

```
Authorization: Bearer <token>
```

---

## API Endpoints

### Public Routes

| Method | Endpoint                          | Description            |
| ------ | --------------------------------- | ---------------------- |
| POST   | `/api/users/signup`               | Register new user      |
| POST   | `/api/users/login`                | Login, returns token   |
| POST   | `/api/users/forgotPassword`       | Request password reset |
| PUT    | `/api/users/resetPassword/:token` | Reset password         |
| GET    | `/api/users/verified-gyms`        | List all verified gyms |

### Protected Routes (Require Auth)

| Method | Endpoint                  | Description              |
| ------ | ------------------------- | ------------------------ |
| GET    | `/api/users/me`           | Get current user profile |
| POST   | `/api/users/refreshToken` | Refresh session token    |
| POST   | `/api/users/logout`       | Logout user              |

### Owner Routes (Require Auth + Owner Role)

| Method | Endpoint                        | Description                                     |
| ------ | ------------------------------- | ----------------------------------------------- |
| POST   | `/api/users/upload-documents`   | Upload verification doc (Single file, via `document`) |
| GET    | `/api/users/document-status`    | Check document verification status              |
| POST   | `/api/users/resend-upload-link` | Resend document upload link email               |

### Admin Routes (Require Auth + Admin Role)

| Method | Endpoint                              | Description                        |
| ------ | ------------------------------------- | ---------------------------------- |
| POST   | `/api/users/updateRole`               | Update user role                   |
| GET    | `/api/users/pending-verifications`    | List pending document reviews      |
| PUT    | `/api/users/review-documents/:userId` | Approve/reject owner documents     |
| GET    | `/api/users/unverified-gyms`          | List gyms pending verification     |
| POST   | `/api/users/validate-gym/:ownerId`    | Validate gym and create gym record |

---

## Request/Response Examples

### Login

```bash
POST /api/users/login
Content-Type: application/json

{
  "email": "owner@example.com",
  "password": "password123"
}

# Response
{
  "message": "Login successful",
  "token": "signed.jwt.token",
  "user": { "id": "...", "name": "...", "role": "owner" }
}
```

### Upload Documents (Owner)

```bash
POST /api/users/upload-documents
Authorization: Bearer <token>
Content-Type: multipart/form-data

document: <file.pdf | file.png>
```

---

## File Structure

```
backend/
├── server.ts              # Entry point
├── config/
│   └── multer.ts          # Cloudinary & Multer configuration
├── controllers/
│   └── userController.ts  # Thin request handlers
├── services/
│   ├── userService.ts     # User business logic & Better Auth calls
│   └── gymService.ts      # Gym-specific business logic
├── middleware/
│   └── requireAuth.ts     # JWT & Role-based authentication
├── models/
│   ├── authDb.ts          # MongoDB connection
│   ├── userModel.ts       # User schema (Better Auth)
│   └── gymModel.ts        # Gym schema
├── routes/
│   └── user.ts            # Route definitions
└── utils/
    ├── auth.ts            # Better Auth configuration (JWT Strategy)
    └── email.ts           # Email sender utility
```

---

## Running Tests

```bash
# Register, Login, and Upload verification doc
npm run test:upload

# Mock Auth flows
npm run test:auth
```

---

## Tech Stack

- **Express 5.1.0** - Web framework
- **Better Auth 1.4.9** - Authentication (JWT + Admin)
- **MongoDB** - Database (Native driver + Mongoose)
- **Cloudinary** - Document & Image storage
- **Multer** - Middleware for handling `multipart/form-data`
- **Nodemailer** - Email sending
- **TypeScript** - Language
