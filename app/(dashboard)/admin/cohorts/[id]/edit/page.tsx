"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCohort } from "@/hooks/queries/cohort";
import { usePatchCohort } from "@/hooks/mutations/cohort";
import { usePrograms } from "@/hooks/queries/programs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormSkeleton } from "@/components/ui/skeleton";

const schema = z.object({
  program: z.string().min(1, "Program is required"),
  starts_on: z.string().min(1, "Cohort date is required"),
  duration_weeks: z.coerce.number().min(1, "Duration is required"),
  seat_capacity: z.coerce.number().min(1, "Class capacity is required"),
  price_usd: z.coerce.number().min(0, "Price is required"),
  facilitator_name: z.string().min(1, "Facilitator is required"),
});
type FormValues = z.infer<typeof schema>;

const EditCohortPage = () => {
  const params = useParams<{ id: string }>();
  const cohortId = Number(params.id);
  const router = useRouter();
  const { data: cohort, isLoading } = useCohort(cohortId);
  const { data: programs } = usePrograms();
  const patchCohort = usePatchCohort(cohortId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!cohort) return;
    reset({
      program: String(cohort.program.id),
      starts_on: cohort.starts_on,
      duration_weeks: cohort.duration_weeks,
      seat_capacity: cohort.seat_capacity,
      price_usd: parseFloat(cohort.effective_price_usd),
      facilitator_name: cohort.facilitator_name,
    });
  }, [cohort, reset]);

  const onSubmit = (values: FormValues) => {
    const startsOn = new Date(values.starts_on);
    const endsOn = new Date(startsOn.getTime() + values.duration_weeks * 7 * 86_400_000);

    patchCohort.mutate(
      {
        program: Number(values.program),
        starts_on: values.starts_on,
        ends_on: endsOn.toISOString().slice(0, 10),
        seat_capacity: values.seat_capacity,
        price_override_usd: values.price_usd.toFixed(2),
        facilitator_name: values.facilitator_name,
      },
      {
        onSuccess: () => {
          toast.success("Cohort updated.");
          router.push("/admin/cohorts");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  if (isLoading) return <FormSkeleton fields={6} />;
  if (!cohort) return <p className="text-sm text-gray-400">Cohort not found.</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-semibold text-gray-900">Edit Cohort</h1>
      <p className="mt-1 text-sm text-gray-500">Update dates, capacity, facilitator and status.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-900">
            Program <span className="text-secondary">*</span>
          </label>
          <select
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            {...register("program")}
          >
            {programs?.results?.map((program) => (
              <option key={program.id} value={program.id}>
                {program.title}
              </option>
            ))}
          </select>
          {errors.program && <p className="text-xs text-red-500">{errors.program.message}</p>}
        </div>

        <Input
          label="Cohort Date"
          type="date"
          required
          error={errors.starts_on?.message}
          {...register("starts_on")}
        />

        <Input
          label="Duration"
          type="number"
          required
          placeholder="enter duration in weeks"
          error={errors.duration_weeks?.message}
          {...register("duration_weeks")}
        />

        <Input
          label="Class Capacity"
          type="number"
          required
          placeholder="Enter class capacity"
          error={errors.seat_capacity?.message}
          {...register("seat_capacity")}
        />

        <Input
          label="Price"
          type="number"
          step="0.01"
          required
          placeholder="0.00"
          error={errors.price_usd?.message}
          {...register("price_usd")}
        />

        <Input
          label="Facilitator"
          required
          placeholder="Enter facilitator name"
          error={errors.facilitator_name?.message}
          {...register("facilitator_name")}
        />

        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/cohorts")}
            className="rounded-md border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <Button type="submit" loading={patchCohort.isPending} className="w-auto px-6">
            Save
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditCohortPage;
