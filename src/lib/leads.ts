/**
 * Server-side validation for POST /api/leads. Pure, so it can be unit
 * tested without D1.
 */

export const MIN_USERS = 1;
export const MAX_USERS = 500;
const MAX_EMAIL_LENGTH = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface LeadInput {
  email: string;
  users: number;
  toolSlugs: string[];
}

export type LeadValidation =
  | { ok: true; lead: LeadInput }
  | { ok: false; error: string };

/** True when the hidden `website` field was filled in (likely a bot). */
export function isHoneypotFilled(body: unknown): boolean {
  if (typeof body !== "object" || body === null) return false;
  const website = (body as Record<string, unknown>).website;
  if (website === undefined || website === null) return false;
  return typeof website !== "string" || website.trim() !== "";
}

/**
 * Validates the request body against the active tool slugs. The email is
 * trimmed and lowercased so the CSV export can dedupe by address.
 */
export function validateLead(body: unknown, activeSlugs: Set<string>): LeadValidation {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "Request body must be a JSON object" };
  }
  const { email, users, toolSlugs, consent } = body as Record<string, unknown>;

  if (typeof email !== "string") {
    return { ok: false, error: "Email is required" };
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(normalizedEmail)) {
    return { ok: false, error: "Enter a valid email address" };
  }

  if (typeof users !== "number" || !Number.isInteger(users) || users < MIN_USERS || users > MAX_USERS) {
    return { ok: false, error: `Users must be a whole number from ${MIN_USERS} to ${MAX_USERS}` };
  }

  if (!Array.isArray(toolSlugs) || toolSlugs.length === 0) {
    return { ok: false, error: "Select at least one app" };
  }
  if (!toolSlugs.every((slug) => typeof slug === "string" && activeSlugs.has(slug))) {
    return { ok: false, error: "Unknown app selected" };
  }

  if (consent !== true) {
    return { ok: false, error: "Consent is required" };
  }

  return {
    ok: true,
    lead: { email: normalizedEmail, users, toolSlugs: [...new Set(toolSlugs as string[])] },
  };
}
