# Gym Registration & Media Upload - Frontend Integration Guide

This guide details the UI/UX flow and API integration for the "Owner Onboarding" process, specifically the steps immediately following user signup.

## Technology Context
- **Backend URL**: `http://localhost:3005` (or configured env)
- **Auth**: Bearer Token required for most steps (obtained during signup/login).

---

## 🏗️ Step 1: Gym Details Form
**Goal**: Create the initial gym profile record.

### UI Expectations
- **Form Layout**:
    - **Name**: Text Input (Required)
    - **Description**: Multiline Text Input (Optional)
    - **Address**:
        - City: Dropdown or Text (Required - e.g., "Addis Ababa")
        - Area: Dropdown or Text (Required - e.g., "Bole")
        - Street: Text Input
    - **Location**:
        - Map Component to pick a pin.
        - **Capture**: `latitude` and `longitude`.

### Button
- **Label**: "Create Gym Profile"
- **Action**: `POST /api/gyms`

### Payload
```json
{
  "ownerId": "USER_ID_FROM_AUTH_CONTEXT",
  "name": "My Power Gym",
  "description": "Best gym in town...",
  "location": {
    "type": "Point",
    "coordinates": [8.9806, 38.7578] // [Longitude, Latitude] ⚠️ Note order!
  },
  "address": {
    "city": "Addis Ababa",
    "area": "Bole",
    "street": "Ring Road"
  }
}
```

### Success Response
Store the `data._id` (Gym ID) from the response. You will need it for Step 2.
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec...",
    ...
  }
}
```

---

## 📸 Step 2: Gym Photos Upload
**Goal**: Upload marketing photos for the gym.

### UI Expectations
- **Component**: Image Picker (Select multiple images).
- **Display**: Show selected image thumbnails.

### Button
- **Label**: "Upload Photos" (or auto-upload on selection)
- **Logic**:
    1.  Iterate through selected images.
    2.  For each image, call `POST /api/users/upload`.
    3.  Collect the `url` from each response.
    4.  **Final Action**: Call `PUT /api/gyms/:gymId` to save the URLs.

### API Interaction (Per Image)
- **Endpoint**: `POST /api/users/upload`
- **Header**: `Content-Type: multipart/form-data`
- **Body**: `file` = (Image Binary)
- **Response**:
  ```json
  { "url": "https://res.cloudinary.com/..." }
  ```

### API Interaction (Final Save)
- **Endpoint**: `PUT /api/gyms/:gymId`
- **Body**:
  ```json
  {
    "photos": ["url1", "url2", "url3"]
  }
  ```

---

## 📜 Step 3: Verification Document
**Goal**: Submit legal proof (Business License / ID).

### UI Expectations
- **Component**: Single File Picker (Image or PDF).
- **Label**: "Upload Business License or Owners ID".

### Button
- **Label**: "Submit for Verification"
- **Action**: `POST /api/users/upload-documents`

### Payload
- **Header**: `Content-Type: multipart/form-data`
- **Body**:
    - `document`: (File Binary)
    - `ownerId`: "USER_ID_FROM_AUTH_CONTEXT"
    - **Note**: The gym record (Step 1) must exist first.

### Success State
- Show a "Pending Approval" screen.
- The user cannot modify the gym status anymore until Admin approves.

---

## 💳 Step 4: Membership Plans (Optional at setup)
**Goal**: Create, Edit, or Disable subscription plans.

### 1. Create Plan
- **Endpoint**: `POST /api/memberships`
- **Body**: `{ gymId, ownerId, title, price, durationInDays, description }`

### 2. Update Plan
- **Endpoint**: `PUT /api/memberships/:id`
- **Body**: `{ price: 2000, title: "New Name" }` (Send only changed fields)
- **Note**: Requires user to be the owner of the gym.

### 3. Disable/Enable Plan
- **Endpoint**: `PATCH /api/memberships/:id/status`
- **Body**: `{ "isActive": false }`
- **UI**: Use a toggle switch next to the plan in the dashboard.

---

## 🏋️‍♂️ Step 5: Trainer Management (Promotion)
**Goal**: Invite existing members to become trainers.

### 1. Search Candidate
- **Endpoint**: `GET /api/trainers/search?q=EMAIL_OR_NAME`
- **UI**: Search bar in "Manage Trainers" dashboard.
- **Response**: List of candidates `{ _id, name, email, profileImage }`.

### 2. Send Invitation
- **Endpoint**: `POST /api/trainers/invite`
- **Body**: `{ "gymId": "...", "memberId": "..." }`
- **Action**: Triggers an email to the user with a magic link.

### 3. Accept Invitation (User Side)
- **Page**: `FRONTEND_URL/join-trainer?token=...`
- **Endpoint**: `POST /api/trainers/accept-invite`
- **Body**: `{ "token": "TOKEN_FROM_URL_QUERY_PARAM" }`
- **Success**: User role updates to `trainer`, redirect to Trainer Dashboard.

---

## 🏋️‍♂️ Step 6: Training Session Management (Trainer)
**Goal**: Trainers create and manage their session offerings.

### 1. Create Session
- **Endpoint**: `POST /api/training-sessions`
- **Body**: 
  ```json
  {
    "userId": "TRAINER_USER_ID", // Optional if using auth token
    "title": "HIIT Blast",
    "description": "High intensity interval training",
    "durationMinutes": 45,
    "price": 500
  }
  ```

### 2. Update Session
- **Endpoint**: `PUT /api/training-sessions/:id`
- **Body**: `{ "title": "New Title", "price": 600 }` (Send only changes)

### 3. Disable/Enable Session
- **Endpoint**: `PATCH /api/training-sessions/:id/status`
- **Body**: `{ "isActive": false }`
