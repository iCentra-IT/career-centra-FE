"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateCareerPath } from "@/hooks/mutations/career-paths";
import { CareerPathForm } from "@/components/dashboard/career-path-form";

const CreateCareerPathPage = () => {
  const router = useRouter();
  const createCareerPath = useCreateCareerPath();

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Career Path</h1>
      <p className="mt-1 text-sm text-gray-500">
        Define the pathway, link its programs, and set levels, certifications and skills.
      </p>

      <div className="mt-8">
        <CareerPathForm
          submitLabel="Create"
          isPending={createCareerPath.isPending}
          onClose={() => router.push("/admin/career-paths")}
          onSubmit={(payload) =>
            createCareerPath.mutate(payload, {
              onSuccess: () => {
                toast.success("Career path created.");
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

export default CreateCareerPathPage;
