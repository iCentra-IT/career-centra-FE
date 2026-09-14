import Link from "next/link";
import { ProfileTab } from "@/components/dashboard/profile/profile-tab";
import { SecurityTab } from "@/components/dashboard/profile/security-tab";
import { FacilitatorProfileEditor } from "@/components/dashboard/facilitator-profile-editor";

const TABS = [
  { key: "profile", label: "Profile", href: "/facilitators/settings/profile" },
  { key: "public-profile", label: "Public Profile", href: "/facilitators/settings/public-profile" },
  { key: "security", label: "Security", href: "/facilitators/settings/security" },
] as const;

export type FacilitatorSettingsTab = (typeof TABS)[number]["key"];

// Account info (name/email — PATCH /api/auth/me/) and the public facilitator profile (bio,
// credentials, avatar — PATCH /api/facilitators/profiles/{id}/) are two different records behind
// two different save actions, so they're kept on separate tabs rather than stacked on one screen
// with two "Save" buttons.
export function FacilitatorSettings({ tab }: { tab: FacilitatorSettingsTab }) {
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

      <div className="mt-8">
        {tab === "profile" ? (
          <ProfileTab />
        ) : tab === "public-profile" ? (
          <FacilitatorProfileEditor />
        ) : (
          <SecurityTab />
        )}
      </div>
    </div>
  );
}
