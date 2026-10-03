import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { loadPricing } from "@/lib/pricing";

/**
 * GET /api/pricing
 *
 * Public pricing catalog: active tools (by sort order) and the Fauxdoo
 * Suite per-user price. Read from D1 on every request, so editing the
 * database changes the calculator after a refresh with no redeploy.
 */
export async function GET() {
  try {
    const { env } = getCloudflareContext();
    const pricing = await loadPricing(env.DB);
    return NextResponse.json(pricing);
  } catch (e) {
    console.error("GET /api/pricing failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Pricing is unavailable" }, { status: 500 });
  }
}
