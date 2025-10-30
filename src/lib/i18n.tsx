"use client";
import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

type Locale = 'en' | 'de';

const STRINGS: Record<Locale, Record<string, string>> = {
  en: {
    'app.title': 'FiveCheck',
    'header.title': 'FiveCheck',
    'lang.en': 'English',
    'lang.de': 'Deutsch',
    'input.placeholder': 'Server name / CFX link / IP or Server ID',
    'button.scan': 'Scan',
    'analysis.title': 'Analysis',
    'confidence.label': 'Confidence',
    'estimated_bots.label': 'Estimated bots',
    'prepare_report': 'Prepare Report',
    'server.label': 'Server',
    'players.title': 'Players',
    'players.name': 'Name',
    'players.id': 'ID',
    'players.ping': 'Ping',
    'snapshots.title': 'Snapshots',
    'snapshots.players': 'Players',
    'snapshots.reorder': 'Reorder',
    'disclaimer.text': 'Indicators, not definitive proof. Please consider context.',
    'scan.t0': 'Resolve server',
    'scan.t10': 'Capture snapshot',
    'scan.t30': 'Finalize analysis',
    'scan.status.pending': 'Pending',
    'scan.status.running': 'Scanning',
    'scan.status.done': 'Captured',
    'scan.status.error': 'Error',
    'scan.progress.steps': 'Steps',
    'nav.docs': 'Docs',
    'docs.title': 'Documentation',
    'docs.intro': 'FiveCheck analyzes FiveM/CFX servers for potential fake players/bots.',
    'docs.how.title': 'How it works',
    'docs.how.text': 'It captures snapshots and applies heuristics (Sequence Match, Ping Cluster, Name Pattern, Session Spike, Historical Fingerprint) to estimate bots and confidence.',
    'docs.usage.title': 'Usage',
    'docs.usage.text': 'Paste a server name, CFX join link, IP or Server ID, start the scan, review indicators, and prepare a report.',
    'docs.privacy.title': 'Privacy',
    'docs.privacy.text': 'No identifiers are stored; snapshots are kept temporarily in memory; endpoints are hidden.',
    'docs.disclaimer.title': 'Disclaimer',
    'docs.disclaimer.text': 'Indicators are not definitive proof; always consider context.'
    ,
    'rules.sequence_match': 'Sequence Match',
    'rules.ping_cluster': 'Ping Cluster',
    'rules.name_pattern': 'Name Pattern',
    'rules.session_spike': 'Session Spike',
    'rules.historical_fingerprint': 'Historical Fingerprint',
    'heuristics.snapshots.too_few': 'Too few snapshots',
    'heuristics.sequence_match.stable': 'Stable order over time',
    'heuristics.players.too_few': 'Too few players',
    'heuristics.ping_cluster.stats': 'Variance={std}, Mean={mean}',
    'heuristics.name_pattern.stats': 'Generic={generic}, Repeated={repeated}',
    'heuristics.session_spike.max': 'Max spike={spike}',
    'heuristics.historical_fingerprint.repeated': 'Repeated fingerprints over time'
  },
  de: {
    'app.title': 'FiveCheck',
    'header.title': 'FiveCheck',
    'lang.en': 'English',
    'lang.de': 'Deutsch',
    'input.placeholder': 'Servername / CFX Link / IP oder Server ID',
    'button.scan': 'Scan',
    'analysis.title': 'Analyse',
    'confidence.label': 'Confidence',
    'estimated_bots.label': 'Geschätzte Bots',
    'prepare_report': 'Report vorbereiten',
    'server.label': 'Server',
    'players.title': 'Spieler',
    'players.name': 'Name',
    'players.id': 'ID',
    'players.ping': 'Ping',
    'snapshots.title': 'Snapshots',
    'snapshots.players': 'Spieler',
    'snapshots.reorder': 'Reordering',
    'disclaimer.text': 'Indikatoren, keine endgültigen Beweise. Kontext berücksichtigen.',
    'scan.t0': 'Server auflösen',
    'scan.t10': 'Snapshot erfassen',
    'scan.t30': 'Analyse abschließen',
    'scan.status.pending': 'Wartet',
    'scan.status.running': 'Scan läuft',
    'scan.status.done': 'Erfasst',
    'scan.status.error': 'Fehler',
    'scan.progress.steps': 'Schritte',
    'nav.docs': 'Dokumentation',
    'docs.title': 'Dokumentation',
    'docs.intro': 'FiveCheck analysiert FiveM/CFX‑Server auf mögliche Fake‑Spieler/Bots.',
    'docs.how.title': 'Funktionsweise',
    'docs.how.text': 'Es erfasst Snapshots der Spielerliste und wendet Heuristiken an (Sequence Match, Ping Cluster, Name Pattern, Session Spike, Historical Fingerprint), daraus werden Bots‑Schätzung und Confidence berechnet.',
    'docs.usage.title': 'Nutzung',
    'docs.usage.text': 'Servername, CFX‑Join‑Link, IP oder Server‑ID einfügen, Scan starten, Indikatoren prüfen und Report vorbereiten.',
    'docs.privacy.title': 'Datenschutz',
    'docs.privacy.text': 'Keine Identifikatoren gespeichert; Snapshots nur kurz im Speicher; Endpoints werden ausgeblendet.',
    'docs.disclaimer.title': 'Hinweis',
    'docs.disclaimer.text': 'Indikatoren sind keine endgültigen Beweise; Kontext berücksichtigen.'
    ,
    'rules.sequence_match': 'Reihenfolge-Match',
    'rules.ping_cluster': 'Ping-Cluster',
    'rules.name_pattern': 'Namensmuster',
    'rules.session_spike': 'Session-Spike',
    'rules.historical_fingerprint': 'Historischer Fingerprint',
    'heuristics.snapshots.too_few': 'Zu wenig Snapshots',
    'heuristics.sequence_match.stable': 'Stabile Reihenfolge über Zeit',
    'heuristics.players.too_few': 'Zu wenig Spieler',
    'heuristics.ping_cluster.stats': 'Varianz={std}, Mittel={mean}',
    'heuristics.name_pattern.stats': 'Generisch={generic}, Wiederholt={repeated}',
    'heuristics.session_spike.max': 'Max Spike={spike}',
    'heuristics.historical_fingerprint.repeated': 'Wiederholte Fingerprints über Zeit'
  }
};

type Ctx = { locale: Locale; setLocale: (l: Locale) => void; t: (key: string) => string };
const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Initialize with a deterministic value so SSR and client match
  const [locale, setLocale] = useState<Locale>('en');
  // After mount, hydrate from localStorage (avoids SSR/client mismatch)
  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? window.localStorage.getItem('locale') : null;
      if (saved === 'en' || saved === 'de') setLocale(saved as Locale);
    } catch {}
  }, []);
  const t = useMemo(() => {
    return (key: string) => STRINGS[locale][key] ?? key;
  }, [locale]);
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('locale', locale);
      }
    } catch {}
  }, [locale]);
  return <I18nCtx.Provider value={{ locale, setLocale, t }}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error('I18nProvider missing');
  return ctx;
}