# Module 2: Debug Detective Challenge

**Challenge:** Find and fix 3 bugs in an Express API using Claude Code's 4-step debugging method.

## Setup

```bash
npm install
npm run seed    # Populate database with test data
npm run dev     # Start the server on port 3456
```

## The Bugs

This API has **3 intentional bugs**. Run the test suite to see them:

```bash
# In a separate terminal (while server is running):
npm test
```

You should see all 3 tests fail. Your job: use Claude Code to find and fix each one.

## The 4-Step Method

For each bug:
1. **Reproduce** — Run the failing test, note the error
2. **Isolate** — Ask Claude to trace the code path
3. **Understand** — Find the root cause
4. **Fix** — Implement the fix and verify the test passes

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/users | List all users |
| POST | /api/users | Create user (BUG #1) |
| GET | /api/users/:id/stats | User stats (BUG #2) |
| GET | /api/posts/feed | Posts with authors (BUG #3) |

## Success Criteria

All 3 tests pass after your fixes:
```bash
npm test
# Should show: PASS for all 3 tests
```
