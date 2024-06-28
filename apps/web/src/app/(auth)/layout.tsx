import React from 'react';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="min-h-screen flex flex-col items-center justify-center">
        <div className="flex-1 w-full flex flex-col items-center justify-center">
          {children}
        </div>
      </main>
    </>
  );
}
