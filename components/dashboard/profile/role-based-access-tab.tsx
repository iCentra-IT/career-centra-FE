"use client";

import { useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyTableState } from "@/components/ui/empty-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

const STATUS_OPTIONS = ["Pending", "Active", "Deactivated"] as const;
const TABLE_COLUMNS = ["Name", "Email Address", "Role", "Last Login", "Status"];

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

export function RoleBasedAccessTab() {
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const toggleStatus = (status: string) => {
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
      prev.size === STATUS_OPTIONS.length ? new Set() : new Set(STATUS_OPTIONS),
    );
  };

  const clearAll = () => {
    setStatusFilters(new Set());
    setStartDate("");
    setEndDate("");
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">Role-Based Access</h2>
      <p className="mt-1 text-sm text-gray-400">
        No user-management API exists yet — the counts and table below are placeholders.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" />
        <StatCard label="Active Users" />
        <StatCard label="Deactivated Users" />
        <StatCard label="Pending Users" />
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
        <EmptyTableState
          columns={TABLE_COLUMNS}
          message="No user-management API exists yet."
        />
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
            {STATUS_OPTIONS.map((status) => (
              <Checkbox
                key={status}
                label={status}
                checked={statusFilters.has(status)}
                onChange={() => toggleStatus(status)}
              />
            ))}
          </div>

          <p className="mt-6 text-sm font-medium text-gray-900">Date</p>
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

      <Modal open={addUserOpen} onClose={() => setAddUserOpen(false)}>
        <div className="text-left">
          <h2 className="text-lg font-semibold text-gray-900">Add User</h2>
          <p className="mt-1 text-sm text-gray-500">Input user details to send an invite</p>

          <div className="mt-6 flex flex-col gap-5">
            <Input label="Full name" required placeholder="Enter" />
            <Input label="Email address" required type="email" placeholder="Enter" />
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-900">
                Role <span className="text-secondary">*</span>
              </label>
              <select
                disabled
                title="No user-management API available yet"
                className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-400 disabled:cursor-not-allowed"
              >
                <option>Select role</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => setAddUserOpen(false)}
              className="flex-1 rounded-md border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled
              title="No user-management API available yet"
              className="flex-1 rounded-md bg-main py-3 text-sm font-medium text-white opacity-60 disabled:cursor-not-allowed"
            >
              Add User
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
