# AI Coding Assistant Instructions

Purpose: Fast orientation for agents contributing to this monorepo (React/Vite client + Express/Mongo API) without asking basic questions.

## Architecture Overview
- Two main folders: `client/` (React + Vite + Tailwind) and `server/` (Express + Mongoose) sharing a single dev machine; the Vite dev server proxies API calls via `vite.config.js` (`/api -> http://localhost:5000`).
- Backend entry: `server/server.js` wires routes under `/api/*`; each domain has: `models/`, `controllers/`, `routes/`, optional role-specific logic.
- User & role system: base `User` model (`models/User.js`) uses Mongoose discriminators (`discriminatorKey: 'role'`). Specialized role implemented: `UniversityRepresentative` (`models/UniversityRepresentative.js`) adds `university` + `max_requests`.
- Role switching logic lives in `controllers/userController.js::updateUser` (recently enhanced). Be careful: changing to/from `university_representative` replaces the Mongo document (delete + recreate) to satisfy discriminator schema.

## Key Backend Patterns
- Routes: each `*/routes/*Routes.js` file imports controller functions and mounts under a plural resource path (`/api/<resource>`). Check `server.js` for the canonical mount order.
- Auth: JWT via `Authorization: Bearer <token>`; middleware `protect` populates `req.user`; `adminOnly` guards admin routes. Token secret: `process.env.JWT_SECRET` (must exist in `.env`).
- Password reset flow: token + expiry fields on `User` (`resetPasswordToken`, `resetPasswordExpire`); endpoints: `POST /api/users/forgot-password`, `GET /api/users/reset-password-email/:token`, `POST /api/users/reset-password/:token`.
- Disabling users: `PATCH /api/users/:id/disable` toggles `disabled` boolean (requires admin).
- Error handling: custom middleware `middleware/logError.js` logs stack then returns JSON `{ message, error, stack }` for 500s.
- Stats endpoint: `GET /api/users/stats` returns counts per role for dashboard widgets.

## Data Model Conventions
- All models timestamped (`timestamps: true`) giving `createdAt` / `updatedAt` implicitly (plus some explicit `created_at` fields on `User`).
- Use ObjectId refs for relations: e.g. `UniversityRepresentative.university` references `University` collection.
- Roles enumerated: `['admin','odc_mentor','prestataire','university_representative']`. Do not introduce new roles without updating the enum and any switch logic.

## Frontend Patterns (client/)
- State + data fetch: Direct `fetch('/api/...')` calls rely on Vite proxy; do not hardcode `http://localhost:5000` inside client code.
- Auth token stored in `localStorage` under key `token` and manually injected into `Authorization` header for each request.
- User management UI: `components/AdminDashboard/Users.jsx` centralizes CRUD + role change; after modifying backend user fields, ensure the shape returned matches what this component expects (`_id`, `name`, `email`, `phone_number`, `role`, optional `university`).
- Tailwind config at project root of client (`tailwind.config.js`). Keep utility-first styling; prefer component-local state over global managers (no Redux present).

## Common Pitfalls & Gotchas
- Role transitions: When switching away from `university_representative`, any `university` field should be ignored client-side. Backend currently recreates doc; ensure client refreshes user list to get accurate discriminator state (call refetch instead of local optimistic merge when role changes across discriminator boundary).
- Unique email: Updates that change `email` must respect unique index; backend returns 500 with `error: E11000 duplicate key` if violated—surface a friendly message on client.
- Missing JWT: Many routes (including `PUT /api/users/:id`) require `Authorization`; forgetting token yields 401 (not 404). If you see a 404 while expecting protected route, confirm request actually hits backend (proxy) and user id exists.
- University requirement: Creating or converting to `university_representative` requires `university` field; backend returns 400 if absent.

## Environment & Running
- Expected `.env` in `server/` with at least: `MONGO_URI=...`, `JWT_SECRET=...`, `EMAIL_USERNAME=...`, `EMAIL_PASSWORD=...`.
- Dev servers (from repo root, Windows PowerShell):
  ```powershell
  cd server; npm install; node server.js
  cd ../client; npm install; npm run dev
  ```
- Client served at `http://localhost:5173`, API at `http://localhost:5000` (proxied to `/api/*`).

## Adding Features
- New resource: create `models/<Name>.js`, controller functions in `controllers/<name>Controller.js`, and `routes/<name>Routes.js`; mount in `server.js` with consistent plural path.
- Extend user roles: update enum in `models/User.js`, adjust UI role labels in `Users.jsx` (`roleLabels` object & filter buttons), and revisit `updateUser` logic.
- For new user-related fields, ensure they’re excluded or included consistently in: registration, update, and serialization responses.

## Error Diagnosis Workflow
1. Reproduce request via client (observe network tab) or curl/Postman.
2. Check server console output (stack traces printed by `logError`).
3. Validate route path matches mount (e.g. `PUT /api/users/:id`).
4. For role issues, inspect document directly in Mongo to confirm discriminator & fields.

## Safe Changes For Agents
- You can refactor controller logic for clarity (add logs, split helper funcs) if response shapes remain stable.
- You can add lightweight utility functions or small hooks in client; avoid introducing heavy state libs unless asked.

Provide concise PR descriptions referencing affected endpoints & models.
