"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ClockIcon, PlayIcon, CheckIcon, XIcon } from './icons';
import { useI18n } from '@/lib/i18n';

export type StepStatus = 'pending' | 'running' | 'done' | 'error';
export type ScanStep = { key: string; label: string; status: StepStatus };

function StatusIcon({ status }: { status: StepStatus }) {
  switch (status) {
    case 'pending':
      return <ClockIcon />;
    case 'running':
      return <PlayIcon />;
    case 'done':
      return <CheckIcon />;
    case 'error':
      return <XIcon />;
  }
}

export function ScanProgress({ steps }: { steps: ScanStep[] }) {
  const done = steps.filter(s => s.status === 'done').length;
  const pct = (done / steps.length) * 100;
  const { t } = useI18n();
  return (
    <div className="glass card p-3" aria-label="Scan progress" aria-live="polite">
      <div className="flex items-center justify-between mb-2 gap-2">
        {steps.map((s) => {
          const cls = s.status === 'done'
            ? 'bg-white/10'
            : s.status === 'running'
            ? 'bg-accent/30'
            : s.status === 'error'
            ? 'bg-red-500/30'
            : 'bg-white/5';
          return (
            <motion.div
              key={s.key}
              className={`flex items-center gap-2 px-2 py-1 rounded ${cls}`}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <StatusIcon status={s.status} />
              <span className="text-xs">{s.label}</span>
            </motion.div>
          );
        })}
      </div>
      <div
        className="h-2 w-full bg-white/10 rounded overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div className="h-full progress-fill" initial={{ width: 0 }} animate={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-[11px] opacity-70">{t('scan.progress.steps')} {done}/{steps.length}</div>
    </div>
  );
}