"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSubscribeNewsletter } from "@/hooks/mutations/blog";
import { TurnstileWidget } from "@/components/ui/turnstile-widget";

// Reused wherever a newsletter signup makes sense (blog landing hero, site footer, bottom of a
// blog post) — one component so the copy/behavior stays consistent and Turnstile only needs
// wiring once. `theme` swaps text/border colors for a dark (blue gradient, footer) vs light
// (white card) background.
export function NewsletterForm({
  theme = "dark",
  className = "",
}: {
  theme?: "dark" | "light";
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const subscribe = useSubscribeNewsletter();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (!captchaToken) {
      toast.error("Please complete the verification check.");
      return;
    }
    subscribe.mutate(
      { email: email.trim(), cfTurnstileResponse: captchaToken },
      {
        onSuccess: () => {
          toast.success("Check your inbox to confirm your subscription.");
          setEmail("");
          setCaptchaToken(null);
        },
        onError: (err) => {
          toast.error(err.message);
          setCaptchaToken(null);
        },
      },
    );
  };

  const dark = theme === "dark";

  return (
    <form onSubmit={onSubmit} className={className}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className={
            dark
              ? "w-full rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-white/40"
              : "w-full rounded-full border border-gray-200 bg-white px-5 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
          }
        />
        <button
          type="submit"
          disabled={subscribe.isPending}
          className="shrink-0 rounded-full bg-glass px-6 py-3 text-sm font-medium text-deep-blue hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {subscribe.isPending ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      <TurnstileWidget onVerify={setCaptchaToken} onExpire={() => setCaptchaToken(null)} className="mt-3" />
      <p className={`mt-2 text-xs ${dark ? "text-white/40" : "text-gray-400"}`}>
        No spam — unsubscribe anytime.
      </p>
    </form>
  );
}
