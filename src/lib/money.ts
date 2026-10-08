const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const usdWhole = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Formats integer cents as dollars, e.g. 504000 -> "$5,040.00". */
export function formatUsd(cents: number): string {
  return usd.format(cents / 100);
}

/** Like formatUsd, but shows a dash while there's no amount yet. */
export function formatUsdOrDash(cents: number | null): string {
  return cents === null ? "–" : formatUsd(cents);
}

/** Formats a list price, dropping ".00" for whole dollars, e.g. 2000 -> "$20". */
export function formatPrice(cents: number): string {
  return cents % 100 === 0 ? usdWhole.format(cents / 100) : usd.format(cents / 100);
}
