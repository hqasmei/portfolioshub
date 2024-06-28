import React from 'react';

import Banner from './_components/banner';
import { Footer } from './_components/footer';
import { Header } from './_components/header';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Banner />
      <Header />
      <main className="min-h-screen flex flex-col items-center">
        <div className="flex-1 w-full flex flex-col  items-center">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
