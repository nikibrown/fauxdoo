import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { isHoneypotFilled, validateLead } from "@/lib/leads";
import { loadPricing } from "@/lib/pricing";
import { buildQuote } from "@/lib/quote";

/**
 * POST /api/leads
 *
 * Body: { email, users, toolSlugs, consent, website }
 *
 * Stores the email plus a snapshot of the selections and savings. The
 * savings are recomputed here from D1 pricing; totals sent by the browser
 * are never trusted. `website` is a honeypot: if filled, respond 201 but
 * store nothing. Email addresses are never logged.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  if (isHoneypotFilled(body)) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  try {
    const { env } = await getCloudflareContext({ async: true });
    const pricing = await loadPricing(env.DB);

    const result = validateLead(body, new Set(pricing.tools.map((tool) => tool.slug)));
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    const { email, users, toolSlugs } = result.lead;

    const quote = buildQuote(pricing.tools, toolSlugs, users, pricing.suitePerUserCents);

    await env.DB.prepare(
      `INSERT INTO leads
         (email, users, tool_slugs, current_monthly_cents, suite_monthly_cents,
          annual_savings_cents, consent, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?)`
    )
      .bind(
        email,
        users,
        JSON.stringify(quote.lineItems.map((item) => item.slug)),
        quote.currentMonthly,
        quote.suiteMonthly,
        quote.annualSavingsCents,
        new Date().toISOString()
      )
      .run();

    return NextResponse.json(
      { ok: true, annualSavingsCents: quote.annualSavingsCents },
      { status: 201 }
    );
  } catch (e) {
    console.error("POST /api/leads failed:", e instanceof Error ? e.message : "Unknown error");
    return NextResponse.json({ error: "Could not save your request" }, { status: 500 });
  }
}
