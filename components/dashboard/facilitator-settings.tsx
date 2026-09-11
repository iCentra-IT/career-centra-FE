import Link from "next/link";
import { ProfileTab } from "@/components/dashboard/profile/profile-tab";
import { SecurityTab } from "@/components/dashboard/profile/security-tab";

const TABS = [
  { key: "profile", label: "Profile", href: "/facilitators/settings/profile" },
  { key: "security", label: "Security", href: "/facilitators/settings/security" },
] as const;

export function FacilitatorSettings({ tab }: { tab: "profile" | "security" }) {
  return (
    <div>
      <div className="flex gap-6 border-b border-gray-100">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-main text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-8">{tab === "profile" ? <ProfileTab /> : <SecurityTab />}</div>
    </div>
  );
}
