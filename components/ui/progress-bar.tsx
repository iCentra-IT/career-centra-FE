export function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div className="h-full rounded-full bg-main" style={{ width: `${clamped}%` }} />
    </div>
  );
}
