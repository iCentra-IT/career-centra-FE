import Image from "next/image";
import React from "react";

function Logo() {
  return (
    <div className="flex items-center justify-center">
      <Image src="/CareerCentra-full-logo.png" alt="CareerCentra" width={104} height={44} priority />
    </div>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50 px-4 py-16"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(12,35,108,0.08) 1.5px, transparent 0)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <Logo />
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
