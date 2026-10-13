"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCrmLeads } from "@/hooks/queries/crm";
import { useSendCampaign, useUploadCampaignImage } from "@/hooks/mutations/crm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { crmLeadName } from "@/lib/crm";
import { textToEmailHtml } from "@/lib/crm-email";

// Prompts for a URL + display text and hands the markdown snippet back via `onInsert`. The caller
// owns cursor position — this modal only knows how to build `[text](url)`.
function InsertLinkModal({
  open,
  onClose,
  onInsert,
}: {
  open: boolean;
  onClose: () => void;
  onInsert: (snippet: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");

  const reset = () => {
    setUrl("");
    setLabel("");
    setError("");
  };

  const submit = () => {
    if (!/^https?:\/\//i.test(url.trim())) {
      setError("Link URL must start with http:// or https://");
      return;
    }
    onInsert(`[${(label.trim() || url.trim())}](${url.trim()})`);
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              reset();
              onClose();
            }}
            className="rounded-md border border-gray-300 bg-gray-50 px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-gray-400 hover:bg-gray-100"
          >
            Cancel
          </button>
          <Button type="button" onClick={submit} className="w-auto px-5">
            Insert Link
          </Button>
        </div>
      }
    >
      <div className="text-left">
        <h2 className="text-lg font-semibold text-gray-900">Insert Link</h2>
        <p className="mt-1 text-sm text-gray-500">
          The display text shows in the email; the URL stays hidden until it's clicked.
        </p>
        <div className="mt-5 flex flex-col gap-4">
          <Input
            label="Link URL"
            required
            placeholder="https://careercentra.icentra.com"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError("");
            }}
            error={error}
          />
          <Input
            label="Display text"
            placeholder="e.g. See our programs"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}

// Picks a file, lets the marketer name alt text, uploads it, and hands the markdown snippet back
// via `onInsert` once the upload succeeds.
function InsertImageModal({
  open,
  onClose,
  onInsert,
}: {
  open: boolean;
  onClose: () => void;
  onInsert: (snippet: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImage = useUploadCampaignImage();
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");

  const reset = () => {
    setFile(null);
    setAlt("");
  };

  const submit = () => {
    if (!file) return;
    uploadImage.mutate(file, {
      onSuccess: ({ url }) => {
        onInsert(`![${alt}](${url})`);
        reset();
        onClose();
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              reset();
              onClose();
            }}
            className="rounded-md border border-gray-300 bg-gray-50 px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-gray-400 hover:bg-gray-100"
          >
            Cancel
          </button>
          <Button type="button" onClick={submit} disabled={!file} loading={uploadImage.isPending} className="w-auto px-5">
            Insert Image
          </Button>
        </div>
      }
    >
      <div className="text-left">
        <h2 className="text-lg font-semibold text-gray-900">Insert Image</h2>
        <p className="mt-1 text-sm text-gray-500">The image is embedded and shown directly in the email body.</p>
        <div className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">
              Image <span className="text-secondary">*</span>
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-md border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 hover:bg-gray-50"
            >
              {file ? file.name : "Click to choose an image"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const picked = e.target.files?.[0] ?? null;
                setFile(picked);
                if (picked && !alt) setAlt(picked.name.replace(/\.[^.]+$/, ""));
              }}
            />
          </div>
          <Input
            label="Alt text"
            placeholder="Shown if the image fails to load"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}

// Recipients are picked from the lead list only. Opted-out leads are excluded server-side even
// if selected here, so the count shown is what was selected, not necessarily what gets emailed.
export function CrmCampaignCompose({ basePath }: { basePath: string }) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
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

  // Inserts `snippet` at the current cursor position (replacing any selection), then restores
  // focus with the cursor placed right after what was inserted.
  const insertAtCursor = (snippet: string) => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? bodyText.length;
    const end = textarea?.selectionEnd ?? bodyText.length;
    setBodyText((current) => `${current.slice(0, start)}${snippet}${current.slice(end)}`);
    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(start + snippet.length, start + snippet.length);
    });
  };

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
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setImageModalOpen(true)}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Insert Image
              </button>
              <button
                type="button"
                onClick={() => setLinkModalOpen(true)}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Insert Link
              </button>
            </div>
            <textarea
              ref={textareaRef}
              rows={12}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder={"Hi there,\n\nWrite your message the way you'd write an email. Leave a blank line to start a new paragraph.\n\nVisit https://careercentra.icentra.com to see our programs."}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm leading-relaxed outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            />
            <p className="text-xs text-gray-400">
              Plain English is fine, paragraphs, line breaks and web links are formatted for email automatically.
              Use "Insert Image" to embed a picture, or "Insert Link" to show text instead of a raw URL.
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

      <InsertLinkModal open={linkModalOpen} onClose={() => setLinkModalOpen(false)} onInsert={insertAtCursor} />
      <InsertImageModal open={imageModalOpen} onClose={() => setImageModalOpen(false)} onInsert={insertAtCursor} />

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
