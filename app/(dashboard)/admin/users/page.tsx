"use client";

import { useState } from "react";
import { EmptyTableState } from "@/components/ui/empty-table";

const COLUMNS = ["Name", "Email", "Location", "Certificate", "Course", "Cart", "Status"];

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

const AdminUsersPage = () => {
  const [search, setSearch] = useState("");

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900">Users</h1>
      <p className="mt-1 text-sm text-gray-500">View and manage registered learner accounts.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Name"
            className="w-full rounded-md border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
          />
        </div>
        <button
          type="button"
          disabled
          title="No data to filter yet"
          className="flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-400 disabled:cursor-not-allowed"
        >
          <FilterIcon />
          Filter
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        <EmptyTableState
          columns={COLUMNS}
          message="Not connected — no admin user-listing API exists yet."
        />
      </div>
    </div>
  );
};

export default AdminUsersPage;
