export function formatDateRange(startIso: string, endIso: string) {
  return `${startIso} → ${endIso}`;
}

export function formatOrdinalDateTime(iso: string) {
  const date = new Date(iso);
  const day = date.getDate();
  const remainder = day % 100;
  const suffix =
    remainder >= 11 && remainder <= 13
      ? "th"
      : ["th", "st", "nd", "rd"][day % 10] ?? "th";
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${day}${suffix} ${month}, ${year} • ${time}`;
}

// Time-only fields (session start_time/end_time) have shown up serialized oddly — a full ISO time
// with milliseconds and a trailing "Z" instead of a plain "HH:MM" — so this just reads the leading
// hour/minute regardless of what follows and formats it as "2:05 PM".
export function formatTimeOfDay(value: string): string {
  const match = value.match(/^(\d{2}):(\d{2})/);
  if (!match) return value;
  const date = new Date();
  date.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function formatShortDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatUsd(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `$${num?.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  EUR: "€",
  GBP: "£",
  GHS: "₵",
  KES: "KSh ",
};

export function formatMoney(value: string | number, currency: string) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  const amount = num.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const symbol = CURRENCY_SYMBOLS[currency?.toUpperCase()];
  return symbol ? `${symbol}${amount}` : `${currency} ${amount}`;
}

// Like formatMoney but keeps the cents — for carts, orders and receipts where the exact
// decimal string from the API matters.
export function formatCurrency(value: string | number | null | undefined, currency: string) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (num == null || !Number.isFinite(num)) return "—";
  const amount = num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const symbol = CURRENCY_SYMBOLS[currency?.toUpperCase()];
  return symbol ? `${symbol}${amount}` : `${currency} ${amount}`;
}

export function displayTitle(title: string) {
  return title?.replace(/^Seed\s*[—-]?\s*/i, "");
}
