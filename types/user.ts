// lib/api/types/user.ts
export type UserRole = 'student' | 'facilitator' | 'staff-admin' | 'admin';

// Roles that land on /admin rather than /students (dashboard/profile links, post-login redirect).
export function isAdminDashboardRole(role: UserRole) {
  return role === 'admin' || role === 'staff-admin';
}

// Home of a role's dashboard area — post-login redirect and the header's "Dashboard" link.
export function dashboardHomeFor(role: UserRole): string {
  if (isAdminDashboardRole(role)) return '/admin';
  if (role === 'facilitator') return '/facilitators';
  return '/students';
}

// Where a role's "Profile"/account settings live.
export function profilePathFor(role: UserRole): string {
  if (isAdminDashboardRole(role)) return '/admin/profile';
  if (role === 'facilitator') return '/facilitators/settings/profile';
  return '/students/profile';
}

const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Student',
  facilitator: 'Facilitator',
  'staff-admin': 'Staff Admin',
  admin: 'Admin',
};

// CSS `capitalize` mangles hyphenated roles like "staff-admin" → "Staff-admin", so display roles
// through this instead of relying on text-transform.
export function roleLabel(role: UserRole): string {
  return ROLE_LABELS[role] ?? role;
}

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
  // UNCONFIRMED — no backend sample for this field yet. Added on the same convention as every
  // other file-upload field in this app (cover_image_url, facilitator avatar_url): the write side
  // is `avatar` (a File, see UpdateProfileRequest in types/auth.ts), the read side comes back as
  // `avatar_url`. Needs a real PATCH /api/auth/me/ response to confirm this is really the field name.
  avatar_url?: string;
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