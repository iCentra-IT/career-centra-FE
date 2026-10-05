"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCrmLeads } from "@/hooks/queries/crm";
import { useSendCampaign } from "@/hooks/mutations/crm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { crmLeadName } from "@/lib/crm";
import { textToEmailHtml } from "@/lib/crm-email";

// Recipients are picked from the lead list only. Opted-out leads are excluded server-side even
// if selected here, so the count shown is what was selected, not necessarily what gets emailed.
export function CrmCampaignCompose({ basePath }: { basePath: string }) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);
  const { data, isLoading } = useCrmLeads({ search: search || undefined, page_size: 100 });
  const sendCampaign = useSendCampaign();

  const leads = useMemo(() => data?.results ?? [], [data]);
  const allVisibleSelected = leads.length > 0 && leads.every((l) => selected.has(l.id));

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      leads.forEach((l) => (allVisibleSelected ? next.delete(l.id) : next.add(l.id)));
      return next;
    });
  };

  const canSend = subject.trim() && bodyText.trim() && selected.size > 0;

  const send = () => {
    sendCampaign.mutate(
      { subject: subject.trim(), body_html: textToEmailHtml(bodyText), lead_ids: Array.from(selected) },
      {
        onSuccess: () => {
          toast.success(`Campaign queued for ${selected.size} recipient${selected.size === 1 ? "" : "s"}.`);
          router.push(`${basePath}/campaigns`);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <div className="max-w-5xl">
      <h1 className="text-lg font-semibold text-gray-900">New Campaign</h1>
      <p className="mt-1 text-sm text-gray-500">Choose recipients from your leads, write the email, and send.</p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-5">
          <Input label="Subject" required value={subject} onChange={(e) => setSubject(e.target.value)} />
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">
              Message <span className="text-secondary">*</span>
            </label>
            <textarea
              rows={12}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder={"Hi there,\n\nWrite your message the way you'd write an email. Leave a blank line to start a new paragraph.\n\nVisit https://careercentra.icentra.com to see our programs."}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm leading-relaxed outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            />
            <p className="text-xs text-gray-400">
              Plain English is fine — paragraphs, line breaks and web links are formatted for email automatically.
            </p>
          </div>
          {bodyText.trim() && (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-900">Preview</p>
              <div
                className="rounded-xl border border-gray-100 bg-white p-5"
                // Safe: textToEmailHtml escapes everything the marketer typed before wrapping it.
                dangerouslySetInnerHTML={{ __html: textToEmailHtml(bodyText) }}
              />
            </div>
          )}
          <div className="flex justify-end">
            <Button type="button" disabled={!canSend} onClick={() => setConfirming(true)} className="w-auto px-6">
              Send to {selected.size} {selected.size === 1 ? "recipient" : "recipients"}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads…"
              className="w-full rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            />
            <button
              type="button"
              onClick={toggleVisible}
              disabled={leads.length === 0}
              className="shrink-0 text-xs font-medium text-secondary hover:underline disabled:opacity-50"
            >
              {allVisibleSelected ? "Clear visible" : "Select visible"}
            </button>
          </div>
          <div className="max-h-120 overflow-y-auto rounded-2xl border border-gray-100 bg-white">
            {isLoading && <p className="p-4 text-sm text-gray-400">Loading leads…</p>}
            {!isLoading && leads.length === 0 && <p className="p-4 text-sm text-gray-400">No leads match.</p>}
            {leads.map((lead) => (
              <label
                key={lead.id}
                className="flex cursor-pointer items-center gap-3 border-b border-gray-50 px-4 py-3 last:border-0 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selected.has(lead.id)}
                  onChange={() => toggle(lead.id)}
                  className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-gray-900">{crmLeadName(lead)}</span>
                  <span className="block truncate text-xs text-gray-400">{lead.email}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        open={confirming}
        title="Send campaign now?"
        description={`This emails ${selected.size} lead${selected.size === 1 ? "" : "s"} immediately. It can't be recalled once queued.`}
        confirmLabel="Send now"
        loading={sendCampaign.isPending}
        onConfirm={send}
        onClose={() => setConfirming(false)}
      />
    </div>
  );
}
