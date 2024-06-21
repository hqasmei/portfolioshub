import type { Metadata } from 'next';

import '../styles/globals.css';

import { GeistSans } from 'geist/font/sans';

import { ContextProvider } from '../components/context-provider';
import { Footer } from './footer';
import { Header } from './header';

export const metadata: Metadata = {
  title: 'PortfoliosHub',
  description: 'Your one place for everything portfolio related',
  twitter: {
    card: 'summary_large_image',
  },
  openGraph: {
    images: '/opengraph-image.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
          <Header />
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col gap-12 items-center">
              {children}
            </div>
          </main>
          <Footer />
        </ContextProvider>
      </body>
    </html>
  );
}
