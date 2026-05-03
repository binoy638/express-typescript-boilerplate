# Express TypeScript Boilerplate

A production-ready Express + TypeScript starter focused on developer experience, type safety, and modern tooling. Drop in your routes and ship.

## Features

- **TypeScript 5.9** — strict mode, `noUncheckedIndexedAccess`, ES2022 target
- **Zod** validation — for environment variables (fail-fast at startup) and request payloads
- **Winston** logging — daily-rotated file logs in production, readable console output in dev
- **@hapi/boom** error formatting — standardized HTTP error responses
- **Graceful shutdown** — SIGTERM/SIGINT handlers, `uncaughtException` / `unhandledRejection` traps
- **Health check** — `GET /health` endpoint for load balancers and orchestrators
- **Request IDs** — `X-Request-Id` header on every request for tracing
- **Rate limiting** — `express-rate-limit` configured on `/api/*` out of the box
- **Security** — Helmet, CORS, body size limits
- **Vitest** — fast tests with `supertest` for API integration tests
- **tsx** — sub-100ms hot reload in development
- **ESLint 9 + Prettier** — flat config with `typescript-eslint`, SonarJS, Unicorn, security, simple-import-sort
- **Husky + lint-staged** — pre-commit checks (typecheck → lint → test)
- **Docker** — production Dockerfile with non-root user, plus dev compose setup

## Quick start

Requires Node.js **>= 24** (Active LTS).

```bash
git clone https://github.com/binoy638/express-typescript-boilerplate.git my-app
cd my-app
cp .env.example .env
npm install
npm run dev
```

Server boots on `http://localhost:8080`. Try:
- `GET /health` — health check
- `GET /api/test/world` — example route returning `{ "message": "Hello world" }`

## Use this as a template

This repo is designed to be cloned and customized. Pick whichever flow you prefer.

**Option 1 — GitHub "Use this template"** (recommended if you fork it on GitHub):
Click **Use this template** at the top of the repo page. GitHub creates a fresh repo with no commit history.

**Option 2 — `degit`** (clone without git history):
```bash
npx degit binoy638/express-typescript-boilerplate my-app
cd my-app
git init && git add . && git commit -m "initial commit"
```

**Option 3 — Manual clone + reset history**:
```bash
git clone https://github.com/binoy638/express-typescript-boilerplate.git my-app
cd my-app
rm -rf .git
git init && git add . && git commit -m "initial commit"
```

**First-time setup checklist:**

1. Update `package.json`: `name`, `description`, `author`, repo URLs.
2. Replace the example `src/modules/test/` with your first real module (see [Adding a new module](#adding-a-new-module)).
3. Edit `.env.example` for the env vars you need, then update the Zod schema in `src/config/env.ts` to match.
4. Update this `README.md` with your project's specifics.
5. If you change the port, update the `PORT` default in `src/config/env.ts`, the docker-compose `ports` mapping, and any references in this README.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start dev server with hot reload (debug port `8181`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Build then run the compiled server |
| `npm run typecheck` | Type-check without emitting |
| `npm run lint` | Run ESLint with auto-fix |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Verify formatting (CI) |
| `npm test` | Run Vitest test suite |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

## Project structure

The codebase uses a **feature-module** layout — each module owns its router, controller, service, and schemas in one folder. Cross-cutting concerns (middlewares, config, utils) live at the top level of `src/`.

```
src/
├── app.ts                              # Express app config (importable in tests)
├── index.ts                            # Server entry point + graceful shutdown
├── config/
│   ├── env.ts                          # Zod-validated env var manager
│   └── logger.ts                       # Winston logger (singleton)
├── middlewares/
│   ├── errorHandler.middleware.ts      # Global error handler (Zod + Boom)
│   ├── notFoundHandler.middleware.ts   # 404 handler
│   ├── rateLimiter.middleware.ts       # Rate limiter for /api/*
│   ├── requestId.middleware.ts         # X-Request-Id header
│   └── validation.middleware.ts        # Zod request validation factory
├── modules/                            # Feature modules (vertical slices)
│   └── test/                           # Example module — replace with your own
│       ├── test.router.ts              # Routes + validateRequest wiring
│       ├── test.controller.ts          # HTTP layer: req → service → res
│       ├── test.service.ts             # Business logic (no Express imports)
│       ├── test.schema.ts              # Zod schemas (single source of truth)
│       └── __tests__/
│           └── test.router.test.ts     # Module integration tests
├── routers/
│   └── health.router.ts                # GET /health (app-level, not a feature)
├── utils/
│   └── asyncHandler.ts                 # Async controller wrapper
└── __tests__/
    └── test.router.test.ts             # App-level tests (health, 404 fallback)
```

## Architecture

**`src/app.ts`** exports the configured Express `app` (all middleware + routers + error handlers registered). This is what tests import via `supertest`.

**`src/index.ts`** imports `app`, calls `listen()`, and wires up graceful shutdown for SIGTERM/SIGINT plus crash handlers for `uncaughtException` and `unhandledRejection`.

**Middleware order** (in `src/app.ts`):

1. `requestId` → `helmet` → `morgan` → `cors` → `json` → `urlencoded`
2. `/health` (no rate limit, no auth — designed for orchestrator probes)
3. `/api/*` — rate limiter applied globally before all API routers
4. `notFoundHandler` → `errorHandler` (registered last)

**Error flow:**

- Controllers throw `boom.badRequest('msg')` (or any `boom.*` helper) and `errorHandler` serializes them to a standardized response
- Validation middleware passes `ZodError` straight to `next(error)`; `errorHandler` returns the issues array in dev and a generic message in prod
- 5xx errors are logged via Winston before responding
- Use `asyncHandler(fn)` to wrap async controllers — rejected promises auto-forward to `errorHandler`

## Environment variables

All env vars are validated by Zod at startup (see `src/config/env.ts`). Missing required vars cause an immediate, descriptive error.

| Variable | Type | Default | Description |
| --- | --- | --- | --- |
| `NODE_ENV` | `'development' \| 'production' \| 'test'` | `development` | Runtime environment |
| `PORT` | number | `8080` | HTTP port to bind |
| `CORS_ORIGIN` | string | `*` | CORS allowed origin |
| `LOG_DIR` | string | `logs` | Log file directory (prod) |
| `LOG_LEVEL` | string | `debug` | Winston log level |
| `MAX_FILE_SIZE` | string | `10m` | Daily log rotation file size |
| `MAX_FILES` | string | `14d` | Daily log retention |

Adding a new variable:

```ts
// src/config/env.ts
const envSchema = z.object({
  // ...existing
  DATABASE_URL: z.string().url(),
});
```

Then access it anywhere with `envManager.getEnv('DATABASE_URL')` — fully typed.

## Adding a new module

Each feature gets its own folder under `src/modules/`. The layering rule is `router → controller → service`: the router handles wiring + validation, the controller is the thin HTTP glue, and the service holds business logic with no Express imports (so it stays unit-testable).

Define the Zod schema once in the module folder; both the router (runtime validation) and the controller (compile-time types) import it — keeping the schema as the single source of truth.

```ts
// src/modules/users/users.schema.ts
import { z } from 'zod';

export const getUserSchema = {
  params: z.object({ id: z.string().uuid() }),
};

export const createUserSchema = {
  body: z.object({ name: z.string(), email: z.string().email() }),
};
```

```ts
// src/modules/users/users.service.ts
// Pure business logic — no Express, easy to unit test.
export const findUserById = (id: string) => {
  return { id, name: 'Jane' };
};

export const createUser = (data: { name: string; email: string }) => {
  return { id: crypto.randomUUID(), ...data };
};
```

```ts
// src/modules/users/users.controller.ts
import type { TypedRequestHandler } from '../../middlewares/validation.middleware';

import { createUserSchema, getUserSchema } from './users.schema';
import * as usersService from './users.service';

export const getUser: TypedRequestHandler<typeof getUserSchema> = (req, res) => {
  const { id } = req.params; // string, not string | undefined
  res.json(usersService.findUserById(id));
};

export const createUser: TypedRequestHandler<typeof createUserSchema> = (req, res) => {
  res.status(201).json(usersService.createUser(req.body));
};
```

```ts
// src/modules/users/users.router.ts
import { Router } from 'express';

import validateRequest from '../../middlewares/validation.middleware';

import * as usersController from './users.controller';
import { createUserSchema, getUserSchema } from './users.schema';

const usersRouter = Router();

usersRouter.get('/:id', validateRequest(getUserSchema), usersController.getUser);
usersRouter.post('/', validateRequest(createUserSchema), usersController.createUser);

export default usersRouter;
```

```ts
// src/app.ts — mount it
import usersRouter from './modules/users/users.router';
app.use('/api/users', usersRouter);
```

`TypedRequestHandler<typeof schema>` infers `req.params`, `req.body`, and `req.query` from the Zod schema. The middleware also writes the parsed values back to `req`, so any Zod transforms (`z.coerce.number()`, defaults, etc.) are visible in the controller.

## Testing

Tests use Vitest + supertest. Import `app` directly — no real TCP server needed.

- **Module tests** live next to the code they test, in `src/modules/<name>/__tests__/`.
- **App-level tests** (health, 404 fallback, app-wide middleware) live in `src/__tests__/`.

```ts
// src/modules/users/__tests__/users.router.test.ts
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../../../app';

describe('GET /api/users/:id', () => {
  it('returns the user', async () => {
    const res = await request(app).get('/api/users/abc');
    expect(res.status).toBe(200);
  });
});
```

Run a single test file:
```bash
npm test -- src/modules/users/__tests__/users.router.test.ts
```

## Docker

**Development** (with bind mount + hot reload):
```bash
docker compose -f docker-compose.dev.yml up
```

**Production** build:
```bash
docker compose up --build
```

The production image runs as the non-root `node` user and uses `npm ci --omit=dev` for reproducible installs.

## License

MIT
