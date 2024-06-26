import type { Metadata } from 'next';

import '../styles/globals.css';

import { GeistSans } from 'geist/font/sans';

export const metadata: Metadata = {
  title: 'Admin | PortfoliosHub',
  description: 'Your one place for everything portfolio related',
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={GeistSans.className}>{children}</body>
    </html>
  );
}
