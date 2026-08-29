"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateProgram } from "@/hooks/mutations/programs";
import { ProgramForm } from "@/components/dashboard/program-form";

const CreateProgramPage = () => {
  const router = useRouter();
  const createProgram = useCreateProgram();

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Create Program/Course</h1>
      <p className="mt-1 text-sm text-gray-500">
        Configure program details, level, accreditation and pricing.
      </p>

      <div className="mt-8">
        <ProgramForm
          submitLabel="Create"
          isPending={createProgram.isPending}
          onClose={() => router.push("/admin/programs")}
          onSubmit={(payload) =>
            createProgram.mutate(payload, {
              onSuccess: () => {
                toast.success("Program created.");
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
