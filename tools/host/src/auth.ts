/**
 * `tools/host/src/auth.ts` — the dev carrier's OPT-IN token gate (lane
 * L-AUTH, wave-24 MP path).
 *
 * The standing localhost-no-auth ruling (DECISIONS-PENDING, BY RULING
 * @af55b61 / ADR-0017) is NOT reversed: with no `auth` option the carrier
 * behaves exactly as before — every connection is accepted, the posture is
 * byte-for-byte legacy. This file is the hardening knob a dev flips ON
 * deliberately: one shared secret every seat must present on its connect URL.
 *
 * WHY A URL QUERY AND NOT HEADERS OR THE SUBPROTOCOL SLOT:
 *  - a browser `new WebSocket(url)` cannot set request headers at all, and
 *  - the `Sec-WebSocket-Protocol` slot is the wire-negotiation channel the
 *    hh-coop-transport family reserves for its own version tag — a token
 *    parked there would collide with the day subprotocol negotiation lands.
 *    (Disk-state honesty, pinned in test/auth.host.test.ts: the browser twin
 *    `apps/proto/src/transport/wsClientPort.ts` today connects with a bare
 *    `new WebSocket(url)` — the slot is UNUSED so far, so reserving it is
 *    forward-safe, not a workaround for a present occupant.)
 * So the token rides `?token=SECRET`, verified at handshake time — BEFORE
 * the port attaches any message listener, so the hub never sees a byte from
 * an unauthenticated socket.
 *
 * Constant-time by construction: `timingSafeEqual` requires equal-length
 * buffers, and comparing raw tokens leaks length even under it; hashing both
 * sides to sha256 digests first makes the comparison length-blind. Node-only
 * crypto is legitimate HERE (host side): the transportLaw scan walks
 * tools/transport/src + tools/relay/src only — verified by reading its scope.
 *
 * Closed failure vocabulary: anything outside AUTH_FAILURE_REASONS is a bug,
 * never a verdict. Pure functions (Law 3): bytes/URL in, verdict out.
 */

import { createHash, timingSafeEqual } from "node:crypto";

/** The ONLY three refusals the gate can return (plus pass = null). */
export const AUTH_FAILURE_REASONS = Object.freeze([
  "missing-token",
  "ambiguous-token",
  "bad-token",
] as const);

export type AuthFailureReason = (typeof AUTH_FAILURE_REASONS)[number];

/** One-token / no-token / contradictory-token — the closed reading of a URL's
 *  `token` arms. Ambiguity (repeated key) is its own reason: silently picking
 *  one arm would make two different URLs authenticate the same socket. */
export type TokenParam =
  | { readonly present: false }
  | { readonly present: "ambiguous" }
  | { readonly present: true; readonly value: string };

/** Origin-form request URL ("/path?x=1") → the closed token reading. A URL
 *  this cannot parse has no token in it: the missing arm answers. */
export function parseTokenParam(requestUrl: string): TokenParam {
  const q = requestUrl.indexOf("?");
  if (q === -1) return { present: false };
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(requestUrl.slice(q + 1));
  } catch {
    return { present: false };
  }
  const values = params.getAll("token");
  if (values.length === 0) return { present: false };
  if (values.length > 1) return { present: "ambiguous" };
  return { present: true, value: values[0] as string };
}

function digest(text: string): Buffer {
  return createHash("sha256").update(text, "utf8").digest();
}

/** `null` = accepted; otherwise the closed reason. An empty presented value
 *  ("?token=") is PRESENT-BUT-WRONG (bad-token), not missing — the socket
 *  tried and failed, which is the honest telemetry. */
export function verifyToken(secret: string, presented: TokenParam): AuthFailureReason | null {
  if (presented.present === false) return "missing-token";
  if (presented.present === "ambiguous") return "ambiguous-token";
  return timingSafeEqual(digest(secret), digest(presented.value)) ? null : "bad-token";
}

/** The carrier-facing gate: request URL in, closed verdict out. An empty
 *  secret is a config bug — fail loud at boot, never accept silently. */
export function createTokenGate(secret: string): (requestUrl: string) => AuthFailureReason | null {
  if (typeof secret !== "string" || secret.length === 0) {
    throw new RangeError(
      "host[auth-secret]: auth.secret must be a non-empty string — omit the auth option entirely for the standing localhost-no-auth posture",
    );
  }
  return (requestUrl: string) => verifyToken(secret, parseTokenParam(requestUrl));
}
