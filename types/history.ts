// lib/api/types/purchase-history.ts

export interface PurchaseHistoryStats {
  total: number;
  successful: number;
  failed: number;
  total_change_pct: number;
  successful_change_pct: number;
  failed_change_pct: number;
}

export type PurchaseHistoryItemType = "cohort" | "addon";

export interface PurchaseHistoryItem {
  id: number;
  program_title: string;
  date: string;
  // For an "addon" row this is the sum of its nested add-ons' amount_paid, not the Enrollment's
  // own field (which is always 0.00 for a standalone purchase) — resolved server-side.
  amount_paid: string;
  currency: string;
  reference: string;
  payment_provider: string; // "flutterwave" | "paystack" likely — confirm
  status: string;
  status_label: string; // human-readable version of status, e.g. "Successful"
  // "cohort" = a normal program/cohort enrollment; "addon" = a standalone (no-cohort) add-on
  // purchase, e.g. a question bank bought on its own.
  item_type: PurchaseHistoryItemType;
  // Comma-joined add-on name(s) for an "addon" row ("" for a "cohort" row).
  item_label: string;
}

export interface PurchaseHistoryResponse {
  stats: PurchaseHistoryStats;
  results: PurchaseHistoryItem[];
}