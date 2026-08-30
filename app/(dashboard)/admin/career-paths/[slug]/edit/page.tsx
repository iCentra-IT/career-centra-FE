"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCareerPath } from "@/hooks/queries/career-paths";
import { usePatchCareerPath } from "@/hooks/mutations/career-paths";
import { CareerPathForm } from "@/components/dashboard/career-path-form";
import { FormSkeleton } from "@/components/ui/skeleton";

const EditCareerPathPage = () => {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: pathway, isLoading } = useCareerPath(params.slug);
  const patchCareerPath = usePatchCareerPath(params.slug);

  if (isLoading) return <FormSkeleton fields={7} />;
  if (!pathway) return <p className="text-sm text-gray-400">Career path not found.</p>;

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Edit Career Path</h1>
      <p className="mt-1 text-sm text-gray-500">
        Update the pathway, its linked programs, levels, certifications and skills.
      </p>

      <div className="mt-8">
        <CareerPathForm
          submitLabel="Save"
          isPending={patchCareerPath.isPending}
          onClose={() => router.push("/admin/career-paths")}
          initialValues={{
            title: pathway.title,
            description: pathway.description,
            levels: pathway.levels,
            certifications: pathway.certifications,
            skills: pathway.skills,
            suitable_roles: pathway.suitable_roles,
            programIds: pathway.programs.map((p) => p.id),
          }}
          onSubmit={(payload) =>
            patchCareerPath.mutate(payload, {
              onSuccess: () => {
                toast.success("Career path updated.");
                router.push("/admin/career-paths");
              },
              onError: (err) => toast.error(err.message),
            })
          }
        />
      </div>
    </div>
  );
};

export default EditCareerPathPage;
