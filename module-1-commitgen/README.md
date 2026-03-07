# Module 1: CommitGen — Challenge Exercise

**Challenge:** Build a git commit message generator using Claude Code and CRISP.

## Setup

```bash
npm install
claude
```

## Your Task

Write a **CRISP prompt** and use Claude Code to build a CLI tool that:

1. Reads `git diff --staged` to see staged changes
2. Generates a [Conventional Commit](https://www.conventionalcommits.org/) message
3. Lets you accept, edit, or regenerate
4. Commits with the final message

Follow the exercise instructions in the certification platform (Module 1 → Unit 3 → "Challenge: Build a Git Commit Message Generator").

## Test It

```bash
# Make a change to this project
echo "# CommitGen" > NOTES.md
git add NOTES.md

# Run your tool
npx tsx src/index.ts
# Should suggest: "docs: add project notes"
```

## Conventional Commits Format

```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Examples:
  feat(auth): add login page with Google OAuth
  fix(api): handle null response from weather service
  docs: update README with setup instructions
```
