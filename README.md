# GradLink

A full-stack job portal for job seekers, recruiters, and admins.

## Stack
- React + Vite + Tailwind
- Node.js + Express
- MongoDB + Mongoose
- JWT auth

## Features
- User registration and login
- Role-based access (`jobseeker`, `recruiter`, `admin`)
- Job listings and application flow
- CV upload and matching foundation
- Dashboard pages for different user roles

## Project Structure
```text
GradLink/
├── client/      # React frontend
├── server/      # Express backend
├── README.md
└── .gitignore
```

## Setup

### 1. Backend
```bash
cd server
cp .env.example .env
npm install
npm run dev
```

### 2. Frontend
```bash
cd client
npm install
npm run dev
```

## Environment
Create `server/.env` with:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/gradlink
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

## API
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- additional routes for users, jobs, companies, applications, CV, and notifications

## Status
This project is in active development and currently includes the app foundation and authentication setup.
