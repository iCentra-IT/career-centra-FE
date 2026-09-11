export function ConfirmLogo() {
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
