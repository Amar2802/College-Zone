# College Zone

College Zone is a modern, student networking and roommate-matching platform. It allows college students to discover compatible roommates based on college, course, and lifestyle choices (e.g. sleep schedules, cleanliness habits, study routines), join college communities, RSVP to college events, and chat in real-time.

---

## Features

* **Google Authentication & Password Signup**: Secure Google OAuth authentication alongside custom student email registration.
* **Roommate Matching Engine**: Match with roommates within the same college based on shared habits and preferences.
* **Student Directory & Profiles**: Connect with other students, edit profile details, courses, and graduation year.
* **Real-time Chat**: Send text and images instantly to other students using real-time WebSockets, with built-in typing indicators and read receipts.
* **College Events Hub**: Create events for the university, view university events, and RSVP to build connections.
* **Security Shield**: Integrated Helmet security headers, Express Rate Limiter, clean Zod validations, and centralized error logging.

---

## Tech Stack

* **Frontend**: React, React Router Dom, Framer Motion, TailwindCSS, Lucide icons, Shadcn UI
* **Backend**: Node.js, Express, Socket.io (WebSockets), Winston Logger, Helmet, Express Rate Limit
* **Database**: MongoDB & Mongoose ODM
* **Testing**: Jest & Supertest (Server), Jest (Client)
* **CI/CD**: GitHub Actions

---

## Folder Structure

```
College Zone/
├── client/
│   ├── public/         # Icons, images, and index.html
│   └── src/
│       ├── components/ # Reusable UI components & ErrorBoundary
│       ├── context/    # Authentication Context (AuthContext.tsx)
│       ├── hooks/      # Custom React hooks (toast, mobile detection)
│       ├── pages/      # Application page layouts (Landing, Chat, Dashboard, etc.)
│       ├── services/   # Client network API services (api.ts)
│       └── utils/      # Socket.io helper, Tailwind mergers, and tests
├── server/
│   ├── controllers/    # Controller request handlers (auth, users, events, messages)
│   ├── middleware/     # Custom express middleware (auth protector, error boundary, rate limits)
│   ├── models/         # MongoDB Mongoose schemas (User, Message, Event)
│   ├── routes/         # Router declarations linking controllers
│   ├── tests/          # Jest unit and integration tests (auth, health)
│   ├── utils/          # Winston logger instance and DB connection client
│   └── validators/     # Zod request validation schemas
```

---

## Environment Variables

### Root / Server Environment Variables (`server/.env`)
Create a `server/.env` file with the following variables:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/college_zone
JWT_SECRET=your_jwt_secret_key_here
GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
NODE_ENV=development
```

### Client Environment Variables (`client/.env`)
Create a `client/.env` file with the following variables:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
```

---

## Installation & Running Locally

### Prerequisites
* **Node.js**: Version 20.x or higher
* **MongoDB**: A running local MongoDB instance or MongoDB Atlas URI

### Setup Steps
1. **Clone the Repository** and navigate to the root directory.
2. **Install all dependencies** across root, server, and client:
   ```bash
   npm run install-all
   ```
3. **Configure Environment Variables** by duplicating the `.env.example` templates in root, client, and server to `.env`.
4. **Run in Development Mode**:
   ```bash
   npm run dev
   ```
   This command starts the Node backend server (port 5000) and React frontend server (port 3000) concurrently.
5. **Run Tests**:
   * For backend tests: `npm run test --prefix server`
   * For frontend tests: `npm run test --prefix client`

---

## API Documentation

All endpoints are prefixed with `/api`. All protected routes require a `Bearer <token>` in the `Authorization` header.

### 1. Authentication (`/api/auth`)

#### `POST /signup`
Registers a new student.
* **Request Body**:
  ```json
  {
    "name": "Alex Student",
    "email": "alex@university.edu",
    "password": "strongpassword123",
    "phone": "+1234567890"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "_id": "60d0fe4f5311236168a109ca",
    "name": "Alex Student",
    "email": "alex@university.edu",
    "phone": "+1234567890",
    "token": "eyJhbGciOiJIUzI1Ni..."
  }
  ```

#### `POST /login`
Authenticates email and password.
* **Request Body**:
  ```json
  {
    "email": "alex@university.edu",
    "password": "strongpassword123"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "_id": "60d0fe4f5311236168a109ca",
    "name": "Alex Student",
    "email": "alex@university.edu",
    "phone": "+1234567890",
    "token": "eyJhbGciOiJIUzI1Ni..."
  }
  ```

#### `POST /google`
Authenticates a student using Google OAuth IdToken.
* **Request Body**:
  ```json
  {
    "token": "googleIdTokenHere"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "_id": "60d0fe4f5311236168a109ca",
    "name": "Alex Student",
    "email": "alex@university.edu",
    "phone": "",
    "profile": {},
    "token": "eyJhbGciOiJIUzI1Ni..."
  }
  ```

---

### 2. User Profiles (`/api/users`) - *All Protected*

#### `GET /me`
Retrieves current student details.
* **Response (200 OK)**:
  ```json
  {
    "_id": "60d0fe4f5311236168a109ca",
    "name": "Alex Student",
    "email": "alex@university.edu",
    "phone": "+1234567890",
    "profile": {
      "college": "State University",
      "course": "Computer Science",
      "year": "Junior",
      "sleep_schedule": "Night Owl",
      "cleanliness": "Very Clean",
      "study_habits": "Quiet",
      "smoking_drinking": "Non-smoker/Non-drinker"
    }
  }
  ```

#### `PUT /profile`
Updates current student's lifestyle and profile details.
* **Request Body**:
  ```json
  {
    "college": "State University",
    "course": "Computer Science",
    "year": "Senior",
    "sleep_schedule": "Night Owl",
    "cleanliness": "Very Clean"
  }
  ```
* **Response (200 OK)**: Returns updated user profile object.

#### `GET /study-buddies`
Returns list of students belonging to the same college.
* **Response (200 OK)**: Array of student profile objects.

#### `GET /:userId`
Returns public profile of another student.

---

### 3. Messaging (`/api/messages`) - *All Protected*

#### `GET /:otherUserId`
Fetches conversation history with another user.
* **Response (200 OK)**:
  ```json
  [
    {
      "_id": "60d0ff8a5311236168a109cc",
      "sender": "60d0fe4f5311236168a109ca",
      "receiver": "60d0fe4f5311236168a109cb",
      "content": "Hey! Are you still looking for a roommate?",
      "isRead": true,
      "createdAt": "2026-06-15T14:15:30.000Z"
    }
  ]
  ```

#### `POST /`
Sends a new message. Emits real-time notification via Socket.io.
* **Request Body**:
  ```json
  {
    "receiverId": "60d0fe4f5311236168a109cb",
    "content": "Yes, I am!"
  }
  ```
* **Response (201 Created)**: Returns created message object.

---

### 4. Events (`/api/events`) - *All Protected*

#### `GET /`
Fetches University events matching current student's college.

#### `POST /`
Creates a university event.
* **Request Body**:
  ```json
  {
    "title": "Study Group Meetup",
    "description": "Preparing for CS final exams.",
    "date": "2026-06-20T18:00:00.000Z",
    "location": "Library Room 3"
  }
  ```

#### `PUT /:eventId/rsvp`
Toggles user attendance RSVP.

---

### 5. System Health (`/api/health`)

#### `GET /`
Check API system health status.
* **Response (200 OK)**:
  ```json
  {
    "status": "ok",
    "uptime": 12.345,
    "timestamp": "2026-06-15T14:26:00.000Z"
  }
  ```

---

## License
Licensed under the MIT License.
