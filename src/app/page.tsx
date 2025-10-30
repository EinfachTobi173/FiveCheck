"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Gauge } from '@/components/Gauge';
import { Tooltip } from '@/components/Tooltip';
import { ScanProgress, type ScanStep } from '@/components/ScanProgress';
import { SparkIcon, UsersIcon } from '@/components/icons';
import { useI18n } from '@/lib/i18n';
import type { ScanResponse, Snapshot, Player } from '@/lib/types';
import Link from 'next/link';

// Cfx.re hosts ticket forms under en-us; use en-us for all locales to ensure reliability.
const SUPPORT_URLS: Record<'en' | 'de', string> = {
  en: 'https://support.cfx.re/hc/en-us/requests/new?ticket_form_id=13998414161564',
  de: 'https://support.cfx.re/hc/en-us/requests/new?ticket_form_id=13998414161564'
}; // [1]

function useJobId() {
  const ref = useRef<string>('');
  if (!ref.current) ref.current = `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return ref.current;
}

export default function HomePage() {
  const jobId = useJobId();
  const { t, locale, setLocale } = useI18n();
  const [query, setQuery] = useState('');
  const [data, setData] = useState<ScanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<ScanStep[]>([
    { key: 't0', label: t('scan.t0'), status: 'pending' },
    { key: 't10', label: t('scan.t10'), status: 'pending' },
    { key: 't30', label: t('scan.t30'), status: 'pending' },
  ]);
  const snapshots = data?.snapshots ?? [];

  async function callScan(stepKey?: string) {
    if (!query.trim()) return;
    setLoading(true);
    if (stepKey) {
      setSteps(prev => prev.map(s => (s.key === stepKey ? { ...s, status: 'running' } : s)));
    }
    try {
      const res = await fetch(`/api/scan?query=${encodeURIComponent(query)}&job=${jobId}`);
      const json = await res.json();
      setData(json);
      if (stepKey) {
        setSteps(prev => prev.map(s => (s.key === stepKey ? { ...s, status: 'done' } : s)));
      }
    } catch (e) {
      console.error(e);
      if (stepKey) {
        setSteps(prev => prev.map(s => (s.key === stepKey ? { ...s, status: 'error' } : s)));
      }
    } finally {
      setLoading(false);
    }
  }

  // Language attribute sync
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // Reschedule steps when starting a scan
  function startScan() {
    if (!query.trim()) return;
    // Reset steps
    setSteps([
      { key: 't0', label: t('scan.t0'), status: 'pending' },
      { key: 't10', label: t('scan.t10'), status: 'pending' },
      { key: 't30', label: t('scan.t30'), status: 'pending' },
    ]);
    // T0 immediately
    callScan('t0');
    // Schedule next steps
    const t10 = window.setTimeout(() => callScan('t10'), 10_000);
    const t30 = window.setTimeout(() => callScan('t30'), 30_000);
    return () => {
      clearTimeout(t10);
      clearTimeout(t30);
    };
  }

  const reasons = data?.reasons ?? [];

  function fmt(template: string, args?: Record<string, string | number>) {
    return template.replace(/\{(\w+)\}/g, (_, k) => String(args?.[k] ?? `{${k}}`));
  }

  function pingClass(ping: number) {
    if (ping >= 100) return 'ping-very-high';
    if (ping >= 60) return 'ping-high';
    return '';
  }

  async function copyReport() {
    // Copy report text if Daten vorhanden; Navigation übernimmt der Link
    if (!data) return;
    const lines = [
      `Server: ${data.server_name ?? data.server}`,
      `CFX Link: ${query}`,
      `Scan time (UTC): ${new Date().toISOString()}`,
      `Player count: ${data.player_count}`,
      `Estimated bots: ~${data.estimated_bots} (confidence: ${data.confidence}%)`,
      'Reasons:',
      ...reasons.map(r => `  - ${r.rule} (${(r.value * 100).toFixed(0)}%)`),
      `Snapshots: ${snapshots.length} captured`,
      'Please review for possible fake players/bots.'
    ];
    const text = lines.join('\n');
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.warn('Clipboard write failed', e);
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <SparkIcon className="w-8 h-8" />
          <h1 className="text-2xl font-bold">{t('header.title')}</h1>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button aria-label="English" className={`px-2 py-1 rounded ${locale === 'en' ? 'bg-white/10' : ''}`} onClick={() => setLocale('en')}>{t('lang.en')}</button>
          <button aria-label="German" className={`px-2 py-1 rounded ${locale === 'de' ? 'bg-white/10' : ''}`} onClick={() => setLocale('de')}>{t('lang.de')}</button>
          <Link href="/docs" className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition" aria-label={t('nav.docs')}>{t('nav.docs')}</Link>
        </div>
      </header>

      {/* Search */}
      <section className="glass card hover-glow p-4 mb-6" aria-label="Server input">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            aria-label={t('input.placeholder')}
            placeholder={t('input.placeholder')}
            className="flex-1 rounded px-3 py-2 bg-transparent border border-white/10 focus:outline-none focus:ring-2 focus:ring-glow"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={startScan} className="px-4 py-2 rounded bg-accent hover:opacity-90 transition focus-outline">{t('button.scan')}</button>
        </div>
        <div className="mt-3">
          <ScanProgress steps={steps} />
        </div>
      </section>

      {/* Dashboard */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analysis Card */}
        <div className="glass card hover-glow p-4 col-span-1">
          <h2 className="text-lg font-semibold mb-4">{t('analysis.title')}</h2>
          <div className="flex items-start gap-6">
            <Gauge value={data?.confidence ?? 0} />
            <div>
              <div className="text-sm opacity-80">{t('confidence.label')}</div>
              <div className="text-xl font-bold">{data?.confidence ?? 0}%</div>
              <div className="text-sm mt-2">{t('estimated_bots.label')}: <span className="font-semibold">{data?.estimated_bots ?? 0}</span></div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {reasons.map(r => {
              const ruleLabel = t(`rules.${r.rule}`) || r.rule.replace('_', ' ');
              const detailLabel = r.detail_key ? fmt(t(r.detail_key), r.detail_args) : (r.detail ?? '');
              return (
                <div key={r.rule} className="flex items-center justify-between text-sm">
                  <Tooltip label={detailLabel}>
                    <span className="capitalize">{ruleLabel}</span>
                  </Tooltip>
                  <span>{Math.round(r.value * 100)}%</span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs opacity-70">{t('disclaimer.text')}</p>
          <a
            href={SUPPORT_URLS[locale as 'en' | 'de']}
            onClick={() => { void copyReport(); }}
            className="inline-block mt-4 px-3 py-2 rounded bg-glow text-black font-semibold hover:opacity-90"
            rel="noopener"
          >
            {t('prepare_report')}
          </a>
        </div>

        {/* Player Table */}
        <div className="glass card hover-glow p-4 col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UsersIcon />
              <h2 className="text-lg font-semibold">{t('players.title')}</h2>
            </div>
            <div className="text-xs opacity-70 max-w-[360px] truncate">
              <Tooltip label={data?.server_name ?? data?.server ?? ''}>
                <span>{t('server.label')}: <span className="font-semibold">{data?.server_name ?? data?.server ?? '-'}</span></span>
              </Tooltip>
            </div>
          </div>
          {loading && <div className="animate-pulse text-sm opacity-70">Loading...</div>}
          <div role="table" className="text-sm zebra">
            <div className="grid grid-cols-3 gap-2 pb-2 border-b border-white/10">
              <div>{t('players.name')}</div>
              <div>{t('players.id')}</div>
              <div>{t('players.ping')}</div>
            </div>
            {(data?.snapshots?.[data.snapshots.length - 1]?.players ?? []).map((p: Player) => (
              <div key={`${p.id}-${p.name}`} className="grid grid-cols-3 gap-2 py-2 border-b border-white/5 hover:bg-white/5 transition">
                <div>{p.name}</div>
                <div>{p.id}</div>
                <div className={pingClass(p.ping)}>{p.ping}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Snapshots Slider */}
      <section className="glass card hover-glow p-4 mt-6">
        <h2 className="text-lg font-semibold mb-3">{t('snapshots.title')}</h2>
        <div className="flex gap-3 overflow-x-auto">
          {snapshots.map((s: Snapshot, idx: number) => {
            const prev = snapshots[idx - 1];
            let reorder = 0;
            if (prev) {
              const indexMap = new Map<number, number>();
              prev.players.forEach((p, i) => indexMap.set(p.id, i));
              let sum = 0, count = 0;
              s.players.forEach((p, i) => {
                const j = indexMap.get(p.id);
                if (typeof j === 'number') { sum += Math.abs(i - j); count++; }
              });
              reorder = count ? Math.min(100, Math.round((sum / (count * Math.max(1, s.players.length))) * 100)) : 0;
            }
            return (
              <motion.div key={s.ts} layout className="min-w-[240px] p-3 rounded border border-white/10">
                <div className="text-xs opacity-70">{s.ts}</div>
                <div className="text-sm flex items-center justify-between">
                  <span>Players: {s.players.length}</span>
                  <span className="text-xs opacity-70">Reorder: {reorder}%</span>
                </div>
                <div className="mt-2 h-2 w-full bg-white/10 rounded overflow-hidden">
                  <motion.div className="h-2" style={{ background: 'linear-gradient(90deg, #60EFFF, #9B5CFF)' }} initial={{ width: 0 }} animate={{ width: `${reorder}%` }} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="mt-6 text-xs opacity-70">
        <p>
          {t('disclaimer.text')}
        </p>
      </section>
    </main>
  );
}