"use client";

import { useState, type SubmitEvent } from "react";
import { MAX_USERS, MIN_USERS } from "@/lib/leads";
import { formatUsd } from "@/lib/money";
import { withBasePath } from "@/lib/paths";

interface LeadFormProps {
  /** The visitor's user count, or null while the users box is empty or invalid. */
  users: number | null;
  /** Slugs of the selected apps that exist in the loaded catalog. */
  toolSlugs: string[];
  /** Annual savings in cents, or null when there are no savings to show. */
  annualSavingsCents: number | null;
}

type SubmitState =
  | { status: "idle" | "submitting" | "success" }
  // inputsKey records which selection the error was about.
  | { status: "error"; message: string; inputsKey: string };

export default function LeadForm({ users, toolSlugs, annualSavingsCents }: LeadFormProps) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [submit, setSubmit] = useState<SubmitState>({ status: "idle" });

  // A submit error describes the inputs at the time, so hide it once the
  // visitor changes their apps or user count.
  const inputsKey = JSON.stringify([users, toolSlugs]);
  const error = submit.status === "error" && submit.inputsKey === inputsKey ? submit.message : null;

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (users === null) {
      setSubmit({
        status: "error",
        message: `Enter a whole number of users from ${MIN_USERS} to ${MAX_USERS}.`,
        inputsKey,
      });
      return;
    }
    setSubmit({ status: "submitting" });
    try {
      const res = await fetch(withBasePath("api/leads"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Submitting is the consent: the notice under the button says so.
        body: JSON.stringify({ email, users, toolSlugs, consent: true, website }),
      });
      if (res.status === 201) {
        setSubmit({ status: "success" });
        return;
      }
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setSubmit({
        status: "error",
        message: data?.error ?? "Something went wrong. Please try again.",
        inputsKey,
      });
    } catch {
      setSubmit({
        status: "error",
        message: "Network error. Check your connection and try again.",
        inputsKey,
      });
    }
  }

  if (submit.status === "success") {
    return (
      <div className="sales-container" role="status">
        <h3>Thanks! We&apos;ll be in touch.</h3>
        <p className="form-message">Your savings estimate has been saved.</p>
      </div>
    );
  }

  return (
    <form className="sales-container" onSubmit={handleSubmit}>
      <h3>
        {annualSavingsCents !== null
          ? `Claim your ${formatUsd(annualSavingsCents)} savings and start a free demo today`
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
      <button className="btn" type="submit" disabled={submit.status === "submitting"}>
        {submit.status === "submitting" ? "Sending…" : "Try Fauxdoo for free"}
      </button>
      <p className="consent-label">
        By submitting, you agree to get emails about your savings and Fauxdoo. Unsubscribe anytime.
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
      {error && (
        <p className="form-message" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
