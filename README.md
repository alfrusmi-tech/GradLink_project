# GradLink

GradLink is a full-stack job portal application
developed using the MERN stack. It connects job
seekers, recruiters, and administrators through
a centralized platform.

The application supports user authentication,
job management, job applications, CV uploads,
CV analysis, and notifications.

## Key Features

### Job Seekers
- User registration and login
- Search, filter, and sort available jobs
- View job details
- Upload PDF CVs
- Analyze CVs against job requirements
- Apply for jobs
- Track application status
- Receive notifications

### Recruiters
- Create and manage company profiles
- Post new job vacancies
- View and update existing jobs
- Delete eligible job vacancies
- Review job applications
- Update application statuses

### Administrators
- View platform statistics
- Manage users
- Manage jobs and companies
- 
## Project Overview

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Authentication: JWT + bcrypt
- File Handling: Multer + PDF parsing
- API Communication: Axios

  ## System Architecture

GradLink follows a three-tier architecture:

1. Frontend – React handles the user interface.
2. Backend – Express.js provides REST APIs,
   authentication, authorization, and business logic.
3. Database – MongoDB stores the application's data.

The frontend communicates with the backend using HTTP
requests, and the backend interacts with MongoDB
through Mongoose.

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

## Database Design

GradLink uses MongoDB with Mongoose to manage six
main collections:

- User
- Company
- Job
- Application
- CV
- Notification

Jobs are associated with recruiters and companies.
Applications connect job seekers with job vacancies.
CVs and notifications are associated with users.

## Getting started

### Prerequisites

- Node.js (v18 or newer)
- npm
- MongoDB Atlas or a compatible MongoDB instance
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/alfrusmi-tech/GradLink_project.git
cd GradLink_project
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the server folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

Backend health endpoint:

http://localhost:5000/api/health

### 3. Frontend Setup

Open another terminal from the project root:

```bash
cd client
npm install
npm run dev
```

Open the local URL shown by Vite, normally:

http://localhost:5173

## Authentication and Security

- JWT-based user authentication
- Password hashing using bcrypt
- Role-based authorization
- Protected API endpoints
- Client-side and server-side validation
- PDF file upload restrictions
- Error handling for invalid requests

## Useful Commands

### Backend

```bash
cd server
npm run dev
```

### Frontend

```bash
cd client
npm run dev
```

### Frontend Production Build

```bash
cd client
npm run build
```

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
