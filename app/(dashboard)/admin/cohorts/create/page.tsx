"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { usePrograms } from "@/hooks/queries/programs";
import { useApprovedFacilitators } from "@/hooks/queries/facilitator-profiles";
import { useCreateCohort } from "@/hooks/mutations/cohort";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const DELIVERY_MODE_OPTIONS = [
  { value: "online", label: "Live Online" },
  { value: "hybrid", label: "Blended" },
  { value: "in_person", label: "In Person" },
];

const schema = z.object({
  program: z.string().min(1, "Program is required"),
  starts_on: z.string().min(1, "Cohort date is required"),
  duration_weeks: z.coerce.number().min(1, "Duration is required"),
  delivery_mode: z.string().min(1, "Delivery mode is required"),
  location: z.string().optional(),
  seat_capacity: z.coerce.number().min(1, "Class capacity is required"),
  price_usd: z.coerce.number().min(0, "USD price is required"),
  price_ngn: z.coerce.number().min(0, "NGN price is required"),
  facilitator_name: z.string().min(1, "Facilitator is required"),
});
type FormValues = z.infer<typeof schema>;

const CreateCohortPage = () => {
  const router = useRouter();
  const { data: programs } = usePrograms();
  const { data: facilitators } = useApprovedFacilitators();
  const createCohort = useCreateCohort();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    createCohort.mutate(
      {
        program: Number(values.program),
        starts_on: values.starts_on,
        duration_weeks: values.duration_weeks,
        delivery_mode: values.delivery_mode,
        location: values.location?.trim() ?? "",
        seat_capacity: values.seat_capacity,
        price_override_usd: values.price_usd.toFixed(2),
        price_override_ngn: values.price_ngn.toFixed(2),
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

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-900">
            Delivery Mode <span className="text-secondary">*</span>
          </label>
          <select
            defaultValue=""
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            {...register("delivery_mode")}
          >
            <option value="" disabled>
              Select delivery mode
            </option>
            {DELIVERY_MODE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.delivery_mode && (
            <p className="text-xs text-red-500">{errors.delivery_mode.message}</p>
          )}
        </div>

        <Input
          label="Location"
          placeholder="e.g. Lagos, Nigeria (leave blank for fully online)"
          {...register("location")}
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

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Price (USD)"
            type="number"
            step="0.01"
            // required
            placeholder="$0.00"
            error={errors.price_usd?.message}
            {...register("price_usd")}
          />
          <Input
            label="Price (NGN)"
            type="number"
            step="0.01"
            // required
            placeholder="₦0.00"
            error={errors.price_ngn?.message}
            {...register("price_ngn")}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-900">
            Facilitator <span className="text-secondary">*</span>
          </label>
          <select
            defaultValue=""
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            {...register("facilitator_name")}
          >
            <option value="" disabled>
              Select facilitator
            </option>
            {facilitators?.map((facilitator) => (
              <option key={facilitator.id} value={facilitator.full_name}>
                {facilitator.full_name}
              </option>
            ))}
          </select>
          {errors.facilitator_name && (
            <p className="text-xs text-red-500">{errors.facilitator_name.message}</p>
          )}
        </div>

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
