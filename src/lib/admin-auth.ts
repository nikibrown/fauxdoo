/** Extracts the token from an `Authorization: Bearer <token>` header. */
export function bearerToken(header: string | null): string | null {
  const match = header?.match(/^Bearer\s+(\S+)\s*$/i);
  return match ? match[1] : null;
}

/**
 * Constant-time token comparison. Hashing both values first gives
 * equal-length inputs, so neither the content nor the length of the
 * configured token leaks through timing.
 */
export async function tokensMatch(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [hashA, hashB] = await Promise.all(
    [a, b].map((value) => crypto.subtle.digest("SHA-256", encoder.encode(value))),
  );
  const bytesA = new Uint8Array(hashA);
  const bytesB = new Uint8Array(hashB);
  let diff = 0;
  for (let i = 0; i < bytesA.length; i++) diff |= bytesA[i] ^ bytesB[i];
  return diff === 0;
}

/**
 * Returns an error response if the request isn't authorized, or null if it
 * is. Fails closed: a missing ADMIN_TOKEN returns 503, never open access.
 */
export async function checkAdminAuth(
  request: Request,
  adminToken: string | undefined,
): Promise<Response | null> {
  if (!adminToken) {
    return Response.json({ error: "Admin access is not configured" }, { status: 503 });
  }
  const token = bearerToken(request.headers.get("Authorization"));
  if (!token || !(await tokensMatch(token, adminToken))) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "WWW-Authenticate": "Bearer" } },
    );
  }
  return null;
}

/**
 * Webflow Cloud environment variables arrive on the Cloudflare env;
 * process.env is a fallback in case they're only exposed there.
 */
export function getAdminToken(env: { ADMIN_TOKEN?: string }): string | undefined {
  return env.ADMIN_TOKEN || process.env.ADMIN_TOKEN || undefined;
}
