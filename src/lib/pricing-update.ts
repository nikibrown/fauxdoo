/**
 * Validation for PUT /api/admin/pricing. Pure, so it can be unit tested
 * without D1. Only existing tools can be updated; this does not create tools.
 */

const MAX_CENTS = 100_000_000; // $1,000,000: a sanity cap, not a business rule
const MAX_NAME_LENGTH = 100;

export interface ToolUpdate {
  slug: string;
  name?: string;
  perUserCents?: number;
  flatCents?: number;
  active?: boolean;
  sortOrder?: number;
}

export interface PricingUpdate {
  suitePerUserCents?: number;
  tools: ToolUpdate[];
}

export type PricingUpdateValidation =
  { ok: true; update: PricingUpdate } | { ok: false; error: string };

function isCents(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0 && (value as number) <= MAX_CENTS;
}

function isSortOrder(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}

export function validatePricingUpdate(
  body: unknown,
  knownSlugs: Set<string>,
): PricingUpdateValidation {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "Request body must be a JSON object" };
  }
  const { suitePerUserCents, tools } = body as Record<string, unknown>;

  if (suitePerUserCents === undefined && tools === undefined) {
    return { ok: false, error: "Nothing to update: send suitePerUserCents and/or tools" };
  }
  if (suitePerUserCents !== undefined && !isCents(suitePerUserCents)) {
    return { ok: false, error: "suitePerUserCents must be a non-negative integer (cents)" };
  }
  if (tools !== undefined && !Array.isArray(tools)) {
    return { ok: false, error: "tools must be an array" };
  }

  const updates: ToolUpdate[] = [];
  const seen = new Set<string>();
  for (const item of (tools as unknown[] | undefined) ?? []) {
    if (typeof item !== "object" || item === null) {
      return { ok: false, error: "Each tool update must be an object" };
    }
    const { slug, name, perUserCents, flatCents, active, sortOrder } = item as Record<
      string,
      unknown
    >;

    if (typeof slug !== "string" || !knownSlugs.has(slug)) {
      return { ok: false, error: `Unknown tool slug: ${String(slug)}` };
    }
    if (seen.has(slug)) {
      return { ok: false, error: `Duplicate tool slug: ${slug}` };
    }
    seen.add(slug);

    const update: ToolUpdate = { slug };
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "" || name.trim().length > MAX_NAME_LENGTH) {
        return { ok: false, error: `${slug}: name must be 1-${MAX_NAME_LENGTH} characters` };
      }
      update.name = name.trim();
    }
    if (perUserCents !== undefined) {
      if (!isCents(perUserCents))
        return { ok: false, error: `${slug}: perUserCents must be a non-negative integer (cents)` };
      update.perUserCents = perUserCents;
    }
    if (flatCents !== undefined) {
      if (!isCents(flatCents))
        return { ok: false, error: `${slug}: flatCents must be a non-negative integer (cents)` };
      update.flatCents = flatCents;
    }
    if (active !== undefined) {
      if (typeof active !== "boolean")
        return { ok: false, error: `${slug}: active must be true or false` };
      update.active = active;
    }
    if (sortOrder !== undefined) {
      if (!isSortOrder(sortOrder))
        return { ok: false, error: `${slug}: sortOrder must be a non-negative integer` };
      update.sortOrder = sortOrder;
    }
    updates.push(update);
  }

  return {
    ok: true,
    update: { ...(suitePerUserCents !== undefined && { suitePerUserCents }), tools: updates },
  };
}
