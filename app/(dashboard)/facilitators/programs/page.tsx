"use client";

import Link from "next/link";
import { FACILITATOR_PROGRAMS } from "@/lib/facilitator-placeholder";

const FacilitatorProgramsPage = () => {
  const programs = FACILITATOR_PROGRAMS;

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900">My programs</h1>
      <p className="mt-1 text-sm text-gray-500">Programs you are assigned to facilitate.</p>

      {programs.length === 0 ? (
        <p className="mt-8 text-sm text-gray-400">You have not been assigned to any programs yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {programs.map((program) => (
            <div
              key={program.id}
              className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                  {program.code}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  {program.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <h2 className="mt-4 text-xl font-semibold text-gray-900">{program.title}</h2>

              <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <dt className="text-sm text-gray-400">Level</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">{program.level}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-400">Enrolled</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">
                    {program.enrolledCount} learners
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-400">Next cohort</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">
                    {program.nextCohortDate}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-400">Duration</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">
                    {program.durationWeeks} weeks
                  </dd>
                </div>
              </dl>

              <div className="mt-6 border-t border-gray-100 pt-6">
                <Link
                  href={`/facilitators/programs/${program.id}`}
                  className="inline-flex rounded-full bg-secondary/10 px-5 py-2.5 text-sm font-medium text-secondary hover:bg-secondary/20"
                >
                  Class schedule
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacilitatorProgramsPage;
