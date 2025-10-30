import type { Metadata } from 'next';
import './globals.css';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { I18nProvider } from '@/lib/i18n';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-plusjakarta' });

export const metadata: Metadata = {
  title: 'FiveCheck',
  description: 'Analyse FiveM/CFX servers for possible fake players/bots.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen bg-bg text-text">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}