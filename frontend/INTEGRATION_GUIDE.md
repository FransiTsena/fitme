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
    - **ownerId**: "USER_ID_FROM_AUTH_CONTEXT" (Must match the gym owner)

### Success State
- Show a "Pending Approval" screen.
- The user cannot modify the gym status anymore until Admin approves.

---
