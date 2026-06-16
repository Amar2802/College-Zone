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


