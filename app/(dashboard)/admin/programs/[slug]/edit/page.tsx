"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useProgram } from "@/hooks/queries/programs";
import { usePatchProgram } from "@/hooks/mutations/programs";
import { ProgramForm, EMPTY_CERTIFICATION } from "@/components/dashboard/program-form";
import { clearPersistedStateByPrefix, discardStaleDraft } from "@/hooks/use-persisted-state";
import { FormSkeleton } from "@/components/ui/skeleton";

const EditProgramPage = () => {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: program, isLoading } = useProgram(params.slug);
  const patchProgram = usePatchProgram(params.slug);
  const persistKey = `program-edit-${params.slug}`;

  // Revisiting "edit this program" after abandoning a previous attempt should show the program's
  // real current data, not resurface the old draft — only an actual refresh of this page should
  // resume in-progress work. Called before the loading/not-found returns below so it always runs
  // on this page's first render (Rules of Hooks), ahead of ProgramForm's own persisted fields.
  useState(() => discardStaleDraft(persistKey));

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
          persistKey={persistKey}
          submitLabel="Save"
          isPending={patchProgram.isPending}
          onClose={() => router.push("/admin/programs")}
          existingCoverImageUrl={program.cover_image_url || undefined}
          initialValues={{
            title: program.title,
            code: program.code,
            description: program.summary,
            programType: program.program_type,
            pmiBadge: program.has_pmi_badge,
            pecbBadge: program.has_pecb_badge,
            icentraBadge: program.has_icentra_badge,
            certificateProvider: program.certificate_provider,
            level: program.level,
            audience: program.audience,
            pricingMode: program.pricing_mode,
            priceUsd: program.base_price_usd,
            priceNgn: program.base_price_ngn,
            learningOutcomes: program.learning_outcomes,
            whoShouldAttend: program.who_should_attend,
            prerequisites: program.prerequisites.map((p) => p.text),
            faqs: program.faqs,
            modules: program.modules.map((m) => ({
              title: m.title,
              lessons: m.lessons.map((l) => ({ title: l.title })),
            })),
            hasCertification: !!program.certification,
            certification: program.certification
              ? {
                  name: program.certification.name,
                  examFormat: program.certification.exam_format,
                  durationMinutes: String(program.certification.duration_minutes),
                  delivery: program.certification.delivery,
                  passRate: program.certification.pass_rate,
                }
              : EMPTY_CERTIFICATION,
          }}
          onSubmit={(payload) =>
            patchProgram.mutate(payload, {
              onSuccess: () => {
                toast.success("Program updated.");
                clearPersistedStateByPrefix(persistKey);
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
