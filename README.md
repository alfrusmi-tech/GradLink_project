# GradLink – Smart Job Portal with CV Analysis

MERN-stack job portal connecting job seekers and recruiters, with a keyword-based
CV-to-job matching feature.

## Current Status: Stage 1 — Scaffold

This is the initial scaffold. It includes:

- Full folder structure for client (React) and server (Express)
- All 6 MongoDB schemas: `User`, `Company`, `Job`, `Application`, `CV`, `Notification`
- Working authentication: register, login, logout, get-current-user
  - JWT-based, role-based (`admin` / `recruiter` / `jobseeker`)
  - Passwords hashed with bcrypt
- Route stubs for every other module (jobs, companies, applications, CV, notifications)
  so the API surface is mapped out even though the logic isn't implemented yet
- React app wired up with React Router, Context API auth state, an Axios client with
  an auth-token interceptor, a `ProtectedRoute` component for role gating, and
  placeholder pages for every screen in the spec
- Tailwind CSS configured (with dark-mode class strategy ready to use)

Both `client` (`npm run build`) and `server` (`node --check`) have been verified to
build/parse without errors.

## Not built yet (next stages)

- Job posting, search/filter/sort, applications, applicant status workflow
- CV upload (Multer) + keyword-based skill/education/experience extraction from PDF
- Match-percentage scoring against a job description + missing-skills suggestions
- Admin/Recruiter/Job Seeker dashboard data and charts
- Notifications (creation + read state)
- Profile completion %, saved jobs, dark mode toggle wiring, pagination

## Project Structure

```
gradlink/
├── client/                  # React (Vite) frontend
│   ├── src/
│   │   ├── components/common/   # Navbar, ProtectedRoute, etc.
│   │   ├── context/              # AuthContext (Context API)
│   │   ├── pages/                 # One file per route
│   │   ├── services/              # api.js (axios), authService.js
│   │   ├── App.jsx                 # Route definitions
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── vite.config.js
└── server/                  # Express backend
    ├── config/db.js            # MongoDB connection
    ├── controllers/             # authController.js (more to come)
    ├── middleware/               # auth, role, upload, error handling
    ├── models/                    # User, Company, Job, Application, CV, Notification
    ├── routes/                     # authRoutes (implemented), others (stubbed)
    ├── utils/generateToken.js
    └── server.js
```

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB instance (local or Atlas)

### 1. Server

```bash
cd server
cp .env.example .env    # then fill in MONGO_URI and JWT_SECRET
npm install
npm run dev              # nodemon, http://localhost:5000
```

### 2. Client

```bash
cd client
npm install
npm run dev               # http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`, so the
client and server can be run side by side without CORS issues in development.

## Auth API (implemented)

| Method | Route              | Access  | Description                  |
|--------|---------------------|---------|-------------------------------|
| POST   | `/api/auth/register` | Public  | Register as jobseeker/recruiter |
| POST   | `/api/auth/login`    | Public  | Log in, returns JWT           |
| POST   | `/api/auth/logout`   | Private | Logout endpoint                |
| GET    | `/api/auth/me`       | Private | Get current user               |

## CV Matching Approach

Per project decision, CV analysis will use **keyword/skills matching** (not an LLM):
extracted skills from the parsed CV text are compared against a job's
`requiredSkills`/`preferredSkills` arrays to compute a match percentage, matched list,
missing list, and simple rule-based suggestions. This is fast and needs no external
API key, at the cost of being less "smart" than semantic matching (e.g. it won't
recognize "ReactJS" and "React.js" as the same skill unless normalized first —
this normalization step is planned for the CV Analysis build stage).
