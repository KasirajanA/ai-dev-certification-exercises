# Module 4: Legacy Code Rescue

**Challenge:** Modernize a messy callback-style Node.js app using the 4-step rescue workflow.

## The "Legacy" App

A word frequency analyzer API written in 2019 with:
- Callback-style async code (no async/await)
- `var` everywhere (no const/let)
- No TypeScript
- No tests
- No error handling in some paths
- A security issue (no path validation)
- Redundant code

## Setup

```bash
node src/server.js
# Visit: http://localhost:3457/analyze?file=sample.txt
```

## The 4-Step Rescue

### Step 1: Understand
```bash
claude
> "Read all 3 files in src/ and explain what each one does.
>  Identify any bugs, security issues, or code smells."
```

### Step 2: Add Tests (before ANY changes!)
```bash
> "Write tests for the existing behavior of utils.js — countWords,
>  sortByCount, and formatResults. Tests must pass with the current code."
```

### Step 3: Refactor (one file at a time)
```bash
> "Refactor utils.js: convert to TypeScript, use const/let,
>  replace callbacks with async/await where applicable.
>  Keep all tests passing."
```

### Step 4: Verify
```bash
npm test
# All tests must still pass after each refactoring step
```

## Success Criteria

- All existing behavior preserved (tests prove it)
- At least utils.js modernized (TypeScript, async/await)
- Security issue in server.js identified and documented
- Stretch: modernize all 3 files
