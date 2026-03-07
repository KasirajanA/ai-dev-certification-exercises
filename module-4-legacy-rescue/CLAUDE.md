# Legacy Code Rescue Challenge

This is intentionally messy "legacy" JavaScript code written in callback style
with no tests, poor error handling, var instead of const/let, and no TypeScript.

## Your Mission (4 steps)

1. **Understand** — Ask Claude to explain what each file does
2. **Add Tests** — Write tests for CURRENT behavior (don't change the code yet!)
3. **Refactor** — Modernize one file at a time (async/await, const/let, TypeScript)
4. **Verify** — All tests still pass after each refactoring step

## Important Rules

- Do NOT refactor before adding tests
- Tests must pass with the CURRENT messy code first
- Refactor ONE file at a time, run tests after each change
- If tests fail after refactoring, revert and try again
