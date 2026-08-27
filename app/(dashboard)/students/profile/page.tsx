"use client";

import { useState } from "react";
import { ProfileTab } from "@/components/dashboard/profile/profile-tab";
import { SecurityTab } from "@/components/dashboard/profile/security-tab";

const TABS = [
  { key: "profile", label: "Profile" },
  { key: "security", label: "Security" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const StudentProfilePage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  return (
    <div>
      <div className="flex gap-6 border-b border-gray-100">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-main text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "security" && <SecurityTab />}
      </div>
    </div>
  );
};

export default StudentProfilePage;
