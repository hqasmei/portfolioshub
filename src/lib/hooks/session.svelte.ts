import { useAuth } from 'convex-svelte';
import { useClerkContext } from 'svelte-clerk/client';

/**
 * Replaces the Next app's src/lib/client-auth.ts.
 *
 * `isConvexAuthed` has no counterpart there and is the important addition: it
 * is true only once Convex actually holds a token, which is what auth-dependent
 * queries gate on. Without it those queries fire during the token handshake,
 * come back as if signed out, and the UI flashes (empty hearts, missing /admin
 * link) before correcting itself.
 */
export function useSession() {
	const ctx = useClerkContext();
	const convexAuth = useAuth();

	return {
		get isLoaded() {
			return ctx.isLoaded;
		},
		get isLoggedIn() {
			return !!ctx.session;
		},
		get session() {
			return ctx.session;
		},
		get clerk() {
			return ctx.clerk;
		},
		get isConvexAuthed() {
			return convexAuth.isAuthenticated;
		}
	};
}
