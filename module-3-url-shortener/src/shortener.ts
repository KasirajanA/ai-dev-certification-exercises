// URL Shortener Module
//
// TODO: Use Claude Code with TDD to build this!
//
// Requirements:
// 1. Accept a valid URL and return a 6-character short code
// 2. Reject invalid URLs with an error
// 3. Retrieve the original URL by short code
// 4. Return the same short code for the same URL (idempotent)
// 5. Handle edge cases: empty string, null, very long URLs (up to 2048 chars)
//
// TDD Workflow:
// Step 1: Ask Claude to write tests FIRST (src/shortener.test.ts)
// Step 2: Run tests — they should all FAIL (RED)
// Step 3: Ask Claude to implement this module to pass the tests (GREEN)
// Step 4: Ask Claude to refactor (REFACTOR) — keep tests passing
//
// Example usage:
//   const code = shorten("https://example.com/very/long/path");
//   // Returns: "aB3xY9"
//
//   const url = resolve("aB3xY9");
//   // Returns: "https://example.com/very/long/path"

export function shorten(url: string): string {
  throw new Error("Not implemented — write tests first!");
}

export function resolve(code: string): string | null {
  throw new Error("Not implemented — write tests first!");
}
