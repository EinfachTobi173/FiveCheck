import React from 'react';

export function Gauge({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const angle = (clamped / 100) * 360;
  const color = clamped < 40 ? '#60EFFF' : clamped < 70 ? '#FFC857' : '#E63946';
  return (
    <div aria-label={`Confidence ${clamped}%`} className="w-44 h-44 rounded-full relative" role="img">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(${color} ${angle}deg, rgba(255,255,255,0.08) 0deg)`
        }}
      />
      <div className="absolute inset-3 rounded-full bg-[rgba(12,18,36,0.7)] border border-white/10" />
      <div className="absolute inset-6 rounded-full glass flex items-center justify-center shadow-glow">
        <span className="text-2xl font-extrabold drop-shadow">{clamped}%</span>
      </div>
    </div>
  );
}