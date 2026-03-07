# Module 6 Exercise: Build Your AI Developer Toolkit

## Overview

In this exercise, you will build a personal AI developer toolkit by creating a `.claude/` directory with custom commands, skills, hooks, and MCP integration for a real Express + TypeScript API project.

The project is a simple Task & User management API. It works, but has several code quality issues, a security problem, and a minor bug — perfect targets for your AI toolkit to find and fix.

## Prerequisites

- Node.js 18+ installed
- Claude Code CLI installed and authenticated
- Basic familiarity with Express and TypeScript

## Setup

```bash
cd module-6-ai-toolkit
npm install
npm run dev    # Starts the API on port 3458
npm test       # Runs the test suite
```

## API Endpoints

| Method | Endpoint         | Description        |
|--------|------------------|--------------------|
| GET    | /api/tasks       | List all tasks     |
| POST   | /api/tasks       | Create a task      |
| PUT    | /api/tasks/:id   | Update a task      |
| DELETE | /api/tasks/:id   | Delete a task      |
| GET    | /api/users       | List all users     |
| POST   | /api/users       | Create a user      |

## Exercise Parts

### Part 1: Custom Commands (30 min)

Create the `.claude/commands/` directory and build reusable prompt commands:

1. **`review.md`** — A code review command that checks for:
   - Security issues (credential exposure, missing auth)
   - Input validation gaps
   - Performance problems (N+1 patterns, unnecessary loops)
   - TypeScript best practices

2. **`fix-issue.md`** — A command that takes an issue description as `$ARGUMENTS` and:
   - Locates the relevant code
   - Proposes a fix
   - Applies the fix
   - Runs tests to verify

3. **`add-endpoint.md`** — A command that takes a resource name as `$ARGUMENTS` and scaffolds:
   - Type definition in `src/types.ts`
   - Route file in `src/routes/`
   - Registration in `src/index.ts`
   - Basic tests

**Verification:** Run each command with Claude Code and confirm they produce useful results against this codebase.

### Part 2: Custom Skills (20 min)

Create `.claude/skills/` to teach Claude about your project patterns:

1. **`project-patterns.md`** — Document the project's conventions:
   - How routes are structured (router pattern, in-memory storage)
   - Type definitions location and style
   - Error handling patterns
   - Test file organization

2. **`api-style-guide.md`** — Define the API style:
   - Response format (JSON with consistent shape)
   - Error response structure
   - Status code usage
   - Naming conventions for endpoints

**Verification:** Ask Claude to add a new `/api/projects` endpoint and confirm it follows your documented patterns.

### Part 3: Hooks (20 min)

Create `.claude/hooks/` with event-driven automations:

1. **Pre-commit hook** — Configure a hook that runs before commits to:
   - Check for `console.log` statements
   - Verify no passwords or secrets in code
   - Run the linter

2. **Post-file-edit hook** — Configure a hook that after editing `.ts` files:
   - Runs type checking on the changed file
   - Suggests related tests if a test file doesn't exist

**Verification:** Make an edit that introduces a `console.log` and verify the hook catches it.

### Part 4: MCP Integration (20 min)

Configure MCP (Model Context Protocol) servers to extend Claude's capabilities:

1. **Filesystem MCP** — Set up the filesystem MCP server scoped to your project directory
2. **Custom context** — Create a `.claude/settings.json` that configures:
   - Allowed tools and permissions
   - Project-specific MCP server connections

**Verification:** Use Claude Code with your MCP configuration and confirm extended capabilities work.

## Evaluation Criteria

| Criterion                        | Points |
|----------------------------------|--------|
| Commands created and functional  | 25     |
| Skills documented and effective  | 20     |
| Hooks configured and working     | 25     |
| MCP integration operational      | 20     |
| Code issues found by toolkit     | 10     |
| **Total**                        | **100** |

## Known Issues in This Codebase

Your toolkit should be able to find these (don't peek until you've tried!):

<details>
<summary>Spoilers — Issues to find</summary>

1. **Security:** GET /api/users returns password fields in the response
2. **Validation:** POST /api/tasks accepts empty or missing fields without validation
3. **Performance:** Task listing does unnecessary per-item processing that could be batched
4. **Bug:** The `slugify` helper doesn't collapse consecutive hyphens ("hello---world" becomes "hello---world" instead of "hello-world")
5. **Code smell:** Inconsistent error handling across routes
6. **Missing:** No input sanitization on user-provided strings

</details>

## Submission

Your completed `.claude/` directory should contain:

```
.claude/
  commands/
    review.md
    fix-issue.md
    add-endpoint.md
  skills/
    project-patterns.md
    api-style-guide.md
  hooks/
    (hook configuration)
  settings.json
```

Zip your entire `.claude/` directory and submit it along with a brief writeup of what your toolkit found and fixed in the codebase.
