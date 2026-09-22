import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';

export const metadata: Metadata = {
  title: 'Imprint — Personal AI Computational Resource Ledger',
  description:
    'A personal computational resource ledger translating AI interactions into transparent, science-grounded estimates of energy, water, and carbon.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] antialiased transition-colors duration-200 selection:bg-[#284D39] selection:text-[#A8D5BA]">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
