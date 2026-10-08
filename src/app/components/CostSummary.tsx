/* eslint-disable @next/next/no-img-element -- small static SVG; no optimization needed */
import type { ReactNode } from "react";
import { formatUsdOrDash } from "@/lib/money";
import { withBasePath } from "@/lib/paths";

interface CostSummaryProps {
  className: string;
  title: string;
  usersLabel: number | string;
  /** Yearly cost in cents, or null while there's no quote yet. */
  yearlyCents: number | null;
  /** Optional details shown above the divider, like the list of apps. */
  children?: ReactNode;
}

/** One cost block in the totals card: title, user count, details, and a yearly total. */
export default function CostSummary({
  className,
  title,
  usersLabel,
  yearlyCents,
  children,
}: CostSummaryProps) {
  return (
    <div className={className}>
      <h3>{title}</h3>
      <p>
        for <span className="users-input-value">{usersLabel}</span> users / month
      </p>
      {children}
      <img src={withBasePath("img/separator.svg")} alt="" className="separator" />
      <h3 className="total">
        <span>Total</span> <span>{formatUsdOrDash(yearlyCents)} / year</span>
      </h3>
    </div>
  );
}
