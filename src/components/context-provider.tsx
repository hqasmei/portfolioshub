'use client';

import { ClerkProvider, useAuth } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ThemeProvider, useTheme } from 'next-themes';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ContextProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  return (
    <ClerkProvider
      appearance={{
        baseTheme: resolvedTheme === 'dark' ? dark : undefined,
        signIn: { baseTheme: resolvedTheme === 'dark' ? dark : undefined },
        elements: {
          formFieldInput: 'bg-transparent',
        },
        variables: {
          colorPrimary: 'hsl(221, 83%, 53%)', // change this value (you can get it from you're css variables, make sure to include 'hsl' and commas)
        },
      }}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
