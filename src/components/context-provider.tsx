'use client';

import { ReactNode } from 'react';

import { ConvexProvider, ConvexReactClient } from 'convex/react';

import { ThemeProvider } from './theme-provider';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ContextProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </ConvexProvider>
  );
}
