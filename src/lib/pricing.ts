import type { Tool } from "./quote";

export interface Pricing {
  suitePerUserCents: number;
  tools: Tool[];
}

interface ToolRow {
  slug: string;
  name: string;
  replaces: string;
  category: string;
  per_user_cents: number;
  flat_cents: number;
}

/** Loads active tools (in sort order) and the suite price from D1. */
export async function loadPricing(db: D1Database): Promise<Pricing> {
  const [toolsResult, suiteRow] = await Promise.all([
    db
      .prepare(
        `SELECT slug, name, replaces, category, per_user_cents, flat_cents
         FROM tools WHERE active = 1 ORDER BY sort_order, id`
      )
      .all<ToolRow>(),
    db
      .prepare("SELECT value FROM settings WHERE key = 'suite_per_user_cents'")
      .first<{ value: string }>(),
  ]);

  const suitePerUserCents = Number(suiteRow?.value);
  if (!Number.isInteger(suitePerUserCents) || suitePerUserCents < 0) {
    throw new Error("suite_per_user_cents setting is missing or invalid");
  }

  return {
    suitePerUserCents,
    tools: toolsResult.results.map((row) => ({
      slug: row.slug,
      name: row.name,
      replaces: row.replaces,
      category: row.category,
      perUserCents: row.per_user_cents,
      flatCents: row.flat_cents,
    })),
  };
}
