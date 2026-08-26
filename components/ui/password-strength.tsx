const STRENGTH_COLORS = ["bg-red-400", "bg-orange-400", "bg-purple-400", "bg-green-400"];

const RULES = [
  { label: "At least one upper case", test: (pw: string) => /[A-Z]/.test(pw) },
  { label: "At least one lower case", test: (pw: string) => /[a-z]/.test(pw) },
  { label: "At least one special character", test: (pw: string) => /[^A-Za-z0-9]/.test(pw) },
  { label: "At least one number", test: (pw: string) => /[0-9]/.test(pw) },
];

export function PasswordStrength({ password }: { password: string }) {
  const checks = RULES.map((rule) => ({ label: rule.label, passed: rule.test(password) }));
  const score = checks.filter((c) => c.passed).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1.5">
        {STRENGTH_COLORS.map((color, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < score ? color : "bg-gray-200"}`}
          />
        ))}
      </div>
      <ul className="flex flex-col gap-2">
        {checks.map((check) => (
          <li key={check.label} className="flex items-center gap-2 text-sm text-gray-500">
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] text-white ${
                check.passed ? "bg-main" : "bg-gray-300"
              }`}
              aria-hidden="true"
            >
              ✓
            </span>
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
