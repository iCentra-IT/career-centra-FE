// lib/api/types/exchange-rate.ts

// Currencies used elsewhere in the app (cart/checkout) — the same set an admin would set rates for.
export type ExchangeRateCurrency = "NGN" | "USD" | "EUR" | "GBP" | "GHS" | "KES";

export interface ExchangeRate {
  id: number;
  base_currency: string;
  quote_currency: string;
  rate: string; // decimal-as-string, same pattern as prices — keep as string
  created_at: string;
}

export interface CreateExchangeRateRequest {
  base_currency: string;
  quote_currency: string;
  rate: string;
}

export type PatchExchangeRateRequest = Partial<CreateExchangeRateRequest>;
