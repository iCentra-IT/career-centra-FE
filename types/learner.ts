import { UserStatus } from "./user";

// GET /api/auth/admin/learners/ — confirmed real shape.
export interface AdminLearner {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  status: UserStatus;
  is_active: boolean;
  date_joined: string;
  location: string;
  certificate_count: number;
  enrollment_count: number;
}

export const LEARNER_EXPORT_COLUMNS = [
  { key: "id", label: "ID" },
  { key: "first_name", label: "First Name" },
  { key: "last_name", label: "Last Name" },
  { key: "email", label: "Email" },
  { key: "location", label: "Location" },
  { key: "status", label: "Status" },
  { key: "is_active", label: "Active" },
  { key: "enrollment_count", label: "Enrollments" },
  { key: "certificate_count", label: "Certificates" },
  { key: "date_joined", label: "Date Joined" },
] as const;

export type LearnerExportColumnKey = (typeof LEARNER_EXPORT_COLUMNS)[number]["key"];

// Shared by the list fetch and the CSV export — both filter identically on the backend.
export interface LearnerFilters {
  search?: string;
  status?: string;
  is_active?: boolean;
  date_joined_after?: string; // ISO date, inclusive
  date_joined_before?: string; // ISO date, inclusive
}

export interface LearnerExportParams extends LearnerFilters {
  ids?: number[]; // export exactly these rows (a user-made selection) instead of every filtered row
  columns?: LearnerExportColumnKey[]; // subset/order of columns; omit for all columns
}
