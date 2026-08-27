# BlogPlatform

BlogPlatform is a MERN blog application for browsing, creating, editing, and
deleting posts. The frontend is a React application and the backend is an
Express API backed by MongoDB and Mongoose.

## Current Status

The project is functional for local development, but it is not yet ready for
production use. Known release blockers include unsafe post-content rendering,
outdated backend tests, category validation mismatches, production CORS
configuration, dependency vulnerabilities, and incomplete production
configuration. See `RUNNING.md` for the safe local workflow.

## Features

- Browse published posts
- Search posts and filter by category
- View post details and metadata
- Authenticate with JWT-based login
- Create, edit, and delete posts as an authenticated user
- Add excerpts, tags, categories, and reading-time information
- Hash user passwords with bcryptjs when saved through the Mongoose model
- Apply request validation, rate limiting, Helmet security headers, and CORS

## Requirements

### Runtime requirements

- Node.js 18 or newer
- npm 9 or newer
- MongoDB 6 or newer running locally or available through a connection URI
- A modern browser such as Chrome, Firefox, Safari, or Edge

### Development requirements

- A disposable MongoDB database for local seeding and tests
- The root, backend, and frontend dependencies installed with npm
- A strong `JWT_SECRET` configured outside source control before deployment
- A frontend origin explicitly configured in the backend CORS policy
- Separate databases for development and automated tests

### Functional requirements

- Users must authenticate before creating, editing, or deleting posts.
- Post titles must be between 3 and 200 characters.
- Post content must contain at least 10 characters.
- Posts must have a category accepted consistently by both frontend and backend.
- Only the post owner should be able to edit or delete that post.
- Invalid or expired JWTs must not grant access to protected endpoints.
- User passwords must never be stored or logged in plaintext.
- User-generated post content must be rendered safely without executable HTML.

### Production requirements

Before deploying, the project should also have:

- Secrets supplied through a production secret manager or environment variables
- HTTPS enabled for the frontend and API
- A production MongoDB deployment with backups and restricted network access
- Pinned and patched dependencies with a clean high-severity security audit
- Pagination, query limits, and indexes for post listing endpoints
- Structured application logging, health checks, and error monitoring
- Updated API integration tests and frontend workflow tests in CI
- A documented deployment process and a non-empty project-specific runbook

## Project Structure

```text
backend/
	app.js                 Express application entry point
	config/                Database configuration
	controllers/           Authentication and post handlers
	middleware/            Authentication, validation, rate limiting, and errors
	models/                Mongoose User and Post models
	routes/                API route definitions
	data/                  Sample seed data
	test/                  Backend integration tests
	utils/                 Database seed script and legacy utility files
frontend/
	public/                Browser and application metadata
	src/components/        Shared React components
	src/context/           Authentication state
	src/pages/              Application pages
	src/utils/              API client and URL configuration
```

## Configuration

Create a local environment file from the example:

```sh
cp .env.example .env
```

At minimum, configure:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/BlogPlatform_local
PORT=8080
JWT_SECRET=replace-with-a-long-random-secret
```

Never commit `.env`, production credentials, or a production database URI.
The seed command deletes all users and posts in the configured database, so it
must only be used with a disposable local database.

## Installation

From the project root:

```sh
npm install
npm --prefix backend install
npm --prefix frontend install
```

Optionally load the sample users and posts:

```sh
npm run seed
```

## Running Locally

Start both applications:

```sh
npm start
```

The default development URLs are:

- Frontend: `http://localhost:8000`
- Backend: `http://localhost:8080`

To run only one application:

```sh
npm run backend
npm run frontend
```

## Testing and Build

Run the backend test suite:

```sh
npm test
```

Build the frontend for deployment:

```sh
npm --prefix frontend run build
```

The backend tests require a local MongoDB instance and use a separate
`BlogPlatform_test` database. The frontend build currently completes with
React hook dependency warnings; warnings should be resolved before release.

## API Overview

The backend exposes routes under `/api`:

- `POST /api/auth/login` - authenticate a user and receive a JWT
- `GET /api/auth/me` - retrieve the authenticated user profile
- `GET /api/posts` - list published posts
- `GET /api/posts/:id` - retrieve a post
- `GET /api/posts/my-posts` - list posts owned by the authenticated user
- `POST /api/posts` - create a post
- `PUT /api/posts/:id` - update an owned post
- `DELETE /api/posts/:id` - delete an owned post

Protected requests use the following header:

```text
Authorization: Bearer <jwt-token>
```

## Security Notes

This repository is intended for development until the release blockers above
are addressed. In particular, do not expose the current deployment to public
traffic while user-generated content is rendered as HTML, the JWT secret has a
fallback value, or dependency audits report unresolved high/critical issues.
