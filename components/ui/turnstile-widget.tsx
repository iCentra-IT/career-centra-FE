"use client";

import { Turnstile } from "@marsidev/react-turnstile";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// Callers that gate submission on having a token (`if (!captchaToken) { ... }`) should skip that
// gate entirely when this is false — e.g. local dev with no site key configured, where the widget
// below renders nothing and a token can never arrive. Keeps "disable Turnstile locally" to just
// not setting NEXT_PUBLIC_TURNSTILE_SITE_KEY, no other config needed.
export const TURNSTILE_ENABLED = !!SITE_KEY;

// The field name the token is sent to the backend under, on every form that uses this widget —
// UNCONFIRMED (the backend team hasn't said what key it expects yet), currently
// "cf_turnstile_response" to match Cloudflare's own widget convention. Change it here once
// confirmed rather than hunting down every call site.
export const TURNSTILE_FIELD_NAME = "cf_turnstile_response";

// Cloudflare Turnstile — renders nothing if NEXT_PUBLIC_TURNSTILE_SITE_KEY isn't set (e.g. a
// preview deploy without the env var), so a form using this still works, just without the check.
//
// No ref/manual .reset() here on purpose: a caller that reached into a widget ref from inside a
// react-hook-form handleSubmit(...) callback (even nested inside a mutation's onError) tripped
// React Compiler's "ref accessed during render" check, since handleSubmit(fn) is invoked inline
// in JSX. Clearing the token via onVerify/onExpire and the parent's own state is enough —
// Turnstile's own default refreshExpired="auto" already re-issues the widget when a token expires.
export function TurnstileWidget({
  onVerify,
  onExpire,
  className,
}: {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  className?: string;
}) {
  if (!SITE_KEY) return null;

  return (
    <Turnstile
      siteKey={SITE_KEY}
      onSuccess={onVerify}
      onExpire={onExpire}
      className={className}
      options={{ size: "flexible" }}
    />
  );
}
