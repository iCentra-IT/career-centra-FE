"use client";

import { useCourseResources } from "@/hooks/queries/students";
import { Modal } from "@/components/ui/modal";

function FileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="shrink-0 text-secondary">
      <path
        d="M5 2h5.5L14 5.5V15a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M10 2v3.5H14" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

export function CourseResourcesModal({
  open,
  onClose,
  programSlug,
  programTitle,
}: {
  open: boolean;
  onClose: () => void;
  programSlug: string;
  programTitle: string;
}) {
  // Only fires while the modal is actually open — no point fetching resources for every enrolled
  // course up front.
  const { data: resources, isLoading, isError } = useCourseResources(programSlug, open);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="text-left">
        <h2 className="text-lg font-semibold text-gray-900">Course Resources</h2>
        <p className="mt-1 text-sm text-gray-500">{programTitle}</p>

        <div className="mt-5 flex flex-col gap-2">
          {isLoading && <p className="text-sm text-gray-400">Loading resources…</p>}
          {isError && (
            <p className="text-sm text-red-500">
              Couldn&apos;t load resources for this course. Try again in a moment.
            </p>
          )}
          {!isLoading && !isError && resources?.length === 0 && (
            <p className="text-sm text-gray-400">No resources have been uploaded for this course yet.</p>
          )}
          {resources
            ?.slice()
            .sort((a, b) => a.order - b.order)
            .map((resource) => (
              <a
                key={resource.id}
                href={resource.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-gray-100 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FileIcon />
                <span className="min-w-0 flex-1 truncate">{resource.title}</span>
                <span className="shrink-0 text-xs font-medium text-secondary">Download</span>
              </a>
            ))}
        </div>
      </div>
    </Modal>
  );
}
