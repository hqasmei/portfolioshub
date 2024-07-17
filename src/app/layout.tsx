import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import '../styles/globals.css';

import { Analytics } from '@vercel/analytics/react';
import { Toaster } from 'sonner';

import { ContextProvider } from '../components/context-provider';

const inter = Inter({ subsets: ['latin'] });

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
                (function () {
                  window.counterscale = {
                    q: [["set", "siteId", "catchy-starless-parmesan"], ["trackPageview"]],
                  };
                })();
              `,
          }}
        />
        <script
          id="counterscale-script"
          src="https://counterscale.hosna-qasmei.workers.dev/tracker.js"
          defer
        />
      </head>
      <body className={inter.className}>
        <ContextProvider>
          {children}
          <Toaster richColors position="top-center" />
          <Analytics />
        </ContextProvider>
      </body>
    </html>
  );
}
