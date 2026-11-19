import type { Metadata, Viewport } from 'next';
import './globals.css';
import PublicChrome from '@/components/PublicChrome';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'Elisha Adera | Super Delegate Candidate 2026/2027 | Technical University of Mombasa',
  description: 'Official Campaign Portal for Elisha Adera, Super Delegate Candidate for the Department of Management Science at the Technical University of Mombasa (TUM). CPA: For Comrades by Comrades.',
  keywords: [
    'Elisha Adera',
    'Super Delegate',
    'Technical University of Mombasa',
    'TUM',
    'Department of Management Science',
    'Comrades Project Alliance',
    'CPA',
    'Competent Leader'
  ],
  icons: {
    icon: [
      { url: '/images/cpa-logo.png' },
      { url: '/favicon.ico' }
    ],
    shortcut: '/images/cpa-logo.png',
    apple: '/images/cpa-logo.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-campaign-lightBg text-campaign-darkText antialiased">
        <PublicChrome>
          {children}
        </PublicChrome>
      </body>
    </html>
  );
}
