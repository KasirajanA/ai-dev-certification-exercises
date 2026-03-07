# Module 5 Exercise: Adding JWT Authentication to a Blog API

## Overview

You have a working Express + Prisma blog API with **no authentication**. Anyone can create, edit, or delete any post. Your task is to plan and implement JWT-based authentication using Claude Code's Plan Mode and Spec Kit workflow.

## The 4-Phase Approach

### Phase 1: Explore

Use Claude Code to understand the existing codebase before making any changes.

```
> Explore this codebase. What does the API do? What models exist? How are routes structured?
```

Understand the current state:
- What routes exist and what do they do?
- What database models are defined?
- Where are there security gaps?

### Phase 2: Spec

Create a specification for the authentication system before writing any code. Use Plan Mode (Shift+Tab to toggle) to have Claude Code help you think through the design.

Your spec should cover:
- A new `User` model (email, password hash, name)
- Registration endpoint (`POST /api/auth/register`)
- Login endpoint (`POST /api/auth/login`) that returns a JWT
- Auth middleware that validates JWT tokens
- Which routes need protection and which stay public
- How posts relate to users (author relationship)

### Phase 3: Implement

With your spec in hand, use Claude Code to implement the authentication system step by step:

1. Add the User model to the Prisma schema and link posts to users
2. Install dependencies (`jsonwebtoken`, `bcryptjs`)
3. Create auth middleware
4. Create auth routes (register, login)
5. Protect routes that modify data (POST, PUT, DELETE)
6. Ensure users can only edit/delete their own posts

### Phase 4: Verify

Run the existing tests to make sure nothing is broken, then add new tests:

```bash
npm test
```

Verify that:
- Unauthenticated users can still read posts and comments
- Unauthenticated users cannot create, edit, or delete posts
- Authenticated users can only modify their own posts
- Registration and login work correctly
- Invalid tokens are rejected

## Getting Started

```bash
# Install dependencies
npm install

# Set up the database
npx prisma db push

# Seed sample data
npx prisma db seed

# Start the server
node src/server.js

# Run tests
npm test
```

The server runs on **http://localhost:3456**.

## Current API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/posts | List all published posts |
| GET | /api/posts/:id | Get a post with its comments |
| POST | /api/posts | Create a new post |
| PUT | /api/posts/:id | Update a post |
| DELETE | /api/posts/:id | Delete a post |
| POST | /api/posts/:id/comments | Add a comment to a post |
| GET | /health | Health check |

## Success Criteria

When you are done, the following should be true:

1. Public routes (GET posts, GET post by id, health check) work without auth
2. `POST /api/auth/register` creates a new user and returns a JWT
3. `POST /api/auth/login` authenticates a user and returns a JWT
4. Creating, updating, and deleting posts requires a valid JWT
5. Users can only update or delete their own posts
6. All existing tests still pass (with appropriate modifications)
7. New tests cover authentication flows
