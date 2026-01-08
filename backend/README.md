# FitMe Backend API

Technical documentation for the FitMe gym management and recruitment backend.

## Architecture

This project uses a hybrid architecture for authentication and data management:

1.  **Better Auth (JWT Strategy)**: Handles user authentication, session management, and role-based access control.
    -   **Collection**: `user` (Managed by Better Auth).
    -   **Strategy**: Stateless JWT.
    -   **Plugins**: `admin` for role management and `jwt` for token generation.
2.  **Mongoose (ODM)**: Handles domain-specific business data (Gyms, Memberships).
    -   **User Model Sync**: The `User` Mongoose model is explicitly mapped to the `user` collection to allow Mongoose-based queries on top of Better Auth data.
3.  **Service Layer Pattern**: All business logic is encapsulated in Services (e.g., `gymService.ts`), while Controllers manage HTTP semantics.

---

## Gym Registration & Verification Flow

For frontend developers, the gym registration is a **4-step sequence**. 

> [!IMPORTANT]
> A gym record **must** exist before you can upload the verification document, as the document is linked directly to the gym ID in the database.

### 1. Owner Signup
Register as a user with `registrationRole: "owner"`.
- **Endpoint**: `POST /api/users/signup`
- **Response**: Returns a user object and authentication token.

### 2. Initial Gym Creation
Create the base gym profile. This creates the record needed for subsequent uploads.
- **Endpoint**: `POST /api/gyms`
- **Body**:
  ```json
  {
    "ownerId": "...",
    "name": "Power Gym",
    "location": { "type": "Point", "coordinates": [lng, lat] },
    "address": { "city": "...", "area": "...", "street": "..." }
  }
  ```

### 3. Media Upload (Photos)
Upload gym photos using the generic upload endpoint.
- **Endpoint**: `POST /api/users/upload`
- **Form-Data**: `file: (Binary)`
- **Loop**: Call this for each photo. Collect the returned URLs.
- **Gym Update**: Once you have URLs, call `PUT /api/gyms/:id` to update the `photos` array.

### 4. Verification Document Submission
Upload the official business document.
- **Endpoint**: `POST /api/users/upload-documents`
- **Form-Data**: 
  - `document`: (Binary image/pdf)
  - `ownerId`: (String)
- **Result**: The system links this document to the gym and sets the status to `pending`.

---

## API Reference (Frontend Integration)

### Authentication
All protected routes require a Bearer token:
`Authorization: Bearer <your_jwt_token>`

### User & Uploads
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users/signup` | No | Creates user with `member` or `owner` role. |
| `POST` | `/api/users/upload` | No* | **Generic Upload**: Use for gym photos. Returns Cloudinary URL. |
| `POST` | `/api/users/upload-documents` | No* | **Verification Upload**: Links document to the owner's gym. |

### Gyms
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/gyms` | No* | Create initial gym profile. |
| `PUT` | `/api/gyms/:id` | No* | Update gym details (e.g., add photo URLs). |
| `GET` | `/api/gyms/owner/:ownerId` | Yes | Get gym details for a specific owner. |
| `POST` | `/api/memberships` | No* | **NEW**: Create a membership plan. |
| `PUT` | `/api/memberships/:id` | No* | **NEW**: Update plan details (title, price, etc). |
| `PATCH` | `/api/memberships/:id/status` | No* | **NEW**: Toggle active status (disable/enable). |
| `GET` | `/api/trainers/search` | No | Search members by email/phone/name (`?q=query`). |
| `POST` | `/api/trainers/invite` | No* | Invite a member to become a trainer (sends email). |
| `POST` | `/api/trainers/accept-invite` | No | Accept invitation using the email token. |
| `POST` | `/api/training-sessions` | No* | **NEW**: Create a training session. |
| `PUT` | `/api/training-sessions/:id` | No* | **NEW**: Update session details. |
| `PATCH` | `/api/training-sessions/:id/status` | No* | **NEW**: Toggle active status. |
| `GET` | `/api/training-sessions/gym/:gymId` | No | Get public sessions for a gym. |
| `POST` | `/api/subscriptions/purchase` | No* | **NEW**: Purchase a membership plan. |
| `GET` | `/api/subscriptions/my` | No | Get current user's memberships. |
| `POST` | `/api/bookings/book` | No* | **NEW**: Book a training session. |
| `GET` | `/api/bookings/my` | No | Get current user's session bookings. |
| `GET` | `/api/memberships/gym/:gymId` | No | Get public plans for a gym. |




| `GET` | `/api/users/verified-gyms` | No | Public list of all `approved` and `active` gyms. |


> [!NOTE]
> *Routes marked with "No*" are currently open for integration testing but will require authentication in production.*

---

## Technical Specs

- **Geo-Search**: Uses MongoDB `2dsphere` index on `location`.
- **Media**: Managed via Cloudinary with `multer-storage-cloudinary`.
- **Email**: Nodemailer with SMTP (supports Gmail App Passwords).
- **Validation**: Strict Mongoose schema validation for GeoJSON and owner existence.


