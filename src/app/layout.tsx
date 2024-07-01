import type { Metadata } from 'next';

import '../styles/globals.css';

import { GeistSans } from 'geist/font/sans';
import { Toaster } from 'sonner';

import { ContextProvider } from '../components/context-provider';

export const metadata: Metadata = {
  metadataBase: new URL('https://portfolioshub.com/'),
  title: {
    default: 'PortfoliosHub | Find the best portfolios and showcase your work',
    template: '%s | PortfoliosHub',
  },
  description: 'Find the best portfolios and showcase your work.',
  openGraph: {
    title: 'PortfoliosHub',
    description: 'Find the best portfolios and showcase your work..',
    url: 'https://portfolioshub.com/',
    siteName: 'PortfoliosHub',
    locale: 'en_US',
    type: 'website',
    images: '/opengraph-image.png',
  },
  robots: {
    index: true,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PortfoliosHub',
    description: 'Find the best portfolios and showcase your work.', 
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <meta name="viewport" content="width=device-width, user-scalable=no" />
        <link
          rel="icon"
          href="/icon?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        />
        <link
          rel="apple-touch-icon"
          href="/apple-icon?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        />
      </head>
      <body className={GeistSans.className}>
        <ContextProvider>
          {children}
          <Toaster richColors position="top-center" />
        </ContextProvider>
      </body>
    </html>
  );
}
