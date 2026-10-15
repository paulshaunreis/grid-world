export const MAX_REQUEST_BODY_BYTES = 16_384;

export type ModerationResult = {
  decision: "ALLOW" | "REVIEW" | "BLOCK";
  severity: "info" | "notice" | "warning" | "critical";
  reasons: string[];
  matched_rules: string[];
  user_message: string;
};

export function reviewFallback(): ModerationResult {
  return {
    decision: "REVIEW",
    severity: "notice",
    reasons: ["Invalid moderation response; human review required."],
    matched_rules: [],
    user_message: "This content has been queued for review.",
  };
}

export function validateModerationResult(value: unknown): ModerationResult {
  const decisions = new Set(["ALLOW", "REVIEW", "BLOCK"]);
  const severities = new Set(["info", "notice", "warning", "critical"]);
  if (!value || typeof value !== "object" || Array.isArray(value)) return reviewFallback();
  const v = value as Record<string, unknown>;
  const validStringArray = (x: unknown) =>
    Array.isArray(x) && x.length <= 10 && x.every((item) => typeof item === "string" && item.length <= 240);
  if (
    typeof v.decision !== "string" || !decisions.has(v.decision) ||
    typeof v.severity !== "string" || !severities.has(v.severity) ||
    !validStringArray(v.reasons) || !validStringArray(v.matched_rules) ||
    typeof v.user_message !== "string" || v.user_message.length > 500
  ) return reviewFallback();
  return {
    decision: v.decision as ModerationResult["decision"],
    severity: v.severity as ModerationResult["severity"],
    reasons: v.reasons as string[],
    matched_rules: v.matched_rules as string[],
    user_message: v.user_message,
  };
}

export async function readJsonBody(
  request: Request,
  maxBytes = MAX_REQUEST_BODY_BYTES,
): Promise<{ ok: true; body: Record<string, unknown> } | { ok: false; status: 400 | 413; error: "invalid_request" | "invalid_json" | "request_too_large" }> {
  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null) {
    const length = Number(declaredLength);
    if (Number.isFinite(length) && length > maxBytes) {
      try { await request.body?.cancel(); } catch { /* best-effort cancellation */ }
      return { ok: false, status: 413, error: "request_too_large" };
    }
  }
  if (!request.body) return { ok: false, status: 400, error: "invalid_request" };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        try { await reader.cancel(); } catch { /* best-effort cancellation */ }
        return { ok: false, status: 413, error: "request_too_large" };
      }
      chunks.push(value);
    }
  } catch {
    try { await reader.cancel(); } catch { /* best-effort cancellation */ }
    return { ok: false, status: 400, error: "invalid_request" };
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let raw: string;
  try {
    raw = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return { ok: false, status: 400, error: "invalid_json" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, status: 400, error: "invalid_json" };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, status: 400, error: "invalid_request" };
  }
  return { ok: true, body: parsed as Record<string, unknown> };
}
