import React from "react";

export function IconBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-main text-lg font-bold text-white">
        {children}
      </div>
    </div>
  );
}
