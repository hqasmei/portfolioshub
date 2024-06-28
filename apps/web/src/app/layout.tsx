import type { Metadata } from 'next';

import '../styles/globals.css';

import { GeistSans } from 'geist/font/sans';
import { Toaster } from 'sonner';

import { ContextProvider } from '../components/context-provider';

export const metadata: Metadata = {
  title: {
    default: 'PortfoliosHub | Find the best portfolios and showcase your work',
    template: '%s | PortfoliosHub',
  },
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
          defer
          data-domain="sadhearts.club"
          src="https://plausible.io/js/script.js"
        ></script>
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
