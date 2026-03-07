# Module 1: TaskMaster — CRISP Exercise

**Exercise:** Use the CRISP framework to add a priority feature to this task manager.

## Setup

```bash
npm install
```

## Verify It Works

```bash
npx tsx src/index.ts add "Buy milk"
npx tsx src/index.ts add "Read a book"
npx tsx src/index.ts list
npx tsx src/index.ts done 1
npx tsx src/index.ts list
npx tsx src/index.ts delete 2
```

## Your Task

Open Claude Code and use a **CRISP prompt** to add a `priority` feature (LOW / MEDIUM / HIGH) to tasks. Follow the exercise instructions in the certification platform (Module 1 → Unit 3 → "Guided Exercise: Add Priority to TaskMaster").

## Project Structure

```
src/
├── index.ts           ← CLI entry point (commander)
├── db.ts              ← SQLite database + Task interface
└── commands/
    ├── add.ts         ← Add a new task
    ├── list.ts        ← List all tasks
    ├── done.ts        ← Mark task as done
    └── delete.ts      ← Delete a task
```
