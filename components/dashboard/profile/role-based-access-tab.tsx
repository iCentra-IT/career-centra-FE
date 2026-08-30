"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAdminUsers } from "@/hooks/queries/admin-users";
import { useCreateAdminUser, usePatchAdminUser } from "@/hooks/mutations/admin-users";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyTableState } from "@/components/ui/empty-table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatShortDate } from "@/lib/format";
import type { AdminUser, UserRole, UserStatus } from "@/types/user";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "staff", label: "Staff" },
  { value: "facilitator", label: "Facilitator" },
  { value: "student", label: "Student" },
];

const STATUS_OPTIONS: { value: UserStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "pending_verification", label: "Pending" },
  { value: "suspended", label: "Suspended" },
  { value: "inactive", label: "Inactive" },
];

const TABLE_COLUMNS = ["Name", "Email Address", "Role", "Joined", "Status"];

function statusTone(status: string): "green" | "yellow" | "red" | "gray" {
  if (status === "active") return "green";
  if (status === "pending_verification") return "yellow";
  if (status === "suspended") return "red";
  return "gray";
}

function statusLabel(status: string) {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M13 13l-2.5-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 3h12M4.5 8h7M7 13h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between border-b border-gray-50 py-3 text-sm text-gray-700 last:border-0">
      {label}
      <button
        type="button"
        onClick={onChange}
        aria-pressed={checked}
        className={`flex h-5 w-5 items-center justify-center rounded border ${
          checked ? "border-main bg-main text-white" : "border-gray-300 bg-white"
        }`}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2.5 6.2l2.3 2.3L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </label>
  );
}

const createUserSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  role: z.enum(["admin", "student", "staff", "facilitator"]),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
type CreateUserFormValues = z.infer<typeof createUserSchema>;

function EditUserModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const [role, setRole] = useState<UserRole>(user.role);
  const [status, setStatus] = useState<UserStatus>(user.status);
  const [isStaff, setIsStaff] = useState(user.is_staff);
  const [isActive, setIsActive] = useState(user.is_active);
  const patchUser = usePatchAdminUser(user.id);

  const handleSave = () => {
    patchUser.mutate(
      { role, status, is_staff: isStaff, is_active: isActive },
      {
        onSuccess: () => {
          toast.success("User updated.");
          onClose();
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <Modal open onClose={onClose}>
      <div className="text-left">
        <h2 className="text-lg font-semibold text-gray-900">Edit User</h2>
        <p className="mt-1 text-sm text-gray-500">
          {user.full_name} · {user.email}
        </p>

        <div className="mt-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as UserStatus)}
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <Checkbox checked={isStaff} onChange={() => setIsStaff((v) => !v)} label="Staff access" />
          <Checkbox checked={isActive} onChange={() => setIsActive((v) => !v)} label="Account active" />
        </div>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <Button type="button" loading={patchUser.isPending} onClick={handleSave} className="flex-1">
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function RoleBasedAccessTab() {
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [statusFilters, setStatusFilters] = useState<Set<UserStatus>>(new Set());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: users, isLoading } = useAdminUsers();
  const createUser = useCreateAdminUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: "student" },
  });

  const toggleStatus = (status: UserStatus) => {
    setStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  };

  const toggleAll = () => {
    setStatusFilters((prev) =>
      prev.size === STATUS_OPTIONS.length ? new Set() : new Set(STATUS_OPTIONS.map((o) => o.value)),
    );
  };

  const clearAll = () => {
    setStatusFilters(new Set());
    setStartDate("");
    setEndDate("");
  };

  const filtered = useMemo(() => {
    let list = users ?? [];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((u) => u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    if (statusFilters.size > 0) list = list.filter((u) => statusFilters.has(u.status));
    if (startDate) list = list.filter((u) => new Date(u.date_joined) >= new Date(startDate));
    if (endDate) list = list.filter((u) => new Date(u.date_joined) <= new Date(endDate));
    return list;
  }, [users, search, statusFilters, startDate, endDate]);

  const total = users?.length ?? 0;
  const active = (users ?? []).filter((u) => u.status === "active").length;
  const deactivated = (users ?? []).filter((u) => u.status === "suspended" || u.status === "inactive").length;
  const pending = (users ?? []).filter((u) => u.status === "pending_verification").length;

  const onCreateSubmit = (values: CreateUserFormValues) => {
    createUser.mutate(values, {
      onSuccess: () => {
        toast.success("User created.");
        setAddUserOpen(false);
        reset({ role: "student" });
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">Role-Based Access</h2>
      <p className="mt-1 text-sm text-gray-400">Manage internal staff and admin accounts.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={total} loading={isLoading} />
        <StatCard label="Active Users" value={active} loading={isLoading} />
        <StatCard label="Deactivated Users" value={deactivated} loading={isLoading} />
        <StatCard label="Pending Users" value={pending} loading={isLoading} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name"
            className="w-full rounded-md border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
          />
        </div>
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <FilterIcon />
          Filter
        </button>
        <button
          type="button"
          onClick={() => setAddUserOpen(true)}
          className="ml-auto rounded-md bg-main px-5 py-2.5 text-sm font-medium text-white hover:bg-deep-blue"
        >
          + Create User
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        {isLoading ? (
          <TableSkeleton columns={TABLE_COLUMNS} />
        ) : filtered.length === 0 ? (
          <EmptyTableState columns={TABLE_COLUMNS} message="No users match yet." />
        ) : (
          <table className="w-full min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
                {TABLE_COLUMNS.map((col) => (
                  <th key={col} className="px-5 py-3 font-medium">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setEditUser(user)}
                      className="font-medium text-gray-900 hover:text-secondary"
                    >
                      {user.full_name}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{user.email}</td>
                  <td className="px-5 py-4 capitalize text-gray-600">{user.role}</td>
                  <td className="px-5 py-4 text-gray-600">{formatShortDate(user.date_joined)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge label={statusLabel(user.status)} tone={statusTone(user.status)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={filterOpen} onClose={() => setFilterOpen(false)}>
        <div className="text-left">
          <h2 className="text-lg font-semibold text-gray-900">Filter</h2>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">Status</p>
            <button type="button" onClick={toggleAll} className="text-sm text-secondary hover:underline">
              Select All
            </button>
          </div>
          <div className="mt-2 rounded-xl border border-gray-100 px-4">
            {STATUS_OPTIONS.map((opt) => (
              <Checkbox
                key={opt.value}
                label={opt.label}
                checked={statusFilters.has(opt.value)}
                onChange={() => toggleStatus(opt.value)}
              />
            ))}
          </div>

          <p className="mt-6 text-sm font-medium text-gray-900">Date Joined</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-600 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-600 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            />
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button type="button" onClick={() => setFilterOpen(false)}>
              Apply
            </Button>
            <button
              type="button"
              onClick={clearAll}
              className="w-full rounded-md border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear All
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={addUserOpen}
        onClose={() => {
          setAddUserOpen(false);
          reset({ role: "student" });
        }}
      >
        <div className="text-left">
          <h2 className="text-lg font-semibold text-gray-900">Add User</h2>
          <p className="mt-1 text-sm text-gray-500">Input user details to create an account</p>

          <form onSubmit={handleSubmit(onCreateSubmit)}>
            <div className="mt-6 flex flex-col gap-5">
              <Input
                label="First name"
                required
                placeholder="Enter"
                error={errors.first_name?.message}
                {...register("first_name")}
              />
              <Input
                label="Last name"
                required
                placeholder="Enter"
                error={errors.last_name?.message}
                {...register("last_name")}
              />
              <Input
                label="Email address"
                required
                type="email"
                placeholder="Enter"
                error={errors.email?.message}
                {...register("email")}
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-900">
                  Role <span className="text-secondary">*</span>
                </label>
                <select
                  className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                  {...register("role")}
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Password"
                required
                type="password"
                placeholder="Enter"
                error={errors.password?.message}
                {...register("password")}
              />
            </div>

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setAddUserOpen(false);
                  reset({ role: "student" });
                }}
                className="flex-1 rounded-md border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <Button type="submit" loading={createUser.isPending} className="flex-1">
                Add User
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} />}
    </div>
  );
}
