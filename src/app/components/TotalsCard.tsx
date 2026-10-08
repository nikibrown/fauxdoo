import { formatPrice, formatUsd } from "@/lib/money";
import type { Tool } from "@/lib/quote";
import CostSummary from "./CostSummary";

interface TotalsCardProps {
  selectedTools: Tool[];
  usersLabel: number | string;
  /** Annual savings in cents, or null when there are no savings to show. */
  annualSavingsCents: number | null;
  /** Yearly cost of the selected apps, or null while there's no quote. */
  currentYearlyCents: number | null;
  /** Yearly cost of the Fauxdoo suite, or null while there's no quote. */
  suiteYearlyCents: number | null;
}

/** "$20 / user", "$80 / month", or both for a tool with two kinds of pricing. */
function listPrice(tool: Tool): string {
  const parts = [];
  if (tool.flatCents > 0) parts.push(`${formatPrice(tool.flatCents)} / month`);
  if (tool.perUserCents > 0) parts.push(`${formatPrice(tool.perUserCents)} / user`);
  return parts.join(" + ") || formatPrice(0);
}

export default function TotalsCard({
  selectedTools,
  usersLabel,
  annualSavingsCents,
  currentYearlyCents,
  suiteYearlyCents,
}: TotalsCardProps) {
  return (
    <div className="calculator-total-card">
      <div className="savings" aria-live="polite">
        {annualSavingsCents !== null ? (
          <>
            <h2 className="your-savings">Your savings:</h2>
            <h2 className="your-savings">
              <span className="highlight">{formatUsd(annualSavingsCents)} / year</span>
            </h2>
            <p className="text-center">For a fully-integrated software.</p>
          </>
        ) : (
          <>
            <h2 className="your-savings">Your savings</h2>
            <p>
              {selectedTools.length === 0
                ? "Select the apps you use to see what you could save."
                : "Fauxdoo won't lower your bill for this setup yet. Add the other apps you pay for to compare."}
            </p>
          </>
        )}
      </div>

      <CostSummary
        className="third-party-apps"
        title="Apps to replace"
        usersLabel={usersLabel}
        yearlyCents={currentYearlyCents}
      >
        <ul className="calculator-total-apps-list">
          {selectedTools.length === 0 ? (
            <li>No apps selected yet.</li>
          ) : (
            selectedTools.map((tool) => (
              <li key={tool.slug}>
                <span className="app-name">{tool.name}</span>{" "}
                <span className="app-price">{listPrice(tool)}</span>
              </li>
            ))
          )}
        </ul>
      </CostSummary>

      <CostSummary
        className="fauxdoo-apps"
        title="All Fauxdoo Apps"
        usersLabel={usersLabel}
        yearlyCents={suiteYearlyCents}
      />
    </div>
  );
}
