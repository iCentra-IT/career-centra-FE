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

export function formatShortDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatUsd(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `$${num?.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function formatMoney(value: string | number, currency: string) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `${currency} ${num.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function displayTitle(title: string) {
  return title?.replace(/^Seed\s*[—-]?\s*/i, "");
}
