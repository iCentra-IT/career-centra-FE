import axios from "axios";

// lib/api/types.ts
// lib/api/types.ts
export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message?: string;
  detail?: string; // DRF's own framework-level errors use this instead of "message" — confirmed real
  errors?: Record<string, string[]>; // e.g. { non_field_errors: [...], email: [...] }
}

export class NormalizedError extends Error {
  status?: number;
  errors?: Record<string, string[]>;
  constructor(message: string, status?: number, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export function normalizeError(error: unknown): NormalizedError {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return new NormalizedError(
      error.response?.data?.message ?? error.response?.data?.detail ?? error.message,
      error.response?.status,
      error.response?.data?.errors
    );
  }
  return new NormalizedError('An unexpected error occurred');
}

// pagination
export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  total_pages: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Defensive unwrapping for endpoints whose sample response looked like a generic Swagger
// placeholder (bare array/object) rather than a real captured payload — this codebase's actual
// convention has consistently turned out to wrap single objects in {success, message, data} and
// lists in {success, count, ..., results}, even when the sample shown didn't show that wrapper.
// These helpers accept either shape so a wrong guess here doesn't blank the page.
export function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const obj = data as { results?: T[]; data?: T[] } | null | undefined;
  return obj?.results ?? obj?.data ?? [];
}

export function unwrapObject<T>(data: unknown): T {
  const obj = data as { data?: T } | null | undefined;
  return (obj?.data ?? (data as T));
}