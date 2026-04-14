import { customAlphabet } from "nanoid";

const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const MAX_URL_LENGTH = 2048;
const DEFAULT_CODE_LENGTH = 6;
const generate = customAlphabet(ALPHABET);

const urlToCode = new Map<string, string>();
const codeToUrl = new Map<string, string>();

export function validate(raw: string): string {
  const url = raw.trim();

  if (!url) {
    throw new Error("URL must not be empty");
  }

  if (url.length > MAX_URL_LENGTH) {
    throw new Error(`URL must not exceed ${MAX_URL_LENGTH} characters`);
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`URL protocol must be http or https, got: ${parsed.protocol}`);
  }

  if (!parsed.hostname) {
    throw new Error("URL must have a hostname");
  }

  return url;
}

export function shorten(url: string, codeLength = DEFAULT_CODE_LENGTH): string {
  const normalized = validate(url);

  const existing = urlToCode.get(normalized);
  if (existing !== undefined) {
    return existing;
  }

  const code = generate(codeLength);
  urlToCode.set(normalized, code);
  codeToUrl.set(code, normalized);
  return code;
}

export function resolve(code: string): string | null {
  return codeToUrl.get(code) ?? null;
}
