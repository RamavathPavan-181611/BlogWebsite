# Safe local run guide

Use only a disposable local MongoDB database. The seed command deletes **all**
posts and users in the database named by `MONGODB_URI` before inserting sample
data. Never point it at a shared or production database.

## Root-level workflow

1. Copy `.env.example` to `.env` and keep the default `BlogPlatform_local`
   database name (or choose another clearly local, disposable name).
2. Install each project's dependencies once:

   ```sh
   npm install
   npm --prefix backend install
   npm --prefix frontend install
   ```

3. Ensure your local MongoDB service is running, then optionally load sample
   data with `npm run seed`.
4. Start both applications with `npm start`. The frontend listens on port 8000
   and the backend on port 8080 by default.

After starting the backend, check its readiness endpoint:

```sh
curl http://localhost:8080/healthz
```

It returns HTTP `200` when MongoDB is connected and HTTP `503` otherwise. Use
this endpoint for a private staging uptime check or container health check.

## Backend-only workflow

Copy `backend/.env.example` to `backend/.env`, install dependencies in
`backend`, then run `npm start` from that directory. The npm scripts preload
that file before the app imports its database configuration.

## Tests

Run `npm test` from the project root. It always uses
`BlogPlatform_test`, regardless of the development `MONGODB_URI`, and the
existing tests reseed that database repeatedly. It therefore still requires a
local MongoDB service, but does not modify `BlogPlatform_local`.
