# Copilot instructions for this repository

Purpose: give AI coding agents the minimal, actionable context to be productive in this Express + MySQL project.

- **Big picture**: this is an Express HTTP API with MVC-like boundaries:
  - `index.js` — app entry, mounts middleware, routes, global error handler.
  - `routes/*.js` — route definitions (see `routes/api.js`).
  - `controllers/*` — HTTP layer: validate request, build DTOs, call services (e.g. `controllers/user.controller.js`).
  - `services/*` — business logic and orchestration; convert repository results into DTOs (e.g. `services/user.service.js`).
  - `repositories/*` — direct DB access using `config/database.js` pool (MySQL via `mysql2/promise`).
  - `dtos/` and `validators/` — input validation and canonical shapes. Keep DTOs and validators in sync.

- **Key files to reference**:
  - `index.js` — app lifecycle, middlewares, and error handling.
  - `routes/api.js` — how controllers are exposed over `/api`.
  - `controllers/user.controller.js` — canonical controller pattern (validate -> DTO -> service -> respond).
  - `services/user.service.js` — service responsibilities and error-throwing semantics.
  - `repositories/user.repository.js` & `config/database.js` — SQL-by-string pattern using `pool.query`.
  - `helpers/response.js` — response conventions (success/error wrapper objects).

- **Dataflow & patterns to follow**:
  - Controllers MUST validate input via `validators/*` before creating DTO objects in `dtos/*`.
  - Services throw Errors for not-found or business failures; controllers map those to HTTP status codes.
  - Repositories return raw DB rows; services convert to DTOs before returning to controllers.
  - SQL strings are used inline in repositories; preserve parameterized queries (use `?` placeholders).

- **Environment & runtime**:
  - Use Node 18+ (see `package.json` `engines`).
  - DB connection uses `config/database.js`: `MYSQL_URI` or `MYSQL_HOST`, `MYSQL_USERNAME`, etc.
  - Run locally: `npm install` then `npm start` (nodemon). Lint: `npm run lint` / `npm run lintfix`.

- **Testing & dev tools**:
  - Project includes `mocha`, `chai` devDeps but no test files yet — if adding tests, follow existing folder layout and prefers top-level `test/`.

- **Conventions and pitfalls observed**:
  - Logging: use `config/logger.js` and `middlewares/logger.middleware.js` for consistent logs.
  - Error handling: there is a global error handler in `index.js`; prefer throwing errors in services, not sending responses from services.
  - DTO/validator pairing: e.g. `validators/users/create-user.validator.js` -> `dtos/users/create-user.dto.js` -> `services/user.service.js` -> `repositories/user.repository.js`.
  - SQL uses simple queries (no ORM) — be cautious when introducing query builders or ORMs without updating repository contracts.

- **When making changes**:
  - Update or add validator + DTO when changing request/response shapes.
  - If you change DB column names, update SQL strings in the appropriate repository only.
  - Add route entries in `routes/api.js` and corresponding controller methods.

- **Examples**:
  - Create flow: `controllers/user.controller.js` (calls `validateCreateUser`) → new `CreateUserDTO` → `userService.createUser(dto)` → `userRepository.create(...)` → `config/database.js` pool.
  - Error flow: service throws `new Error('User not found')` → controller catches and maps to `404`.

If any section should be expanded or you want examples for other resources (e.g. `hanghoa`), tell me which files to reference and I will iterate.
