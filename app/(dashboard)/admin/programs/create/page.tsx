"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateProgram } from "@/hooks/mutations/programs";
import { ProgramForm } from "@/components/dashboard/program-form";
import { clearPersistedStateByPrefix, discardStaleDraft } from "@/hooks/use-persisted-state";

const PERSIST_KEY = "program-create";

const CreateProgramPage = () => {
  const router = useRouter();
  const createProgram = useCreateProgram();

  // Every "create program" visit shares this one draft key, so without this a form abandoned
  // partway through would silently resurface (mixed with whatever's different this time) the next
  // time anyone opens "create" — only an actual refresh of this page should resume it. Runs once,
  // before ProgramForm's own persisted fields ever read localStorage (lazy useState initializers
  // run during this component's own first render, ahead of any child mounting).
  useState(() => discardStaleDraft(PERSIST_KEY));

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Create Program/Course</h1>
      <p className="mt-1 text-sm text-gray-500">
        Configure program details, level, accreditation and pricing.
      </p>

      <div className="mt-8">
        <ProgramForm
          persistKey={PERSIST_KEY}
          submitLabel="Create"
          isPending={createProgram.isPending}
          onClose={() => router.push("/admin/programs")}
          onSubmit={(payload) =>
            createProgram.mutate(payload, {
              onSuccess: () => {
                toast.success("Program created.");
                clearPersistedStateByPrefix(PERSIST_KEY);
                router.push("/admin/programs");
              },
              onError: (err) => toast.error(err.message),
            })
          }
        />
      </div>
    </div>
  );
};

export default CreateProgramPage;
