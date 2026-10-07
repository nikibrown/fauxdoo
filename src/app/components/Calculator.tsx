"use client";

/* eslint-disable @next/next/no-img-element -- small static SVGs; no optimization needed */
import { useEffect, useState, type SubmitEvent } from "react";
import { MAX_USERS, MIN_USERS } from "@/lib/leads";
import { formatPrice, formatUsd } from "@/lib/money";
import { withBasePath } from "@/lib/paths";
import type { Pricing } from "@/lib/pricing";
import { buildQuote, type Tool } from "@/lib/quote";

// Logos live in public/img. A tool added in the database without a logo
// here falls back to showing its name.
const LOGOS: Record<string, string> = {
  tasks: "img/taskana.svg",
  books: "img/fastbooks.svg",
  shop: "img/buyify.svg",
  chat: "img/slick.svg",
  cms: "img/siteflo.svg",
  crm: "img/dealforce.svg",
};

// Selected when the page loads. Ignored if that tool isn't in the catalog.
const DEFAULT_SELECTED = ["tasks"]; // Taskana (Projects)

type PricingState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; pricing: Pricing };

type SubmitState =
  | { status: "idle" | "submitting" | "success" }
  | { status: "error"; message: string };

function parseUsers(text: string): number | null {
  if (!/^\d+$/.test(text.trim())) return null;
  const users = Number(text);
  return users >= MIN_USERS && users <= MAX_USERS ? users : null;
}

function listPrice(tool: Tool): string {
  const parts = [];
  if (tool.flatCents > 0) parts.push(`${formatPrice(tool.flatCents)} / month`);
  if (tool.perUserCents > 0)
    parts.push(`${formatPrice(tool.perUserCents)} / user`);
  return parts.join(" + ") || formatPrice(0);
}

export default function Calculator() {
  const [pricingState, setPricingState] = useState<PricingState>({
    status: "loading",
  });
  const [selected, setSelected] = useState<string[]>(DEFAULT_SELECTED);
  const [usersText, setUsersText] = useState("10");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [submit, setSubmit] = useState<SubmitState>({ status: "idle" });

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

  const tools =
    pricingState.status === "ready" ? pricingState.pricing.tools : [];
  const users = parseUsers(usersText);
  const quote =
    pricingState.status === "ready" && users !== null
      ? buildQuote(
          tools,
          selected,
          users,
          pricingState.pricing.suitePerUserCents,
        )
      : null;
  const selectedTools = tools.filter((tool) => selected.includes(tool.slug));
  const hasSavings =
    quote !== null && selectedTools.length > 0 && quote.annualSavingsCents > 0;
  const usersLabel = users ?? "–";
  const money = (cents: number | undefined) =>
    cents === undefined ? "–" : formatUsd(cents);

  // A submit error describes the old inputs, so clear it when they change.
  function clearSubmitError() {
    if (submit.status === "error") setSubmit({ status: "idle" });
  }

  function toggle(slug: string) {
    setSelected((current) =>
      current.includes(slug)
        ? current.filter((s) => s !== slug)
        : [...current, slug],
    );
    clearSubmitError();
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (users === null) {
      setSubmit({
        status: "error",
        message: `Enter a whole number of users from ${MIN_USERS} to ${MAX_USERS}.`,
      });
      return;
    }
    setSubmit({ status: "submitting" });
    try {
      const res = await fetch(withBasePath("api/leads"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Submitting is the consent: the notice under the button says so.
        body: JSON.stringify({
          email,
          users,
          toolSlugs: selectedTools.map((tool) => tool.slug),
          consent: true,
          website,
        }),
      });
      if (res.status === 201) {
        setSubmit({ status: "success" });
        return;
      }
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      setSubmit({
        status: "error",
        message: data?.error ?? "Something went wrong. Please try again.",
      });
    } catch {
      setSubmit({
        status: "error",
        message: "Network error. Check your connection and try again.",
      });
    }
  }

  return (
    <>
      <div className="calculator-container">
        <div className="calculator-container-inner">
          <h3 id="apps-heading">1. Which apps do you use?</h3>
          <div
            className="apps-container"
            role="group"
            aria-labelledby="apps-heading"
          >
            {pricingState.status === "loading" && <p>Loading apps…</p>}
            {pricingState.status === "error" && (
              <p role="alert">
                Couldn&apos;t load pricing. Refresh the page to try again.
              </p>
            )}
            {tools.map((tool) => {
              const checked = selected.includes(tool.slug);
              const logo = LOGOS[tool.slug];
              return (
                <div className="app-option" key={tool.slug}>
                  <input
                    type="checkbox"
                    id={`app-${tool.slug}`}
                    className="app-card-check"
                    name="apps"
                    value={tool.slug}
                    checked={checked}
                    readOnly
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    className="app-card"
                    aria-pressed={checked}
                    onClick={() => toggle(tool.slug)}
                  >
                    <span className="app-card-logo">
                      {logo ? (
                        <img src={withBasePath(logo)} alt={tool.name} />
                      ) : (
                        tool.name
                      )}
                    </span>
                    <span className="app-category">{tool.category}</span>
                  </button>
                </div>
              );
            })}
          </div>

          <h3>
            <label htmlFor="users-input">2. How many users?</label>
          </h3>
          <div className="users-container">
            <input
              id="users-input"
              type="number"
              inputMode="numeric"
              min={MIN_USERS}
              max={MAX_USERS}
              step={1}
              placeholder="Enter number of users"
              className="users-input"
              value={usersText}
              onChange={(e) => {
                setUsersText(e.target.value);
                clearSubmitError();
              }}
              aria-invalid={users === null}
              aria-describedby={users === null ? "users-error" : undefined}
            />
            {users === null && (
              <p id="users-error" className="field-error">
                Enter a whole number from {MIN_USERS} to {MAX_USERS}.
              </p>
            )}
          </div>
        </div>
        <div className="calculator-totals-container">
          <div className="calculator-total-card">
          <div className="savings" aria-live="polite">
            {hasSavings ? (
              <>
                <h2 className="your-savings">Your savings:</h2>
                <h2 className="your-savings">
                  <span className="highlight">
                    {formatUsd(quote.annualSavingsCents)} / year
                  </span>
                </h2>
                <p className="text-center">
                  For a fully-integrated software.
                </p>
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

            <div className="third-party-apps">
              <h3>Apps to replace</h3>

              <p>
                for <span className="users-input-value">{usersLabel}</span>{" "}
                users / month
              </p>

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

              <img src={withBasePath("img/separator.svg")} alt="" className="separator" />

              <h3 className="total"><span>Total</span>  <span>{money(quote ? quote.currentMonthly * 12 : undefined)} / year</span></h3>

            </div>

            <div className="fauxdoo-apps">
              <h3>All Fauxdoo Apps</h3>
              <p>
                for <span className="users-input-value">{usersLabel}</span>{" "}
                users / month
              </p>
              <img src={withBasePath("img/separator.svg")} alt="" className="separator" />
                <h3 className="total"><span>Total</span> <span>{money(quote ? quote.suiteMonthly * 12 : undefined)} / yea</span></h3>
            </div>
          </div>
        </div>
      </div>

      {submit.status === "success" ? (
        <div className="sales-container" role="status">
          <h3>Thanks! We&apos;ll be in touch.</h3>
          <p className="form-message">Your savings estimate has been saved.</p>
        </div>
      ) : (
        <form className="sales-container" onSubmit={handleSubmit}>
          {/* quote is null while prices load or the user count is invalid. */}
          <h3>
            {hasSavings
              ? `Claim your ${formatUsd(quote.annualSavingsCents)} savings and start a free demo today`
              : "Get started with a demo today"}
          </h3>
          <label htmlFor="email-input" className="visually-hidden">
            Email
          </label>
          <input
            id="email-input"
            type="email"
            name="email"
            placeholder="Enter your email"
            className="email-input"
            autoComplete="email"
            maxLength={254}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            className="btn"
            type="submit"
            disabled={submit.status === "submitting"}
          >
            {submit.status === "submitting"
              ? "Sending…"
              : "Try Fauxdoo for free"}
          </button>
          <p className="consent-label">
            By submitting, you agree to get emails about your savings and
            Fauxdoo. Unsubscribe anytime.
          </p>
          {/* Honeypot: hidden from people; bots that fill it are ignored by the server. */}
          <div className="form-honeypot" aria-hidden="true">
            <label htmlFor="website-input">Website</label>
            <input
              id="website-input"
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
          {submit.status === "error" && (
            <p className="form-message" role="alert">
              {submit.message}
            </p>
          )}
        </form>
      )}
    </>
  );
}
