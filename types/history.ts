// lib/api/types/purchase-history.ts

export interface PurchaseHistoryStats {
  total: number;
  successful: number;
  failed: number;
  total_change_pct: number;
  successful_change_pct: number;
  failed_change_pct: number;
}

export interface PurchaseHistoryItem {
  id: number;
  program_title: string;
  date: string;
  amount_paid: string;
  currency: string;
  reference: string;
  payment_provider: string; // "flutterwave" | "paystack" likely — confirm
  status: string;
  status_label: string; // human-readable version of status, e.g. "Successful"
}

export interface PurchaseHistoryResponse {
  stats: PurchaseHistoryStats;
  results: PurchaseHistoryItem[];
}