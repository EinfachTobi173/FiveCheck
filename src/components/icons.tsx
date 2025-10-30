import React from 'react';

export const SparkIcon = ({ className = 'w-6 h-6', color = '#60EFFF' }: { className?: string; color?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 2l2.5 5.5L20 10l-5.5 2.5L12 18l-2.5-5.5L4 10l5.5-2.5L12 2z" stroke={color} strokeWidth="1.5" fill="none" />
  </svg>
);

export const PlayIcon = ({ className = 'w-5 h-5', color = '#9B5CFF' }: { className?: string; color?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M8 5v14l11-7-11-7z" />
  </svg>
);

export const CheckIcon = ({ className = 'w-5 h-5', color = '#4ADE80' }: { className?: string; color?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ClockIcon = ({ className = 'w-5 h-5', color = '#FFC857' }: { className?: string; color?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
    <path d="M12 7v6l4 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const XIcon = ({ className = 'w-5 h-5', color = '#EF4444' }: { className?: string; color?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M6 6l12 12M18 6l-12 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const UsersIcon = ({ className = 'w-6 h-6', color = '#60EFFF' }: { className?: string; color?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M16 11a4 4 0 100-8 4 4 0 000 8zM8 13a4 4 0 100-8 4 4 0 000 8z" stroke={color} strokeWidth="1.5" />
    <path d="M2 22a6 6 0 1112 0M10 22a6 6 0 1112 0" stroke={color} strokeWidth="1.5" />
  </svg>
);