"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useFacilitatorApplications } from "@/hooks/queries/facilitator-applications";
import { useApprovedFacilitators } from "@/hooks/queries/facilitator-profiles";
import { usePatchFacilitatorApplication } from "@/hooks/mutations/facilitator-applications";
import {
  useDeleteFacilitatorProfile,
  useInviteFacilitator,
  usePatchFacilitatorProfile,
} from "@/hooks/mutations/facilitator-profiles";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyTableState } from "@/components/ui/empty-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { TagListField } from "@/components/dashboard/tag-list-field";
import { ImageFileField } from "@/components/dashboard/image-file-field";
import { TableSkeleton } from "@/components/ui/skeleton";
import { formatOrdinalDateTime } from "@/lib/format";
import type { FacilitatorApplication, FacilitatorProfile } from "@/types/facilitator";

const APPLICATIONS_COLUMNS = ["Applicant", "Email", "Domains", "Status", "Submitted", "Action"];
const APPROVED_COLUMNS = ["Facilitator", "Bio", "Credentials", "Status", "Action"];

const inviteSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});
type InviteFormValues = z.infer<typeof inviteSchema>;

const TABS = [
  { key: "applications", label: "Facilitator Applications" },
  { key: "approved", label: "Approved Facilitators" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function statusTone(status: string): "green" | "yellow" | "red" | "gray" {
  if (status === "approved") return "green";
  if (status === "submitted" || status === "under_review") return "yellow";
  if (status === "rejected") return "red";
  return "gray";
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M13 13l-2.5-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ApplicationDrawer({
  application,
  onClose,
}: {
  application: FacilitatorApplication;
  onClose: () => void;
}) {
  const [status, setStatus] = useState(application.status);
  const patchApplication = usePatchFacilitatorApplication(application.id);

  const handleUpdate = () => {
    patchApplication.mutate(
      { status },
      {
        onSuccess: () => {
          toast.success("Application updated.");
          onClose();
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Application Details</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">User</p>
              <p className="mt-1 text-gray-900">{application.full_name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Email</p>
              <p className="mt-1 text-gray-900">{application.email}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Phone</p>
              <p className="mt-1 text-gray-900">{application.phone || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Domains</p>
              <p className="mt-1 text-gray-900">{application.domain_areas.join(", ") || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Certifications Held
              </p>
              <p className="mt-1 text-gray-900">{application.certifications_held.join(", ") || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Experience
              </p>
              <p className="mt-1 text-gray-900">{application.experience_years} years</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Motivation
              </p>
              <p className="mt-1 text-gray-600">{application.motivation_statement || "—"}</p>
            </div>
            {application.linkedin_url && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">LinkedIn</p>
                <a
                  href={application.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-secondary hover:underline"
                >
                  {application.linkedin_url}
                </a>
              </div>
            )}
            {application.cv_url && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">CV</p>
                <a
                  href={application.cv_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  {application.cv_original_filename || "Download CV"}
                </a>
              </div>
            )}
            {application.ats_score > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  ATS Score
                </p>
                <p className="mt-1 text-gray-900">
                  {application.ats_score} ({application.ats_result_display})
                </p>
                {application.ats_feedback && (
                  <p className="mt-1 text-xs text-gray-500">{application.ats_feedback}</p>
                )}
              </div>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Updated At
              </p>
              <p className="mt-1 text-gray-900">{formatOrdinalDateTime(application.updated_at)}</p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-900">
                Status <span className="text-secondary">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              >
                {STATUS_OPTIONS.filter((o) => o.value).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 px-6 py-4">
          <Button
            type="button"
            loading={patchApplication.isPending}
            disabled={status === application.status}
            onClick={handleUpdate}
            className="w-auto px-6"
          >
            Update
          </Button>
        </div>
      </div>
    </div>
  );
}

function InviteFacilitatorModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [shortBio, setShortBio] = useState("");
  const [credentialTags, setCredentialTags] = useState<string[]>([""]);
  const [isPublished, setIsPublished] = useState(true);
  const inviteFacilitator = useInviteFacilitator();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormValues>({ resolver: zodResolver(inviteSchema) });

  const resetAll = () => {
    reset();
    setAvatarFile(null);
    setShortBio("");
    setCredentialTags([""]);
    setIsPublished(true);
  };

  const onSubmit = (values: InviteFormValues) => {
    inviteFacilitator.mutate(
      {
        ...values,
        avatar: avatarFile ?? undefined,
        short_bio: shortBio.trim() || undefined,
        credential_tags: credentialTags.map((t) => t.trim()).filter(Boolean),
        is_published: isPublished,
      },
      {
        onSuccess: () => {
          toast.success("Invite sent.");
          resetAll();
          onClose();
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        resetAll();
        onClose();
      }}
    >
      <div className="text-left">
        <h2 className="text-lg font-semibold text-gray-900">Invite Facilitator</h2>
        <p className="mt-1 text-sm text-gray-500">
          Links an existing account by email, or creates one and emails a set-password link.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-6 flex flex-col gap-5">
            <Input
              label="Email"
              type="email"
              required
              placeholder="jane@company.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input label="First Name" placeholder="Jane" {...register("first_name")} />
              <Input label="Last Name" placeholder="Smith" {...register("last_name")} />
            </div>

            <ImageFileField label="Avatar" file={avatarFile} onChange={setAvatarFile} />

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-900">Short Bio</label>
              <textarea
                rows={3}
                value={shortBio}
                onChange={(e) => setShortBio(e.target.value)}
                placeholder="A short introduction shown on the public facilitator directory"
                className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              />
            </div>

            <TagListField
              label="Credential Tags"
              addLabel="Add credential"
              required={false}
              values={credentialTags}
              onChange={setCredentialTags}
            />

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              Publish to the public facilitator directory
            </label>
          </div>

          <Button type="submit" loading={inviteFacilitator.isPending} className="mt-6">
            Send Invite
          </Button>
        </form>
      </div>
    </Modal>
  );
}

function EditFacilitatorModal({
  facilitator,
  onClose,
}: {
  facilitator: FacilitatorProfile;
  onClose: () => void;
}) {
  const [fullName, setFullName] = useState(facilitator.full_name);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [shortBio, setShortBio] = useState(facilitator.short_bio);
  const [credentialTags, setCredentialTags] = useState<string[]>(
    facilitator.credential_tags.length > 0 ? facilitator.credential_tags : [""],
  );
  const [isPublished, setIsPublished] = useState(facilitator.is_published);
  const patchProfile = usePatchFacilitatorProfile(facilitator.id);

  const handleSave = () => {
    patchProfile.mutate(
      {
        full_name: fullName.trim(),
        avatar: avatarFile ?? undefined,
        short_bio: shortBio.trim(),
        credential_tags: credentialTags.map((t) => t.trim()).filter(Boolean),
        is_published: isPublished,
      },
      {
        onSuccess: () => {
          toast.success("Facilitator profile updated.");
          onClose();
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <Modal open onClose={onClose}>
      <div className="text-left">
        <h2 className="text-lg font-semibold text-gray-900">Edit Facilitator</h2>

        <div className="mt-6 flex flex-col gap-5">
          <Input label="Full Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />

          <ImageFileField
            label="Avatar"
            existingImageUrl={facilitator.avatar_url || undefined}
            file={avatarFile}
            onChange={setAvatarFile}
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">Short Bio</label>
            <textarea
              rows={3}
              value={shortBio}
              onChange={(e) => setShortBio(e.target.value)}
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            />
          </div>

          <TagListField
            label="Credential Tags"
            addLabel="Add credential"
            required={false}
            values={credentialTags}
            onChange={setCredentialTags}
          />

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            Published to the public facilitator directory
          </label>
        </div>

        <Button type="button" loading={patchProfile.isPending} onClick={handleSave} className="mt-6">
          Save Changes
        </Button>
      </div>
    </Modal>
  );
}

function DeleteFacilitatorButton({ facilitator }: { facilitator: FacilitatorProfile }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteProfile = useDeleteFacilitatorProfile();

  const handleDelete = () => {
    deleteProfile.mutate(facilitator.id, {
      onSuccess: () => {
        toast.success(`${facilitator.full_name} removed.`);
        setConfirmOpen(false);
      },
      onError: (err) => {
        toast.error(err.message);
        setConfirmOpen(false);
      },
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
      <ConfirmDeleteModal
        open={confirmOpen}
        title="Remove this facilitator profile?"
        description={`${facilitator.full_name} will be removed from the facilitator directory.`}
        loading={deleteProfile.isPending}
        onConfirm={handleDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
}

const AdminFacilitatorsPage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("applications");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<FacilitatorApplication | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editFacilitator, setEditFacilitator] = useState<FacilitatorProfile | null>(null);

  const { data: applications, isLoading } = useFacilitatorApplications({
    search: search.trim() || undefined,
    status: status || undefined,
  });
  const { data: approvedFacilitators, isLoading: approvedLoading } = useApprovedFacilitators();

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

      {activeTab === "applications" ? (
        <div className="mt-8">
          <h1 className="text-3xl font-semibold text-gray-900">Facilitator applications</h1>
          <p className="mt-1 text-sm text-gray-500">Review and process facilitator applications.</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="relative max-w-xs flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by applicant name"
                className="w-full rounded-md border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-md border border-gray-200 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white">
            {isLoading ? (
              <TableSkeleton columns={APPLICATIONS_COLUMNS} />
            ) : (applications ?? []).length === 0 ? (
              <EmptyTableState columns={APPLICATIONS_COLUMNS} message="No applications match yet." />
            ) : (
              <table className="w-full min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
                    {APPLICATIONS_COLUMNS.map((col) => (
                      <th key={col} className="px-5 py-3 font-medium">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applications?.map((application) => (
                    <tr key={application.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => setSelected(application)}
                          className="font-medium text-gray-900 hover:text-secondary"
                        >
                          {application.full_name}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{application.email}</td>
                      <td className="px-5 py-4 text-gray-600">
                        {application.domain_areas.join(", ") || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge
                          label={application.status_display}
                          tone={statusTone(application.status)}
                        />
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {formatOrdinalDateTime(application.submitted_at)}
                      </td>
                      <td className="px-5 py-4">
                        {application.cv_url ? (
                          <a
                            href={application.cv_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Download
                          </a>
                        ) : (
                          <span className="text-xs text-gray-300">No CV</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Approved facilitators</h1>
              <p className="mt-1 text-sm text-gray-500">
                Directory of approved facilitator profiles. Cohort creation collects
                facilitator_name directly, so this list is for reference, not program assignment.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="rounded-md bg-main px-5 py-2.5 text-sm font-medium text-white hover:bg-deep-blue"
            >
              + Invite Facilitator
            </button>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white">
            {approvedLoading ? (
              <TableSkeleton columns={APPROVED_COLUMNS} />
            ) : (approvedFacilitators ?? []).length === 0 ? (
              <EmptyTableState columns={APPROVED_COLUMNS} message="No facilitator profiles published yet." />
            ) : (
              <table className="w-full min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
                    {APPROVED_COLUMNS.map((col) => (
                      <th key={col} className="px-5 py-3 font-medium">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {approvedFacilitators?.map((facilitator) => (
                    <tr key={facilitator.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {facilitator.avatar_url ? (
                            <img
                              src={facilitator.avatar_url}
                              alt={facilitator.full_name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/10 text-xs font-semibold text-secondary">
                              {facilitator.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-gray-900">{facilitator.full_name}</span>
                        </div>
                      </td>
                      <td className="max-w-xs px-5 py-4 text-gray-600">{facilitator.short_bio}</td>
                      <td className="px-5 py-4 text-gray-600">
                        {facilitator.credential_tags.join(", ") || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge
                          label={facilitator.is_published ? "Published" : "Draft"}
                          tone={facilitator.is_published ? "green" : "gray"}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditFacilitator(facilitator)}
                            className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <DeleteFacilitatorButton facilitator={facilitator} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {selected && <ApplicationDrawer application={selected} onClose={() => setSelected(null)} />}
      <InviteFacilitatorModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
      {editFacilitator && (
        <EditFacilitatorModal facilitator={editFacilitator} onClose={() => setEditFacilitator(null)} />
      )}
    </div>
  );
};

export default AdminFacilitatorsPage;
