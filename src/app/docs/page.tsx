"use client";
import React from 'react';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';

export default function DocsPage() {
  const { t, locale, setLocale } = useI18n();
  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('docs.title')}</h1>
        <div className="flex items-center gap-2 text-sm">
          <button aria-label="English" className={`px-2 py-1 rounded ${locale === 'en' ? 'bg-white/10' : ''}`} onClick={() => setLocale('en')}>{t('lang.en')}</button>
          <button aria-label="German" className={`px-2 py-1 rounded ${locale === 'de' ? 'bg-white/10' : ''}`} onClick={() => setLocale('de')}>{t('lang.de')}</button>
          <Link href="/" className="text-sm px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition">Home</Link>
        </div>
      </header>

      <section className="glass card hover-glow p-4 mb-6">
        <p className="opacity-80 mb-3">{t('docs.intro')}</p>
        <h2 className="text-lg font-semibold mb-2">{t('docs.how.title')}</h2>
        <p className="opacity-80 mb-3">{t('docs.how.text')}</p>
        <h2 className="text-lg font-semibold mb-2">{t('docs.usage.title')}</h2>
        <p className="opacity-80 mb-3">{t('docs.usage.text')}</p>
        <h2 className="text-lg font-semibold mb-2">{t('docs.privacy.title')}</h2>
        <p className="opacity-80 mb-3">{t('docs.privacy.text')}</p>
        <h2 className="text-lg font-semibold mb-2">{t('docs.disclaimer.title')}</h2>
        <p className="text-xs opacity-70">{t('docs.disclaimer.text')}</p>
      </section>
    </main>
  );
}