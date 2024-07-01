'use client';

import { useSession as useClerkSession } from '@clerk/nextjs';

export function useSession() {
  const session = useClerkSession();

  return {
    isLoggedIn: session.isSignedIn,
    isLoaded: session.isLoaded,
    session: session.session,
  };
}
