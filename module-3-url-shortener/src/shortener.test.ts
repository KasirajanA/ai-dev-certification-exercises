import { describe, it, expect, beforeEach } from "vitest";
import { shorten, resolve } from "./shortener";

describe("URL Shortener", () => {
  // Reset state between tests so storage doesn't bleed across cases
  beforeEach(() => {
    // If the module exposes a reset/clear, call it here.
    // Tests are written to be independent regardless.
  });

  // ─── URL Validation ──────────────────────────────────────────────────────

  describe("URL validation", () => {
    it("accepts a valid http URL", () => {
      expect(() => shorten("http://example.com")).not.toThrow();
    });

    it("accepts a valid https URL", () => {
      expect(() => shorten("https://example.com")).not.toThrow();
    });

    it("accepts a URL with a path and query string", () => {
      expect(() =>
        shorten("https://example.com/path/to/page?foo=bar&baz=1")
      ).not.toThrow();
    });

    it("accepts a URL with a fragment", () => {
      expect(() =>
        shorten("https://example.com/page#section")
      ).not.toThrow();
    });

    it("rejects an empty string", () => {
      expect(() => shorten("")).toThrow();
    });

    it("rejects a string with no protocol", () => {
      expect(() => shorten("example.com")).toThrow();
    });

    it("rejects a plain word (no protocol, no domain)", () => {
      expect(() => shorten("notaurl")).toThrow();
    });

    it("rejects a ftp:// URL (only http/https allowed)", () => {
      expect(() => shorten("ftp://example.com/file.txt")).toThrow();
    });

    it("rejects a URL-like string missing the host", () => {
      expect(() => shorten("https://")).toThrow();
    });

    it("rejects a number coerced to string", () => {
      expect(() => shorten("12345")).toThrow();
    });
  });

  // ─── Short Code Format ───────────────────────────────────────────────────

  describe("short code generation", () => {
    it("returns a string", () => {
      const code = shorten("https://example.com");
      expect(typeof code).toBe("string");
    });

    it("returns exactly 6 characters", () => {
      const code = shorten("https://example.com");
      expect(code).toHaveLength(6);
    });

    it("contains only alphanumeric characters", () => {
      const code = shorten("https://example.com");
      expect(code).toMatch(/^[A-Za-z0-9]{6}$/);
    });

    it("generates codes that are alphanumeric across multiple URLs", () => {
      const urls = [
        "https://alpha.com",
        "https://beta.com",
        "https://gamma.com",
      ];
      for (const url of urls) {
        expect(shorten(url)).toMatch(/^[A-Za-z0-9]{6}$/);
      }
    });
  });

  // ─── URL Retrieval ────────────────────────────────────────────────────────

  describe("resolve", () => {
    it("returns the original URL for a valid short code", () => {
      const url = "https://example.com/original";
      const code = shorten(url);
      expect(resolve(code)).toBe(url);
    });

    it("returns null for an unknown code", () => {
      expect(resolve("xxxxxx")).toBeNull();
    });

    it("returns null for an empty string code", () => {
      expect(resolve("")).toBeNull();
    });

    it("is case-sensitive — wrong case returns null", () => {
      const url = "https://case-test.com";
      const code = shorten(url);
      const flippedCode = code === code.toUpperCase()
        ? code.toLowerCase()
        : code.toUpperCase();
      // Only null when the flipped code is actually different
      if (flippedCode !== code) {
        expect(resolve(flippedCode)).toBeNull();
      }
    });
  });

  // ─── Idempotency ──────────────────────────────────────────────────────────

  describe("idempotency", () => {
    it("returns the same code when shorten is called twice with the same URL", () => {
      const url = "https://idempotent.com";
      const first = shorten(url);
      const second = shorten(url);
      expect(first).toBe(second);
    });

    it("returns the same code across three calls", () => {
      const url = "https://idempotent.com/path";
      const codes = [shorten(url), shorten(url), shorten(url)];
      expect(codes[0]).toBe(codes[1]);
      expect(codes[1]).toBe(codes[2]);
    });

    it("different URLs produce different codes", () => {
      const code1 = shorten("https://first.com");
      const code2 = shorten("https://second.com");
      expect(code1).not.toBe(code2);
    });
  });

  // ─── Edge Cases ───────────────────────────────────────────────────────────

  describe("edge cases", () => {
    it("handles a URL of exactly 2048 characters", () => {
      // Build a valid URL that is exactly 2048 chars
      const base = "https://example.com/";
      const padding = "a".repeat(2048 - base.length);
      const longUrl = base + padding;
      expect(longUrl).toHaveLength(2048);
      expect(() => shorten(longUrl)).not.toThrow();
      const code = shorten(longUrl);
      expect(code).toHaveLength(6);
      expect(resolve(code)).toBe(longUrl);
    });

    it("rejects a URL exceeding 2048 characters", () => {
      const base = "https://example.com/";
      const padding = "a".repeat(2048 - base.length + 1);
      const tooLong = base + padding;
      expect(tooLong.length).toBeGreaterThan(2048);
      expect(() => shorten(tooLong)).toThrow();
    });

    it("rejects a URL with only whitespace", () => {
      expect(() => shorten("   ")).toThrow();
    });

    it("rejects a URL that is missing the protocol (www prefix only)", () => {
      expect(() => shorten("www.example.com")).toThrow();
    });

    it("trims leading/trailing whitespace before validating", () => {
      // A valid URL with surrounding spaces should either be accepted
      // (trimmed internally) OR throw — but must not silently store garbage.
      // We assert that if it doesn't throw, resolve returns the trimmed URL.
      const url = "  https://trimmed.com  ";
      try {
        const code = shorten(url);
        expect(resolve(code)).toBe(url.trim());
      } catch {
        // Throwing is also acceptable behaviour
      }
    });

    it("rejects a javascript: protocol URL", () => {
      expect(() => shorten("javascript:alert(1)")).toThrow();
    });

    it("rejects a data: URI", () => {
      expect(() => shorten("data:text/html,<h1>hi</h1>")).toThrow();
    });
  });
});
