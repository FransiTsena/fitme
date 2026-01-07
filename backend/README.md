# FitMe Backend API

Authentication and gym management backend using **Express 5**, **Better Auth**, and **MongoDB**.

## Quick Start

```bash
npm install
npx tsx server.ts
```

Server runs on `http://localhost:3005`

## Environment Variables

```env
MONGO_URI=mongodb://localhost:27017/fitme
BETTER_AUTH_SECRET=your-secret-key
BACKEND_URL=http://localhost:3005
FRONTEND_URL=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## Authentication

Uses **Better Auth** with session tokens. Token format: `<token>.<signature>` (77 chars).

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
| POST   | `/api/users/verify-otp`           | Verify email OTP       |
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

| Method | Endpoint                        | Description                                       |
| ------ | ------------------------------- | ------------------------------------------------- |
| POST   | `/api/users/upload-documents`   | Upload verification docs (max 5 files, 10MB each) |
| GET    | `/api/users/document-status`    | Check document verification status                |
| POST   | `/api/users/resend-upload-link` | Resend document upload link email                 |

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

### Signup

```bash
POST /api/users/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "fatherName": "Father Name",
  "phone": "+251911111111",
  "role": "member",  # member | owner | trainer
  "city": "Addis Ababa",
  "area": "Bole"
}
```

### Login

```bash
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

# Response
{
  "message": "Login successful",
  "token": "W1QybnCliZOeB...WWKZ4rBK9oTm",
  "user": { "id": "...", "name": "John Doe", ... }
}
```

### Upload Documents (Owner)

```bash
POST /api/users/upload-documents
Authorization: Bearer <token>
Content-Type: multipart/form-data

documents: [file1.pdf, file2.jpg, ...]
```

### Validate Gym (Admin)

```bash
POST /api/users/validate-gym/:ownerId
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "gymName": "FitZone Gym",
  "notes": "All documents verified"
}
```

### Get Verified Gyms (Public)

```bash
GET /api/users/verified-gyms?city=Addis%20Ababa&area=Bole&status=active

# Response
{
  "count": 5,
  "gyms": [
    {
      "gymId": "...",
      "gymName": "FitZone Gym",
      "ownerName": "John Doe",
      "city": "Addis Ababa",
      "area": "Bole",
      "status": "active",
      "verifiedAt": "2026-01-06T..."
    }
  ]
}
```

---

## User Roles

| Role      | Description                                |
| --------- | ------------------------------------------ |
| `member`  | Regular gym member                         |
| `owner`   | Gym owner (requires document verification) |
| `trainer` | Gym trainer                                |
| `admin`   | System administrator                       |

## Document Status Flow

```
not_submitted → pending → approved/rejected
                              ↓
                         Creates Gym record
```

---

## Collections

| Collection | Description                       |
| ---------- | --------------------------------- |
| `user`     | User accounts and owner documents |
| `session`  | Better Auth sessions              |
| `gym`      | Verified gym records              |

---

## File Structure

```
backend/
├── server.ts              # Entry point
├── config/
│   └── multer.ts          # File upload config
├── controllers/
│   └── userController.ts  # All API handlers
├── middleware/
│   └── requireAuth.ts     # Auth & role middleware
├── models/
│   ├── authDb.ts          # DB connection
│   ├── userModel.ts       # User schema
│   └── gymModel.ts        # Gym schema
├── routes/
│   └── user.ts            # Route definitions
├── utils/
│   ├── auth.ts            # Better Auth config
│   └── email.ts           # Email sender
└── uploads/
    └── documents/         # Owner verification docs
```

---

## Running Tests

```bash
# Start server first
npx tsx server.ts

# Run tests in another terminal
npx tsx test/owner.test.ts
```

---

## Tech Stack

- **Express 5.1.0** - Web framework
- **Better Auth 1.4.9** - Authentication (JWT + Admin plugins)
- **MongoDB** - Database
- **Multer** - File uploads
- **Nodemailer** - Email sending
- **TypeScript** - Language
