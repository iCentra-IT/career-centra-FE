"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import { Button } from "@/components/ui/button";

function Logo() {
  return (
    <div className="flex items-center justify-center gap-2">
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="14" cy="14" r="12" stroke="#0c236c" strokeWidth="3" />
        <circle cx="14" cy="10" r="2.5" fill="#1875f0" />
        <path
          d="M8 20c1.5-3 4-4.5 6-4.5s4.5 1.5 6 4.5"
          stroke="#0c236c"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span className="text-xl font-semibold text-main">iCentra</span>
    </div>
  );
}

const NotFoundPage = () => {
  const user = useAuthStore((s) => s.user);
  const homeHref = user ? (user.role === "admin" ? "/admin" : "/students") : "/login";
  const homeLabel = user ? "Back to Dashboard" : "Back to Login";

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-50 px-6 py-16"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(12,35,108,0.08) 1.5px, transparent 0)",
        backgroundSize: "28px 28px",
      }}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(24,117,240,0.25), rgba(0,175,235,0.15) 45%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative flex w-full max-w-lg flex-col items-center text-center">
        <Logo />

        <p
          className="mt-10 bg-clip-text text-8xl font-bold leading-none text-transparent sm:text-9xl"
          style={{
            backgroundImage: "linear-gradient(135deg, #0c236c, #1875f0 55%, #00afeb)",
          }}
        >
          404
        </p>

        <h1 className="mt-6 text-2xl font-semibold text-gray-900">Page not found</h1>
        <p className="mt-2 text-sm text-gray-500">
          The page you&apos;re looking for doesn&apos;t exist, was moved, or the link is broken.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link href={homeHref} className="sm:w-auto">
            <Button className="w-full px-8 sm:w-auto">{homeLabel}</Button>
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center rounded-md border border-gray-200 bg-white px-8 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
