# GradLink

GradLink is a full-stack job portal application
developed using the MERN stack. It connects job
seekers, recruiters, and administrators through
a centralized platform.

The application supports user authentication,
job management, job applications, CV uploads,
CV analysis, and notifications.

## Project Overview

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Authentication: JWT + bcrypt
- File Handling: Multer + PDF parsing
- API Communication: Axios

## Project structure

```
GradLink/
├── client/                 # React app (Vite)
│   └── src/
│       ├── components/
│       ├── context/        # Auth context
│       ├── pages/
│       ├── services/       # Axios instance
│       └── utils/          # Client-side validators
└── server/
    ├── config/
    ├── controllers/
    ├── middleware/         # auth, roles, validation, errors
    ├── models/             # Mongoose schemas
    ├── routes/
    ├── validators/         # express-validator rules
    ├── utils/
    └── server.js
```

## Getting started

### Prerequisites

- Node.js (v18 or newer)
- npm
- MongoDB Atlas or a compatible MongoDB instance
- Git

### 1. Clone

```bash
git clone https://github.com/alfrusmi-tech/GradLink_project.git
cd GradLink_project
```

### 2. Backend

```bash
cd server
npm install
cp .env.example .env      # on Windows: copy .env.example .env
```

Edit `.env` (see table below), then:

```bash
npm run dev
```

The API runs on `http://localhost:5000`.

### 3. Frontend

```bash
cd client
npm install
npm run dev
```
### 4. Production Build

```bash
cd client
npm run build
```

The app runs on `http://localhost:5173`.

## Main Features

- User registration and login
- Role-based dashboards
- Job posting and management
- Job searching, filtering, and sorting
- CV upload and analysis
- Job applications and status tracking
- Notifications
- Admin management

## CRUD Operations

GradLink implements complete CRUD operations
for the Job entity.

- Create: Recruiters can post new jobs.
- Read: Users can browse and search jobs.
- Update: Recruiters can edit existing jobs.
- Delete: Recruiters can delete jobs.

All job information is stored in MongoDB.

## Notes

- Ensure MongoDB is connected before using the application.
- Configure environment variables before starting the backend.
- Keep `.env` files and uploaded personal files out of Git.
- Use a secure JWT secret.
- Application transactions require a MongoDB replica set,
  such as MongoDB Atlas.