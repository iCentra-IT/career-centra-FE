"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useActiveLeadMagnet } from "@/hooks/queries/crm";
import { useDownloadLeadMagnet } from "@/hooks/mutations/crm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const POPUP_DELAY_MS = 15000;
const SUPPRESS_DAYS = 7;
// Routes where an unprompted popup would interrupt an in-progress purchase rather than idle
// browsing — the one place a site-wide popup genuinely shouldn't show.
const EXCLUDED_PREFIXES = ["/cart", "/orders"];

interface PopupState {
  downloaded?: boolean;
  dismissedAt?: number;
}

function storageKey(slug: string) {
  return `lead_magnet_popup:${slug}`;
}

function readState(slug: string): PopupState {
  try {
    const raw = localStorage.getItem(storageKey(slug));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeState(slug: string, state: PopupState) {
  try {
    localStorage.setItem(storageKey(slug), JSON.stringify(state));
  } catch {
    // localStorage can be unavailable (privacy mode) — the popup just won't remember next time.
  }
}

// Site-wide popup for the one lead magnet staff have marked active (replaces the old top banner +
// separate click-to-open gate). Appears once per visitor after a delay, so it never greets someone
// before the page has even rendered, then stays quiet: dismissing it suppresses it for a week,
// downloading it suppresses it for good. Skipped outright on checkout-adjacent routes so it never
// interrupts a purchase in progress.
export function LeadMagnetModal() {
  const pathname = usePathname();
  const { data: magnet, isLoading } = useActiveLeadMagnet();
  const download = useDownloadLeadMagnet(magnet?.slug ?? "");
  const [open, setOpen] = useState(false);

  const excluded = EXCLUDED_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

  useEffect(() => {
    if (isLoading || !magnet || excluded) return;

    const { downloaded, dismissedAt } = readState(magnet.slug);
    if (downloaded) return;
    if (dismissedAt && Date.now() - dismissedAt < SUPPRESS_DAYS * 24 * 60 * 60 * 1000) return;

    const timer = setTimeout(() => setOpen(true), POPUP_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isLoading, magnet, excluded]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  if (!magnet) return null;

  const close = () => {
    writeState(magnet.slug, { dismissedAt: Date.now() });
    setOpen(false);
  };

  const onSubmit = (values: FormValues) => {
    download.mutate(
      {
        email: values.email.trim(),
        first_name: values.first_name?.trim() || undefined,
        last_name: values.last_name?.trim() || undefined,
      },
      {
        onSuccess: ({ file_url }) => {
          writeState(magnet.slug, { downloaded: true });
          setOpen(false);
          if (!file_url) {
            toast.error("That download isn't available right now — please try again shortly.");
            return;
          }
          window.open(file_url, "_blank", "noopener,noreferrer");
          toast.success("Your download is starting.");
          reset();
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <Modal open={open} onClose={close} size="xl">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="relative flex min-h-56 flex-col justify-end overflow-hidden rounded-2xl p-6 text-white">
          <Image
            src="/home-hero.jpg"
            alt=""
            fill
            sizes="(min-width: 768px) 25vw, 90vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-deep-blue via-deep-blue/70 to-deep-blue/20" aria-hidden="true" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-wide text-glass">Free download</p>
            <h2 className="mt-2 text-xl font-bold">{magnet.title}</h2>
            {magnet.description && <p className="mt-3 text-sm text-white/70">{magnet.description}</p>}
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-gray-900">Get your free copy</h3>
          <p className="mt-1 text-sm text-gray-500">
            Enter your email and we&apos;ll send you straight to the file.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 flex flex-col gap-4">
            <Input label="Email" type="email" required error={errors.email?.message} {...register("email")} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="First name" error={errors.first_name?.message} {...register("first_name")} />
              <Input label="Last name" error={errors.last_name?.message} {...register("last_name")} />
            </div>
            <Button type="submit" loading={download.isPending}>
              Download
            </Button>
          </form>
        </div>
      </div>
    </Modal>
  );
}
