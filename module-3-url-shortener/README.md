# Module 3: URL Shortener — TDD Exercise

**Challenge:** Build a URL shortener using Test-Driven Development with Claude Code.

## Setup

```bash
npm install
```

## The TDD Cycle

### Phase 1: RED (Write Failing Tests)
```bash
# Ask Claude to write tests FIRST
claude
> "Write comprehensive Vitest tests for the URL shortener in src/shortener.test.ts.
>  Cover valid URLs, invalid URLs, short code format, idempotency, retrieval,
>  and edge cases. Do NOT implement the shortener — tests only."

# Run tests — they should all FAIL
npm test
```

### Phase 2: GREEN (Implement to Pass)
```bash
> "Now implement src/shortener.ts to pass all the tests.
>  Use nanoid for code generation. Validate with the URL constructor."

npm test
# Should all PASS
```

### Phase 3: REFACTOR (Improve)
```bash
> "Refactor the shortener: extract validation, add configurable code length.
>  Keep ALL tests passing."

npm test
# Should still PASS
```

## Success Criteria

- Tests were written BEFORE implementation
- All tests pass
- Edge cases covered (empty, null, malformed, very long URLs)
- Code is clean after refactoring
