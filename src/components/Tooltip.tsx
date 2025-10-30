import React from 'react';

export function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="relative inline-flex items-center group overflow-visible">
      {children}
      <span
        className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 text-xs glass px-2 py-1 rounded shadow-card max-w-[220px] sm:max-w-[280px] whitespace-normal break-words leading-tight opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        role="tooltip"
      >
        {label}
      </span>
    </span>
  );
}