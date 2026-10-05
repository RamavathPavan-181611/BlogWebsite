# BlogPlatform

BlogPlatform is a full-stack blog application built with a React frontend, an Express API, and MongoDB for persistence. It supports user authentication, blog post creation/editing, comments, likes, bookmarks, profile management, and category-based browsing.

## Project status

Current status: working for local development and verified in the current workspace.

Verified in this project:

- Backend test suite passes: 8 passing
- Frontend production build succeeds: React app compiles successfully
- Local development flow is set up with a MongoDB-backed Express API and a React client

Important note:

- This repository is not a production-hardening project yet. It is suitable for local development, demos, and iteration.
- You must still provide a real local MongoDB instance and a secure JWT secret before running it beyond a disposable development environment.

## Tech stack

- Frontend: React 18, React Router, Tailwind CSS, Lucide icons
- Backend: Node.js, Express, Mongoose, JWT auth, Helmet, CORS, input validation
- Database: MongoDB
- Testing: Mocha + Chai

## Features

- User registration and login
- JWT-based authenticated sessions
- Browse all posts and filter by category
- Search posts by title, excerpt, or author
- View post detail pages
- Create, edit, and delete your own posts
- Profile page with account info and password update
- Comments on posts
- Like and bookmark interactions
- Sanitization of user-generated post content
- Seed data for quick local testing

## Project structure

```text
post_creation/
├── backend/
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   ├── data/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── test/
│   ├── utils/
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── package-lock.json
├── scripts/
├── .env.example
├── .env
├── package.json
├── RUNNING.md
├── BACKEND_IMPROVEMENTS.md
├── BACKUPS.md
├── PROJECT_ISSUES_ANALYSIS.md
└── README.md
```

## Prerequisites

- Node.js 18+
- npm
- MongoDB running locally on port 27017 or a reachable MongoDB connection URI
- A browser for the frontend app

## Environment setup

From the project root, copy the example environment file:

```bash
cp .env.example .env
```

Then confirm the environment values look like this:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/BlogPlatform_local?directConnection=true&serverSelectionTimeoutMS=2000
PORT=8080
JWT_SECRET=replace-with-a-long-random-production-secret
CORS_ORIGINS=http://localhost:8000
```

Notes:

- Do not commit your real `.env` file.
- Keep MongoDB pointed only at a disposable local database during development.
- The seed script clears the configured database before inserting sample records.

## Install dependencies

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

## Run locally

Start MongoDB first, then start the application:

```bash
npm start
```

Default local URLs:

- Frontend: http://localhost:8000
- Backend: http://localhost:8080

Check API health:

```bash
curl http://localhost:8080/healthz
```

Optional sample data:

```bash
npm run seed
```

## Root scripts

```bash
npm start        # run backend + frontend together
npm run backend  # backend only
npm run frontend # frontend only
npm run seed     # populate local MongoDB with sample users/posts
npm test         # run backend integration tests
```

## Testing and verification

The current project has been validated with:

```bash
npm test
```

Result: 8 backend tests passing.

Frontend build check:

```bash
cd frontend && npm run build
```

Result: build succeeded and the production bundle was generated.

## API overview

The backend exposes app routes under `/api`.

### Auth

- `POST /api/auth/register` - create an account
- `POST /api/auth/login` - log in and receive a JWT
- `GET /api/auth/me` - fetch the current authenticated user
- `PUT /api/auth/profile` - update profile data
- `PUT /api/auth/password` - change password

### Posts

- `GET /api/posts` - list posts
- `GET /api/posts/:id` - fetch one post
- `GET /api/posts/my-posts` - list posts for the authenticated user
- `POST /api/posts` - create a post
- `PUT /api/posts/:id` - edit an owned post
- `DELETE /api/posts/:id` - delete an owned post

### Engagement

- `GET /api/posts/:id/comments` - fetch comments
- `POST /api/posts/:id/comments` - create a comment
- `DELETE /api/posts/comments/:commentId` - delete your own comment
- `GET /api/posts/:id/engagement` - get likes/bookmarks counts
- `POST /api/posts/:id/like` - toggle like
- `POST /api/posts/:id/bookmark` - toggle bookmark

Auth uses the standard header pattern:

```http
Authorization: Bearer <token>
```

## Security and development notes

This project includes basic protections such as:

- JWT authentication
- password hashing with bcrypt
- validation middleware
- rate limiting
- Helmet security headers
- MongoDB sanitization checks for post content

However, it should still be treated as a development application until you apply deployment-level hardening, including:

- secure secret management for JWT and database credentials
- production-safe CORS configuration
- HTTPS and a production deployment environment
- dependency review and vulnerability remediation
- proper production monitoring and backup strategy

## Useful references

- [RUNNING.md](RUNNING.md) for local workflow guidance
- [BACKUPS.md](BACKUPS.md) for MongoDB backup instructions
- [PROJECT_ISSUES_ANALYSIS.md](PROJECT_ISSUES_ANALYSIS.md) for issue notes and troubleshooting
- [BACKEND_IMPROVEMENTS.md](BACKEND_IMPROVEMENTS.md) for backend improvement history
