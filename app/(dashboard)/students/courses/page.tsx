"use client";

import { useState } from "react";
import Link from "next/link";
import { useStudentCourses } from "@/hooks/queries/students";
import { CourseResourcesModal } from "@/components/dashboard/course-resources-modal";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CardGridSkeleton } from "@/components/ui/skeleton";
import { displayTitle, formatDateRange } from "@/lib/format";

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// "Active courses & progress" view-all destination — the one page that actually uses
// /api/students/courses/, which (unlike /students/enrolments) carries the program's marketing
// fields (cover image, accreditations) alongside progress, since it's meant to read like a course
// card rather than a receipt row.
const CoursesPage = () => {
  const { data, isLoading } = useStudentCourses();
  const courses = data?.active_courses ?? [];
  const [resourcesFor, setResourcesFor] = useState<{ slug: string; title: string } | null>(null);

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900">My courses</h1>
      <p className="mt-1 text-sm text-gray-500">The programs you&apos;re actively working through.</p>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading && <CardGridSkeleton count={4} />}
        {!isLoading && courses.length === 0 && (
          <p className="text-sm text-gray-400">No active courses yet.</p>
        )}
        {courses.map((course) => (
          <div key={course.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
            <div className="relative h-32 w-full bg-linear-to-br from-main to-deep-blue">
              {course.program.cover_image_url && (
                // eslint-disable-next-line @next/next/no-img-element -- presigned URL, not worth configuring next/image's domains for
                <img src={course.program.cover_image_url} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="p-5">
              <span className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                {course.program.program_type}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-gray-900">{displayTitle(course.program.title)}</h3>
              {course.program.summary && (
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">{course.program.summary}</p>
              )}

              {course.program.accreditations.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {course.program.accreditations.map((a, i) => (
                    <span key={i} className="rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-600">
                      {a.issuer} · {a.label}
                    </span>
                  ))}
                </div>
              )}

              <p className="mt-3 text-sm text-gray-500">
                {formatDateRange(course.cohort.starts_on, course.cohort.ends_on)} ·{" "}
                {capitalize(course.cohort.delivery_mode)}
              </p>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1">
                  <ProgressBar percent={course.progress.percent} />
                </div>
                <span className="text-xs font-medium text-gray-500">{course.progress.percent}%</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-50 pt-4">
                <Link
                  href="/students/schedules"
                  className="inline-flex rounded-full bg-secondary/10 px-4 py-2 text-sm font-medium text-secondary hover:bg-secondary/20"
                >
                  Class schedule
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    setResourcesFor({ slug: course.program.slug, title: displayTitle(course.program.title) })
                  }
                  className="inline-flex rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Resources
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {resourcesFor && (
        <CourseResourcesModal
          open
          onClose={() => setResourcesFor(null)}
          programSlug={resourcesFor.slug}
          programTitle={resourcesFor.title}
        />
      )}
    </div>
  );
};

export default CoursesPage;
