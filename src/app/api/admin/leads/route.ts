import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/admin-auth";
import { toCsv } from "@/lib/csv";

/**
 * GET /api/admin/leads[?format=csv][&consentOnly=1]
 *
 * One row per email (its latest submission), newest first. CSV columns:
 * email,users,tools,annual_savings_usd,created_at. JSON by default.
 * Requires `Authorization: Bearer <ADMIN_TOKEN>`.
 */

interface LeadRow {
  email: string;
  users: number;
  tool_slugs: string;
  annual_savings_cents: number;
  consent: number;
  created_at: string;
}

export async function GET(request: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const authError = await checkAdminAuth(request, env.ADMIN_TOKEN);
    if (authError) return authError;

    const params = new URL(request.url).searchParams;
    const format = params.get("format") ?? "json";
    if (format !== "json" && format !== "csv") {
      return NextResponse.json({ error: "format must be json or csv" }, { status: 400 });
    }
    const consentOnly = ["1", "true"].includes(params.get("consentOnly") ?? "");

    const [leadsResult, toolsResult] = await Promise.all([
      env.DB.prepare(
        `SELECT email, users, tool_slugs, annual_savings_cents, consent, created_at
         FROM (
           SELECT *, ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC, id DESC) AS rn
           FROM leads
           WHERE consent = 1 OR ?1 = 0
         )
         WHERE rn = 1
         ORDER BY created_at DESC, id DESC`
      )
        .bind(consentOnly ? 1 : 0)
        .all<LeadRow>(),
      env.DB.prepare("SELECT slug, name FROM tools").all<{ slug: string; name: string }>(),
    ]);

    const toolNames = new Map(toolsResult.results.map((tool) => [tool.slug, tool.name]));
    const leads = leadsResult.results.map((row) => {
      const slugs = JSON.parse(row.tool_slugs) as string[];
      return {
        email: row.email,
        users: row.users,
        tools: slugs.map((slug) => toolNames.get(slug) ?? slug),
        annualSavingsCents: row.annual_savings_cents,
        consent: row.consent === 1,
        createdAt: row.created_at,
      };
    });

    if (format === "json") {
      return NextResponse.json({ count: leads.length, leads });
    }

    const csv = toCsv(
      ["email", "users", "tools", "annual_savings_usd", "created_at"],
      leads.map((lead) => [
        lead.email,
        lead.users,
        lead.tools.join("; "),
        lead.annualSavingsCents / 100,
        lead.createdAt,
      ])
    );
    const date = new Date().toISOString().slice(0, 10);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="fauxdoo-leads-${date}.csv"`,
      },
    });
  } catch (e) {
    console.error("GET /api/admin/leads failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Could not load leads" }, { status: 500 });
  }
}
