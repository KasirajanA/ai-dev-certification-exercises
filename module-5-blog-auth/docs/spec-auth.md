# Auth Specification: Blog API

## 1. Requirements

### User Stories

**Registration & Login**
- As a visitor, I want to register with my email, password, and name so that I can author posts.
- As a registered user, I want to log in with my email and password so that I can receive a token to authenticate subsequent requests.

**Post Authorship**
- As an authenticated user, I want to create a blog post so that it is associated with my account.
- As a post author, I want to edit my own posts so that I can correct or update them.
- As a post author, I want to delete my own posts so that I can remove content I no longer want published.
- As any user (including unauthenticated visitors), I want to read any published post and its comments so that the blog content remains publicly accessible.

**Access Control**
- As a user, I should be prevented from editing or deleting another user's post so that authors retain control of their content.
- As an unauthenticated visitor, I should be rejected when I attempt to create, edit, or delete a post so that anonymous writes are not permitted.

---

### Acceptance Criteria

| # | Criterion |
|---|-----------|
| AC-1 | `POST /api/auth/register` creates a user and returns a signed JWT + user object (no password field). |
| AC-2 | `POST /api/auth/register` returns `400` when any of `email`, `password`, or `name` is missing. |
| AC-3 | `POST /api/auth/register` returns `409` when the email is already in use. |
| AC-4 | `POST /api/auth/login` returns a signed JWT + user object for valid credentials. |
| AC-5 | `POST /api/auth/login` returns `401` for an unknown email or wrong password. |
| AC-6 | `POST /api/posts` with a valid Bearer token creates a post owned by the authenticated user (`authorId` is set). |
| AC-7 | `POST /api/posts` without a token returns `401`. |
| AC-8 | `PUT /api/posts/:id` by the post's author succeeds; by any other authenticated user returns `403`. |
| AC-9 | `DELETE /api/posts/:id` by the post's author succeeds; by any other authenticated user returns `403`. |
| AC-10 | `GET /api/posts` and `GET /api/posts/:id` succeed without any `Authorization` header. |
| AC-11 | A tampered or expired token returns `401` on any protected route. |

---

## 2. Technical Design

### Data Model

**User**
```
id        Int      PK, autoincrement
email     String   unique
password  String   bcrypt hash (cost factor 10)
name      String
posts     Post[]   relation
createdAt DateTime auto-set on create
```

**Post** (additions only)
```
authorId  Int?     nullable FK → User.id
author    User?    relation
```

`authorId` is nullable at the database level so that any rows created before auth was introduced remain valid. All new posts created through the API carry a non-null `authorId`.

**Prisma schema file:** `prisma/schema.prisma`

---

### API Contracts

#### `POST /api/auth/register`
**Request body**
```json
{ "email": "user@example.com", "password": "secret", "name": "Alice" }
```
**Success `201`**
```json
{
  "token": "<jwt>",
  "user": { "id": 1, "email": "user@example.com", "name": "Alice" }
}
```
**Errors:** `400` (missing fields), `409` (duplicate email), `500` (unexpected)

---

#### `POST /api/auth/login`
**Request body**
```json
{ "email": "user@example.com", "password": "secret" }
```
**Success `200`**
```json
{
  "token": "<jwt>",
  "user": { "id": 1, "email": "user@example.com", "name": "Alice" }
}
```
**Errors:** `400` (missing fields), `401` (wrong credentials), `500` (unexpected)

---

#### `POST /api/posts` — protected
**Request header:** `Authorization: Bearer <token>`
**Request body:** `{ "title": "...", "content": "...", "published": false }`
**Success `201`:** full post object including `authorId`
**Errors:** `400` (missing title/content), `401` (no/bad token)

---

#### `PUT /api/posts/:id` — protected + ownership
**Request header:** `Authorization: Bearer <token>`
**Request body:** any subset of `{ title, content, published }`
**Success `200`:** updated post object
**Errors:** `401` (no/bad token), `403` (not owner), `404` (post not found)

---

#### `DELETE /api/posts/:id` — protected + ownership
**Request header:** `Authorization: Bearer <token>`
**Success `200`:** `{ "message": "Post deleted" }`
**Errors:** `401` (no/bad token), `403` (not owner), `404` (post not found)

---

#### Unchanged public endpoints
| Method | Path | Auth required |
|--------|------|---------------|
| GET | `/api/posts` | No |
| GET | `/api/posts/:id` | No |
| POST | `/api/posts/:id/comments` | No |
| GET | `/health` | No |

---

### JWT Design

| Field | Value |
|-------|-------|
| `sub` | `user.id` (Int) |
| `email` | user's email |
| `name` | user's display name |
| `iat` | issued-at (auto) |
| `exp` | 7 days from issue |
| Algorithm | HS256 (default for `jsonwebtoken`) |
| Secret | `process.env.JWT_SECRET` |

The secret **must** be set in `.env` (which is git-ignored). The middleware will error at verify time if the secret is wrong or absent.

---

### Middleware: `requireAuth`

**File:** `src/middleware/auth.js`

Execution order:
1. Read `Authorization` header; return `401` if missing or not prefixed with `Bearer `.
2. Slice the token string and call `jwt.verify(token, process.env.JWT_SECRET)`.
3. On success, assign the decoded payload to `req.user` and call `next()`.
4. On `JsonWebTokenError` or `TokenExpiredError`, return `401`.

Ownership check (inline in each route handler, not in middleware):
```js
if (existing.authorId !== req.user.sub) {
  return res.status(403).json({ error: "Forbidden" });
}
```

---

## 3. Implementation Plan

- [x] **Install dependencies** — `npm install jsonwebtoken bcryptjs`
- [x] **Update Prisma schema** — add `User` model; add nullable `authorId`/`author` to `Post`
- [x] **Apply schema to database** — `npx prisma db push` (or `migrate dev` in interactive environments)
- [x] **Create `.env`** — set `JWT_SECRET`
- [x] **Create `src/middleware/auth.js`** — `requireAuth` function
- [x] **Create `src/routes/auth.js`** — register and login handlers, mounted at `/api/auth`
- [x] **Update `src/server.js`** — mount auth router; add `requireAuth` + ownership checks to `POST /api/posts`, `PUT /api/posts/:id`, `DELETE /api/posts/:id`
- [x] **Update `test/posts.test.js`** — register test users in `beforeAll`; attach tokens to write requests; add register/login/ownership test cases

---

## 4. Scope Boundaries

The following are explicitly **out of scope** for this implementation:

- **Refresh tokens** — tokens are long-lived (7 days). There is no `/api/auth/refresh` endpoint or token rotation mechanism.
- **Token revocation / logout** — there is no server-side token blacklist. Logging out is handled client-side by discarding the token.
- **Email verification** — users are active immediately upon registration; no confirmation email is sent.
- **Password reset** — there is no forgot-password or reset flow.
- **Role-based access control (RBAC)** — there are no admin, moderator, or other roles. All authenticated users have the same permissions.
- **OAuth / social login** — only email/password authentication is supported.
- **Rate limiting** — login and register endpoints are not rate-limited.
- **Comment ownership** — comments still use a free-text `authorName` field. They are not tied to a `User` account.
- **Pagination or filtering** — `GET /api/posts` returns all published posts with no pagination.
- **HTTPS enforcement** — TLS termination is out of scope; assumed to be handled by a reverse proxy in production.

---

## 5. Success Criteria

### Automated tests
Run `npm test` — all 19 tests must pass, including:
- Auth flow: register (success, duplicate email, missing fields), login (success, wrong password, unknown email)
- Protected routes: `POST /api/posts` returns `401` without a token
- Ownership: `PUT` and `DELETE` return `403` when a different user's token is supplied
- Public routes: `GET /api/posts` and `GET /api/posts/:id` succeed without any token

### Manual smoke test
```bash
# 1. Register
curl -s -X POST http://localhost:3456/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret","name":"Alice"}' | jq .

# 2. Store the token
TOKEN="<paste token from step 1>"

# 3. Create a post (authenticated)
curl -s -X POST http://localhost:3456/api/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Hello","content":"World","published":true}' | jq .

# 4. Read post publicly (no token)
curl -s http://localhost:3456/api/posts | jq .

# 5. Attempt to delete as a different user (expect 403)
OTHER_TOKEN="<token from a second registered user>"
POST_ID=1
curl -s -X DELETE http://localhost:3456/api/posts/$POST_ID \
  -H "Authorization: Bearer $OTHER_TOKEN" | jq .

# 6. Delete as the owner (expect 200)
curl -s -X DELETE http://localhost:3456/api/posts/$POST_ID \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Schema verification
```bash
npx prisma studio
# Confirm: User table exists with email/password/name columns
# Confirm: Post table has authorId column (nullable)
```
