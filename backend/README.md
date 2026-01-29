# 🏋️ FitMe Backend API

Technical documentation for the FitMe gym management and recruitment backend. FitMe is an all-in-one platform for gym owners to manage memberships, trainers to book sessions, and members to track their fitness journey.

---

## 🚀 Features

- **🔐 Robust Auth**: Stateless JWT authentication with role-based access control (Admin, Owner, Trainer, Member).
- **🏗️ Core Management**: Full CRUD for Gyms, Membership Plans, and Training Sessions.
- **📍 Geo-Location**: Search for gyms near you using MongoDB 2dsphere indexing.
- **📸 Media Handling**: Cloudinary integration for gym photos and verification documents.
- **📧 Notifications**: Automated email invitations for trainers and verification status updates.
- **📊 Analytics**: Dedicated dashboards for Gym Owners and Trainers.
- **💳 Subscriptions**: Seamless membership purchase and session booking flow.

---

## 📋 Table of Contents

1. [Prerequisites](#-prerequisites)
2. [Getting Started](#-getting-started)
3. [Architecture](#-architecture)
4. [Gym Registration & Verification Flow](#-gym-registration--verification-flow)
5. [API Reference](#-api-reference)
6. [Project Structure](#-project-structure)
7. [Scripts](#-scripts)

---

## 🛠️ Prerequisites

- **Node.js**: v18.x or higher
- **MongoDB**: Local instance or MongoDB Atlas
- **Cloudinary Account**: For image and document uploads
- **SMTP Server**: (Optional) For email notifications

---

## 🏁 Getting Started

### 1. Installation
```bash
git clone <repository-url>
cd backend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory and copy the contents from `.example.env`. Fill in your credentials:

```bash
cp .example.env .env
```

Key variables:
- `MONGO_URI`: Your MongoDB connection string.
- `JWT_SECRET`: Secret for signing tokens.
- `CLOUDINARY_*`: Cloudinary credentials for media storage.
- `SMTP_*`: SMTP settings for emails.

### 3. Database Seeding (Optional)
Populate your database with sample data:
```bash
npm run seed
```

### 4. Running the Server
```bash
# Development mode with hot-reload
npm run dev

# Production mode
npm start
```

---

## 🏛️ Architecture

This project uses a layered architecture for scalability and maintainability:

1.  **Authentication (Better Auth + JWT)**:
    -   Handles session management and role-based access.
    -   **Strategy**: Stateless JWT.
    -   **Plugins**: `admin` for roles, `jwt` for token generation.
2.  **Mongoose ODM**:
    -   Manages domain-specific business data (Gyms, Memberships, Bookings).
    -   The `User` Mongoose model is synced with the Better Auth `user` collection.
3.  **Service Layer Pattern**:
    -   **Controllers**: Handle HTTP requests/responses and validation.
    -   **Services**: Encapsulate business logic and database interactions.
    -   **Models**: Define data structures and schemas.

---

## 🏢 Gym Registration & Verification Flow

For frontend developers, the gym registration is a **4-step sequence**. 

> [!IMPORTANT]
> A gym record **must** exist before you can upload the verification document, as the document is linked directly to the gym ID in the database.

### 1️⃣ Owner Signup
Register as a user with `registrationRole: "owner"`.
- **Endpoint**: `POST /api/users/signup`
- **Response**: Returns a user object and auth token.

### 2️⃣ Initial Gym Creation
Create the base gym profile. 
- **Endpoint**: `POST /api/gyms`
- **Body Example**:
  ```json
  {
    "ownerId": "...",
    "name": "Power Gym",
    "location": { "type": "Point", "coordinates": [lng, lat] },
    "address": { "city": "City", "area": "Area", "street": "Street" }
  }
  ```

### 3️⃣ Media Upload (Photos)
Upload gym photos. Returns a Cloudinary URL.
- **Endpoint**: `POST /api/users/upload`
- **Form-Data**: `file: (Binary)`
- **Update**: Call `PUT /api/gyms/:id` to add the URL to the `photos` array.

### 4️⃣ Verification Document Submission
Upload official business documents. Status becomes `pending`.
- **Endpoint**: `POST /api/users/upload-documents`
- **Form-Data**: `document: (Binary image/pdf)`, `ownerId: (String)`

---

## 📡 API Reference

### 🔐 Authentication
All protected routes require a Bearer token: `Authorization: Bearer <your_jwt_token>`

### 👤 Users & Uploads
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users/signup` | No | Creates user (Member/Owner). |
| `POST` | `/api/users/upload` | No* | Generic photo upload. |
| `POST` | `/api/users/upload-documents` | No* | Identity verification upload. |

### 🏋️ Gym Management
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/gyms` | No* | Create initial gym profile. |
| `PUT` | `/api/gyms/:id` | No* | Update gym info/photos. |
| `GET` | `/api/gyms/owner/:ownerId` | Yes | Get gym details for an owner. |
| `GET` | `/api/users/verified-gyms` | No | List of approved/active gyms. |

### 💳 Memberships & Subscriptions
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/memberships` | No* | Create a membership plan. |
| `GET` | `/api/memberships/gym/:gymId` | No | Get public plans for a gym. |
| `POST` | `/api/subscriptions/purchase` | No* | Purchase a membership plan. |
| `GET` | `/api/subscriptions/my` | Yes | Get your active memberships. |

### 📅 Training Sessions & Bookings
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/training-sessions` | No* | Create a training session. |
| `GET` | `/api/training-sessions/gym/:gymId` | No | View sessions for a gym. |
| `POST` | `/api/bookings/book` | Yes | Book a training session. |
| `GET` | `/api/bookings/my` | Yes | View your upcoming bookings. |

### 🤝 Trainer Recruitment
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/trainers/search` | Yes | Search members by name/email/phone. |
| `POST` | `/api/trainers/invite` | Yes | Invite a member to become a trainer. |
| `POST` | `/api/trainers/accept-invite` | No | Accept invite via email token. |

> [!NOTE]
> Routes marked with `No*` are temporary without auth for dev testing but will be secured.

---

## 📂 Project Structure

```text
backend/
├── config/             # Multer and configuration files
├── controllers/        # Request handlers
├── middleware/         # Auth and validation guards
├── models/             # Mongoose schemas (MongoDB)
├── routes/             # API route definitions
├── services/           # Business logic layer
├── scripts/            # Database seeders and migrations
├── test/               # Integration tests (tsx)
└── utils/              # Helper functions (JWT, Email)
```

---

## 📜 Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts server with Nodemon (dev). |
| `npm run start` | Starts server with tsx (prod). |
| `npm run seed` | Runs the master seeder. |
| `npm run test:flow` | Runs the full integration flow test. |
| `npm run test:auth` | Runs authentication tests. |

---

## 🧪 Testing

We use `tsx` to run our tests located in the `test/` folder.
To test specific components, you can run:
- `npm run test:auth` - Authentication flow.
- `npm run test:gym_reg` - Gym registration flow.
- `npm run test:purchase` - Membership purchase flow.

---
© 2026 FitMe Team


