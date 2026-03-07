# Debug Detective Challenge

Express + SQLite API with 3 intentional bugs for debugging practice.

## Stack
- Express 4 + TypeScript
- better-sqlite3 for database
- No ORM — raw SQL queries

## Project Structure
- `src/db.ts` — Database setup and queries
- `src/server.ts` — Express routes and server
- `src/seed.ts` — Seeds the database with test data
- `src/test.ts` — Simple test script to reveal the bugs

## Known Issues
This app has **3 intentional bugs**. Your job is to find and fix them
using the 4-step debugging method: Reproduce -> Isolate -> Understand -> Fix.

Do NOT read this file for hints — use Claude Code's tools to investigate!
