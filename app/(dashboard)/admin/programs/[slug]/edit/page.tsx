"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useProgram } from "@/hooks/queries/programs";
import { usePatchProgram } from "@/hooks/mutations/programs";
import { ProgramForm, EMPTY_CERTIFICATION } from "@/components/dashboard/program-form";
import { FormSkeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useProgramAddons } from "@/hooks/queries/addons";

const EditProgramPage = () => {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: program, isLoading } = useProgram(params.slug);
  const patchProgram = usePatchProgram(params.slug);
  const { data: addons } = useProgramAddons(params.slug);

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
          existingCoverImageUrl={program.cover_image_url || undefined}
          existingBadgeImageUrl={program.badge_image_url || undefined}
          existingResources={program.resources}
          initialValues={{
            title: program.title,
            code: program.code,
            description: program.summary,
            programType: program.program_type,
            pmiBadge: program.has_pmi_badge,
            pecbBadge: program.has_pecb_badge,
            icentraBadge: program.has_icentra_badge,
            isBestseller: program.is_bestseller,
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
                router.push("/admin/programs");
              },
              onError: (err) => toast.error(err.message),
            })
          }
        />
      </div>

      <Link
        href={`/admin/programs/${params.slug}/addons`}
        className="mt-8 flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:bg-gray-50"
      >
        <div>
          <p className="text-sm font-semibold text-gray-900">Add-ons</p>
          <p className="mt-1 text-xs text-gray-500">
            {addons ? `${addons.length} add-on${addons.length === 1 ? "" : "s"}` : "Loading…"} · coaching, exams, question banks
          </p>
        </div>
        <span className="text-sm font-medium text-secondary">Manage →</span>
      </Link>
    </div>
  );
};

export default EditProgramPage;
