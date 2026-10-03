import type { Tool } from "./quote";

export interface Pricing {
  suitePerUserCents: number;
  tools: Tool[];
}

export interface AdminTool extends Tool {
  active: boolean;
  sortOrder: number;
}

export interface AdminPricing {
  suitePerUserCents: number;
  tools: AdminTool[];
}

interface ToolRow {
  slug: string;
  name: string;
  replaces: string;
  category: string;
  per_user_cents: number;
  flat_cents: number;
  active: number;
  sort_order: number;
}

const TOOL_COLUMNS =
  "slug, name, replaces, category, per_user_cents, flat_cents, active, sort_order";

function toTool(row: ToolRow): Tool {
  return {
    slug: row.slug,
    name: row.name,
    replaces: row.replaces,
    category: row.category,
    perUserCents: row.per_user_cents,
    flatCents: row.flat_cents,
  };
}

async function loadSuitePerUserCents(db: D1Database): Promise<number> {
  const row = await db
    .prepare("SELECT value FROM settings WHERE key = 'suite_per_user_cents'")
    .first<{ value: string }>();
  const cents = Number(row?.value);
  if (!Number.isInteger(cents) || cents < 0) {
    throw new Error("suite_per_user_cents setting is missing or invalid");
  }
  return cents;
}

/** Loads active tools (in sort order) and the suite price from D1. */
export async function loadPricing(db: D1Database): Promise<Pricing> {
  const [toolsResult, suitePerUserCents] = await Promise.all([
    db
      .prepare(`SELECT ${TOOL_COLUMNS} FROM tools WHERE active = 1 ORDER BY sort_order, id`)
      .all<ToolRow>(),
    loadSuitePerUserCents(db),
  ]);
  return { suitePerUserCents, tools: toolsResult.results.map(toTool) };
}

/** Loads every tool, including inactive ones, for the admin API. */
export async function loadAdminPricing(db: D1Database): Promise<AdminPricing> {
  const [toolsResult, suitePerUserCents] = await Promise.all([
    db.prepare(`SELECT ${TOOL_COLUMNS} FROM tools ORDER BY sort_order, id`).all<ToolRow>(),
    loadSuitePerUserCents(db),
  ]);
  return {
    suitePerUserCents,
    tools: toolsResult.results.map((row) => ({
      ...toTool(row),
      active: row.active === 1,
      sortOrder: row.sort_order,
    })),
  };
}
