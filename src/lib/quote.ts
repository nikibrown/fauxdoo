/**
 * Pure savings calculation shared by the browser (live totals) and the
 * server (recomputed on submit). All money values are integer cents.
 */

export interface Tool {
  slug: string;
  name: string;
  replaces: string;
  category: string;
  perUserCents: number;
  flatCents: number;
}

export interface LineItem {
  slug: string;
  name: string;
  monthlyCents: number;
}

export interface Quote {
  currentMonthly: number;
  suiteMonthly: number;
  annualSavingsCents: number;
  lineItems: LineItem[];
}

/**
 * Line items follow the order of `tools` (the catalog's sort order).
 * Unknown slugs are ignored; the server validates slugs before calling this.
 */
export function buildQuote(
  tools: Tool[],
  slugs: string[],
  users: number,
  suitePerUserCents: number,
): Quote {
  const selected = new Set(slugs);

  const lineItems = tools
    .filter((tool) => selected.has(tool.slug))
    .map((tool) => ({
      slug: tool.slug,
      name: tool.name,
      monthlyCents: tool.flatCents + tool.perUserCents * users,
    }));

  const currentMonthly = lineItems.reduce((sum, item) => sum + item.monthlyCents, 0);
  const suiteMonthly = suitePerUserCents * users;

  return {
    currentMonthly,
    suiteMonthly,
    annualSavingsCents: (currentMonthly - suiteMonthly) * 12,
    lineItems,
  };
}
