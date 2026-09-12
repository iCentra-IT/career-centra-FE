"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { ProfileTab } from "@/components/dashboard/profile/profile-tab";
import { SecurityTab } from "@/components/dashboard/profile/security-tab";
import { RoleBasedAccessTab } from "@/components/dashboard/profile/role-based-access-tab";

const ALL_TABS = [
  { key: "profile", label: "Profile" },
  { key: "rba", label: "Role-Based Access" },
  { key: "security", label: "Security" },
] as const;

type TabKey = (typeof ALL_TABS)[number]["key"];

const AdminProfilePage = () => {
  const user = useAuthStore((s) => s.user);
  // Role-Based Access manages staff/admin accounts — restricted to admins, not staff-admins.
  const isAdmin = user?.role === "admin";
  const tabs = isAdmin ? ALL_TABS : ALL_TABS.filter((tab) => tab.key !== "rba");

  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const currentTab = activeTab === "rba" && !isAdmin ? "profile" : activeTab;

  return (
    <div>
      <div className="flex gap-6 border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${
              currentTab === tab.key
                ? "border-main text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {currentTab === "profile" && <ProfileTab />}
        {currentTab === "rba" && isAdmin && <RoleBasedAccessTab />}
        {currentTab === "security" && <SecurityTab />}
      </div>
    </div>
  );
};

export default AdminProfilePage;
