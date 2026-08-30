"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useProgram } from "@/hooks/queries/programs";
import { usePatchProgram } from "@/hooks/mutations/programs";
import { ProgramForm } from "@/components/dashboard/program-form";
import { FormSkeleton } from "@/components/ui/skeleton";

const EditProgramPage = () => {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: program, isLoading } = useProgram(params.slug);
  const patchProgram = usePatchProgram(params.slug);

  if (isLoading) return <FormSkeleton fields={8} />;
  if (!program) return <p className="text-sm text-gray-400">Program not found.</p>;

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Edit Program/Course</h1>
      <p className="mt-1 text-sm text-gray-500">
        Configure program details, level, accreditation and pricing.
      </p>

      <div className="mt-8">
        <ProgramForm
          submitLabel="Save"
          isPending={patchProgram.isPending}
          onClose={() => router.push("/admin/programs")}
          initialValues={{
            title: program.title,
            code: program.code,
            description: program.summary,
            programType: program.program_type,
            badge: program.has_pmi_badge ? "pmi" : program.has_pecb_badge ? "pecb" : "none",
            level: program.level,
            audience: program.audience,
            priceUsd: program.base_price_usd,
            priceNgn: program.base_price_ngn,
            learningOutcomes: program.learning_outcomes,
            whoShouldAttend: program.who_should_attend,
            prerequisites: program.prerequisites.map((p) => p.text),
            faqs: program.faqs,
          }}
          onSubmit={(payload) =>
            patchProgram.mutate(payload, {
              onSuccess: () => {
                toast.success("Program updated.");
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

export default EditProgramPage;
