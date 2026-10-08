"use client";

import { useEffect, useState } from "react";
import { MAX_USERS, MIN_USERS } from "@/lib/leads";
import { withBasePath } from "@/lib/paths";
import type { Pricing } from "@/lib/pricing";
import { buildQuote } from "@/lib/quote";
import AppPicker from "./AppPicker";
import LeadForm from "./LeadForm";
import TotalsCard from "./TotalsCard";
import UsersInput from "./UsersInput";

// Selected when the page loads. Ignored if that tool isn't in the catalog.
const DEFAULT_SELECTED = ["tasks"]; // Taskana (Projects)

type PricingState =
  { status: "loading" } | { status: "error" } | { status: "ready"; pricing: Pricing };

function parseUsers(text: string): number | null {
  if (!/^\d+$/.test(text.trim())) return null;
  const users = Number(text);
  return users >= MIN_USERS && users <= MAX_USERS ? users : null;
}

export default function Calculator() {
  const [pricingState, setPricingState] = useState<PricingState>({
    status: "loading",
  });
  const [selected, setSelected] = useState<string[]>(DEFAULT_SELECTED);
  const [usersText, setUsersText] = useState("10");

  useEffect(() => {
    let cancelled = false;
    fetch(withBasePath("api/pricing"), { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<Pricing>;
      })
      .then((pricing) => {
        if (!cancelled) setPricingState({ status: "ready", pricing });
      })
      .catch(() => {
        if (!cancelled) setPricingState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const tools = pricingState.status === "ready" ? pricingState.pricing.tools : [];
  const users = parseUsers(usersText);
  const quote =
    pricingState.status === "ready" && users !== null
      ? buildQuote(tools, selected, users, pricingState.pricing.suitePerUserCents)
      : null;
  const selectedTools = tools.filter((tool) => selected.includes(tool.slug));
  const annualSavingsCents =
    quote !== null && selectedTools.length > 0 && quote.annualSavingsCents > 0
      ? quote.annualSavingsCents
      : null;

  function toggle(slug: string) {
    setSelected((current) =>
      current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug],
    );
  }

  return (
    <>
      <div className="calculator-container">
        <div className="calculator-container-inner">
          <AppPicker
            status={pricingState.status}
            tools={tools}
            selected={selected}
            onToggle={toggle}
          />
          <UsersInput value={usersText} users={users} onChange={setUsersText} />
        </div>
        <div className="calculator-totals-container">
          <TotalsCard
            selectedTools={selectedTools}
            usersLabel={users ?? "–"}
            annualSavingsCents={annualSavingsCents}
            currentYearlyCents={quote ? quote.currentMonthly * 12 : null}
            suiteYearlyCents={quote ? quote.suiteMonthly * 12 : null}
          />
        </div>
      </div>

      <LeadForm
        users={users}
        toolSlugs={selectedTools.map((tool) => tool.slug)}
        annualSavingsCents={annualSavingsCents}
      />
    </>
  );
}
