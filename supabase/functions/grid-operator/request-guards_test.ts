import {
  MAX_REQUEST_BODY_BYTES,
  readJsonBody,
  reviewFallback,
  validateModerationResult,
} from "./request-guards.ts";

function assertEquals(actual: unknown, expected: unknown) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Assertion failed. Actual: ${JSON.stringify(actual)} Expected: ${JSON.stringify(expected)}`);
  }
}

Deno.test("accepts valid JSON objects within the body limit", async () => {
  const result = await readJsonBody(new Request("https://example.test", {
    method: "POST",
    body: JSON.stringify({ action: "chat", message: "hello" }),
  }));
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.body.message, "hello");
});

Deno.test("rejects malformed JSON with a controlled 400 response", async () => {
  const result = await readJsonBody(new Request("https://example.test", { method: "POST", body: "{" }));
  assertEquals(result, { ok: false, status: 400, error: "invalid_json" });
});

Deno.test("rejects non-object JSON payloads", async () => {
  const result = await readJsonBody(new Request("https://example.test", { method: "POST", body: "[]" }));
  assertEquals(result, { ok: false, status: 400, error: "invalid_request" });
});

Deno.test("rejects invalid UTF-8 with a controlled 400 response", async () => {
  const result = await readJsonBody(new Request("https://example.test", {
    method: "POST",
    body: new Uint8Array([0xff, 0xfe]),
  }));
  assertEquals(result, { ok: false, status: 400, error: "invalid_json" });
});

Deno.test("rejects oversized bodies when content-length is absent", async () => {
  const body = JSON.stringify({ payload: "x".repeat(MAX_REQUEST_BODY_BYTES) });
  const result = await readJsonBody(new Request("https://example.test", { method: "POST", body }));
  assertEquals(result, { ok: false, status: 413, error: "request_too_large" });
});

Deno.test("validates allowed moderation decisions and severities", () => {
  const valid = {
    decision: "ALLOW",
    severity: "info",
    reasons: [],
    matched_rules: [],
    user_message: "Allowed.",
  };
  assertEquals(validateModerationResult(valid), valid);
});

Deno.test("fails closed for invalid moderation fields and oversized arrays", () => {
  assertEquals(validateModerationResult({
    decision: "MAYBE",
    severity: "unknown",
    reasons: ["x".repeat(241)],
    matched_rules: [],
    user_message: "bad",
  }), reviewFallback());
});

Deno.test("fails closed for non-object moderation responses", () => {
  assertEquals(validateModerationResult(null), reviewFallback());
  assertEquals(validateModerationResult([]), reviewFallback());
});
