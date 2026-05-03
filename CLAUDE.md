# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Start dev server with hot reload (tsx watch, debug port 8181)
npm run build            # Compile TypeScript to dist/
npm run typecheck        # Type-check without emitting
npm run lint             # ESLint with auto-fix on src/
npm run format           # Prettier format all TS/JSON files
npm run format:check     # Check formatting without writing
npm test                 # Run Vitest tests once
npm run test:watch       # Vitest in watch mode
npm run test:coverage    # Vitest with coverage report
```

Run a single test file:
```bash
npm test -- src/modules/test/__tests__/test.router.test.ts
npm test -- --testNamePattern="test name pattern"
```

Pre-commit hook runs automatically: `typecheck → lint-staged → vitest run`

## Architecture

**Entry points**:
- `src/app.ts` — creates and exports the configured Express `app` (all middleware + routers + error handlers). Import this in tests via supertest without starting a real server.
- `src/index.ts` — imports `app`, calls `listen()`, handles graceful shutdown and process signals.

**Middleware order** (registered in `src/app.ts`):
1. `requestId` → `helmet` → `morgan` → `cors` → `json` → `urlencoded`
2. `/api` routes: `apiLimiter` (rate limiter) applied globally before all `/api/*` routers
3. Global: `notFoundHandler` → `errorHandler` (registered last)

**Request validation**: `src/middlewares/validation.middleware.ts` — wraps Zod schemas; call `validateRequest({ body, params, query })` inline on routes. Passes the original `ZodError` straight to `next()` so `errorHandler` produces field-level detail in dev and a generic message in prod.

**Error handling**: `src/middlewares/errorHandler.middleware.ts` — handles `ZodError` (→ 400) and `@hapi/boom` errors. Throw `boom.notFound()`, `boom.badRequest()`, etc. from controllers. 5xx errors are logged via Winston before responding.

**Async controllers**: Express 5 forwards rejected promises from route handlers to the error middleware automatically — `throw boom.notFound()` from any async controller and it works. The `src/utils/asyncHandler.ts` wrapper is kept for non-route async middleware (where Express 5's auto-forwarding doesn't apply) but is no longer needed on controllers.

**Environment config**: `src/config/env.ts` — Zod-validated `EnvManager` singleton. Add new env vars to the Zod schema here; access via `envManager.getEnv('KEY')`. Fails fast at startup if required vars are missing. Template in `.env.example`.

**Logging**: `src/config/logger.ts` — Winston singleton. Dev: console only. Prod: console + daily-rotated files. Configured via `LOG_DIR`, `LOG_LEVEL`, `MAX_FILE_SIZE`, `MAX_FILES` env vars (all optional with defaults). Import `logger` and use `logger.info()`, `logger.error()`, etc.

**Feature modules**: Each feature lives in `src/modules/<name>/` with co-located router, controller, service, and schema. The layering rule is `router → controller → service`: the router wires routes + `validateRequest`, the controller is thin HTTP glue (parse `req` → call service → send `res`), and the service holds business logic with no Express imports (so it stays unit-testable). App-level routes that aren't features (e.g. `health`) live in `src/routers/`.

**Adding a new module**:
1. Create `src/modules/foo/foo.schema.ts` (Zod schemas for body/query/params)
2. Create `src/modules/foo/foo.service.ts` (pure business logic)
3. Create `src/modules/foo/foo.controller.ts` (uses `TypedRequestHandler<typeof schema>` for typed `req`)
4. Create `src/modules/foo/foo.router.ts` with `Router()` and `validateRequest(schema)`
5. Mount in `src/app.ts`: `app.use('/api/foo', fooRouter)`
6. Tests go in `src/modules/foo/__tests__/`

## Key Conventions

- **Imports**: `simple-import-sort` is enforced — ESLint auto-fixes import order on save/lint.
- **Prettier**: single quotes, 120 char print width, trailing commas (ES5), no arrow-function parens for single args.
- **Tests**: module tests live in `src/modules/<name>/__tests__/`; app-level tests (health, 404 fallback) live in `src/__tests__/`. Use `supertest` + `import app from '../../../app'` for route tests.
- **TypeScript**: strict mode + `noUncheckedIndexedAccess`; ES2022 target. Node ≥24 (Active LTS).
- **ESLint**: flat config (`eslint.config.mjs`), ESLint 9 + `typescript-eslint` + sonarjs/unicorn/security/import-sort. Prettier runs separately (not as an ESLint plugin).
- **Docker**: `docker-compose.yml` for production, `docker-compose.dev.yml` for development.
- **process.exit**: add `/* eslint-disable unicorn/no-process-exit */` in files that legitimately call it (server startup/shutdown).
- **Unused params**: prefix with `_` (e.g. `_next`) to satisfy `@typescript-eslint/no-unused-vars`.
