// lib/api/types/user.ts
export type UserRole = 'admin' | 'student' | 'staff' | 'facilitator';

export type UserStatus = 'pending_verification' | 'active' | 'suspended' | 'inactive'; 
// ^ confirm the full list when you send the admin/status-related API — 
// for now only "pending_verification" is confirmed, rest are placeholders

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  email_verified: boolean;
  is_active: boolean;
  date_joined: string; // ISO 8601
}

// GET/POST/PATCH /api/auth/admin/users/ — confirmed real shape, same fields as User plus is_staff.
export interface AdminUser extends User {
  is_staff: boolean;
}

export interface CreateAdminUserRequest {
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  password: string;
}

export interface PatchAdminUserRequest {
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  status?: UserStatus;
  is_staff?: boolean;
  is_active?: boolean;
}