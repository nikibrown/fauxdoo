import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/admin-auth";
import { loadAdminPricing } from "@/lib/pricing";
import { validatePricingUpdate, type ToolUpdate } from "@/lib/pricing-update";

/**
 * GET /api/admin/pricing  → all tools (including inactive) + suite price
 * PUT /api/admin/pricing  → update prices, names, active flags, sort order
 *
 * Requires `Authorization: Bearer <ADMIN_TOKEN>`.
 */

// Maps update fields to columns. Column names never come from the request.
const TOOL_COLUMNS: Record<Exclude<keyof ToolUpdate, "slug">, string> = {
  name: "name",
  perUserCents: "per_user_cents",
  flatCents: "flat_cents",
  active: "active",
  sortOrder: "sort_order",
};

export async function GET(request: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const authError = await checkAdminAuth(request, env.ADMIN_TOKEN);
    if (authError) return authError;

    return NextResponse.json(await loadAdminPricing(env.DB));
  } catch (e) {
    console.error("GET /api/admin/pricing failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Pricing is unavailable" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const authError = await checkAdminAuth(request, env.ADMIN_TOKEN);
    if (authError) return authError;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
    }

    const slugs = await env.DB.prepare("SELECT slug FROM tools").all<{ slug: string }>();
    const result = validatePricingUpdate(body, new Set(slugs.results.map((row) => row.slug)));
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    const { suitePerUserCents, tools } = result.update;

    const statements: D1PreparedStatement[] = [];
    if (suitePerUserCents !== undefined) {
      statements.push(
        env.DB.prepare(
          `INSERT INTO settings (key, value) VALUES ('suite_per_user_cents', ?)
           ON CONFLICT(key) DO UPDATE SET value = excluded.value`
        ).bind(String(suitePerUserCents))
      );
    }
    for (const { slug, ...fields } of tools) {
      const entries = Object.entries(fields) as [keyof typeof TOOL_COLUMNS, string | number | boolean][];
      if (entries.length === 0) continue;
      const assignments = entries.map(([field]) => `${TOOL_COLUMNS[field]} = ?`).join(", ");
      const values = entries.map(([, value]) => (typeof value === "boolean" ? (value ? 1 : 0) : value));
      statements.push(
        env.DB.prepare(`UPDATE tools SET ${assignments} WHERE slug = ?`).bind(...values, slug)
      );
    }

    // batch() runs as one transaction: either every change applies or none do.
    if (statements.length > 0) await env.DB.batch(statements);

    return NextResponse.json(await loadAdminPricing(env.DB));
  } catch (e) {
    console.error("PUT /api/admin/pricing failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Could not update pricing" }, { status: 500 });
  }
}
