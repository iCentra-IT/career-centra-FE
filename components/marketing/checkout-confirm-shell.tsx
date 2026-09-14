import Image from "next/image";

export function ConfirmLogo() {
  return (
    <div className="flex items-center justify-center">
      <Image src="/CareerCentra-full-logo.svg" alt="CareerCentra" width={104} height={44} priority />
    </div>
  );
}

export function ConfirmShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-50 px-6 py-16"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(12,35,108,0.08) 1.5px, transparent 0)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="relative flex w-full max-w-md flex-col items-center rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <ConfirmLogo />
        {children}
      </div>
    </div>
  );
}

export function ConfirmSpinner() {
  return (
    <span
      className="mt-8 h-8 w-8 animate-spin rounded-full border-2 border-main/20 border-t-main"
      aria-hidden="true"
    />
  );
}
