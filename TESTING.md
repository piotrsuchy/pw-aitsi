# Testing

## Stack

[Vitest](https://vitest.dev/) — fast, ESM-native test runner. No database or running server required; all external dependencies (Prisma, NextAuth) are mocked.

## Running tests

```bash
# One-shot run (CI / before committing)
cd web/
npm test

# Watch mode — re-runs affected tests on file save
cd web/
npm run test:watch
```

Both commands must be run from the `web/` directory.

## What is tested

| File | Route(s) covered |
|---|---|
| `tests/api/photos.test.ts` | `GET /api/photos`, `POST /api/photos` |
| `tests/api/photos-id.test.ts` | `GET /api/photos/[id]`, `PATCH /api/photos/[id]`, `DELETE /api/photos/[id]` |
| `tests/api/users.test.ts` | `PATCH /api/users/[id]/role`, `PATCH /api/users/[id]/block` |
| `tests/api/categories.test.ts` | `GET /api/categories` |

Each file covers:

- **Auth guards** — 401/403 responses for unauthenticated, blocked, or wrong-role callers
- **Input validation** — 400 responses for missing or invalid fields
- **Happy paths** — correct status codes and response shapes
- **Business logic** — pagination math, year-range filters, category tree building

## How mocking works

Route handlers are imported and called directly as functions. Two modules are mocked per test file:

- **`@/lib/auth`** — `auth()` returns a controlled session (or `null`) via `vi.fn()`
- **`@/lib/db`** — the Prisma client is replaced with `vi.fn()` stubs; no database needed
- **`fs/promises`** — mocked in `photos-id.test.ts` so DELETE does not touch the filesystem

Helper functions live in `tests/helpers.ts`:

```ts
makeReq(url, { method, body })   // builds a NextRequest
makeParams({ id: "..." })         // wraps route params as a Promise (Next.js 15+ style)
makeSession({ role, blocked, id }) // returns a minimal session object
```

## Adding a new test

1. Create `tests/api/your-route.test.ts`.
2. Add `vi.mock` calls for `@/lib/auth` and `@/lib/db` at the top.
3. Import the route handler functions (e.g. `import { GET } from "@/app/api/your-route/route"`).
4. Use `makeReq` / `makeParams` / `makeSession` from `../helpers`.
5. Assert on `res.status` and `await res.json()`.
