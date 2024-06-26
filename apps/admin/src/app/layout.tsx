import type { Metadata } from 'next';

import '../styles/globals.css';

import { GeistSans } from 'geist/font/sans';
import { Toaster } from 'sonner';

import { ContextProvider } from '../components/context-provider';
import { Footer } from './footer';
import { Header } from './header';

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
          <Header />
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col  items-center">
              {children}
            </div>
          </main>
          <Toaster richColors position="top-center" />
          <Footer />
        </ContextProvider>
      </body>
    </html>
  );
}
