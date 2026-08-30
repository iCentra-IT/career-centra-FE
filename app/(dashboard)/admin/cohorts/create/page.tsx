"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { usePrograms } from "@/hooks/queries/programs";
import { useCreateCohort } from "@/hooks/mutations/cohort";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  program: z.string().min(1, "Program is required"),
  starts_on: z.string().min(1, "Cohort date is required"),
  duration_weeks: z.coerce.number().min(1, "Duration is required"),
  seat_capacity: z.coerce.number().min(1, "Class capacity is required"),
  price_usd: z.coerce.number().min(0, "Price is required"),
  facilitator_name: z.string().min(1, "Facilitator is required"),
});
type FormValues = z.infer<typeof schema>;

const CreateCohortPage = () => {
  const router = useRouter();
  const { data: programListings } = usePrograms();
  // /api/programs/ bundles cohort instances, so dedupe by program id for the picker.
  const programs = Array.from(
    new Map((programListings ?? []).map((listing) => [listing.program.id, listing.program])).values(),
  );
  const createCohort = useCreateCohort();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    const startsOn = new Date(values.starts_on);
    const endsOn = new Date(startsOn.getTime() + values.duration_weeks * 7 * 86_400_000);

    createCohort.mutate(
      {
        program: Number(values.program),
        starts_on: values.starts_on,
        ends_on: endsOn.toISOString().slice(0, 10),
        seat_capacity: values.seat_capacity,
        price_override_usd: values.price_usd.toFixed(2),
        price_override_ngn: "0",
        facilitator_name: values.facilitator_name,
        is_active: true,
      },
      {
        onSuccess: () => {
          toast.success("Cohort created.");
          router.push("/admin/cohorts");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-semibold text-gray-900">Create Cohort</h1>
      <p className="mt-1 text-sm text-gray-500">Set dates, capacity, facilitator and status.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-900">
            Program <span className="text-secondary">*</span>
          </label>
          <select
            defaultValue=""
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            {...register("program")}
          >
            <option value="" disabled>
              select program
            </option>
            {programs.map((program) => (
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

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-900">Delivery Mode</label>
          <select
            disabled
            title="Not part of the cohort API yet"
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-400 disabled:cursor-not-allowed"
          >
            <option>Select level</option>
          </select>
        </div>

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
          <Button type="submit" loading={createCohort.isPending} className="w-auto px-6">
            Create
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateCohortPage;
