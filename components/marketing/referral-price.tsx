import type { ProgramReferralPricing } from "@/types/programs";
import { formatMoney } from "@/lib/format";

// Shared price display for every place a program's price is shown — swaps to the partner's
// struck-through original + discounted price whenever `referral` is present (i.e. whenever the
// request carried X-Partner-Referral and the backend matched it to an active partner), so the
// discount reads consistently everywhere instead of only on the catalog cards.
export function ReferralPrice({
  referral,
  amount,
  currency,
  className,
  strikeClassName = "text-xs font-normal opacity-60 line-through",
}: {
  referral?: ProgramReferralPricing;
  amount: string;
  currency: string;
  className?: string;
  strikeClassName?: string;
}) {
  // `referral` rides on every program once the header is active, even ones the partner's coupon
  // doesn't apply to — those come back with these two fields null rather than no `referral` at
  // all, which is this program's "not discounted" case too.
  if (!referral || referral.original_price == null || referral.discounted_price == null) {
    return <span className={className}>{formatMoney(amount, currency)}</span>;
  }
  return (
    <span className={`inline-flex items-center gap-1.5 ${className ?? ""}`}>
      <span className={strikeClassName}>
        {formatMoney(referral.original_price, referral.pinned_currency)}
      </span>
      {formatMoney(referral.discounted_price, referral.pinned_currency)}
    </span>
  );
}
