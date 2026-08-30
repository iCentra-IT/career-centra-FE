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
