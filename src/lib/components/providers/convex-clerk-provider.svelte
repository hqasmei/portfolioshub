<script lang="ts">
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { setupAuth, setupConvex } from 'convex-svelte';
	import { useClerkContext } from 'svelte-clerk/client';
	import { untrack, type Snippet } from 'svelte';

	let { initialUserId = null, children }: { initialUserId?: string | null; children: Snippet } =
		$props();

	// Must run before setupAuth, which reads the client back out of context.
	setupConvex(PUBLIC_CONVEX_URL);

	// Available because this component renders *inside* <ClerkProvider>. That is
	// why the Convex wiring lives here rather than in the root layout.
	const clerk = useClerkContext();

	// Resolves once Clerk JS has finished loading and populated `clerk.session`.
	//
	// Needed because the `initialState` seed below makes setupAuth call
	// client.setAuth() *synchronously during init* — roughly 300ms before Clerk
	// loads. Without this wait, fetchAccessToken would find `clerk.session`
	// undefined, return null, and Convex would record the client as
	// unauthenticated. setupAuth's hydration guard then hands over to its
	// $effect without re-calling setAuth, so the token is never fetched again
	// and every auth-gated query stays skipped for the whole session.
	let markClerkReady: () => void;
	const clerkReady = new Promise<void>((resolve) => (markClerkReady = resolve));
	$effect(() => {
		// `session` is derived from Clerk's resource listener, so wait for it
		// rather than for isLoaded alone. A signed-out user never gets a session;
		// that case is handled by the isLoaded check in fetchAccessToken.
		if (clerk.session || clerk.isLoaded) markClerkReady();
	});

	// Hoisted so its identity stays stable. The getter below re-runs whenever
	// isLoaded/isSignedIn change; an inline arrow would look like a new auth
	// provider each time and churn client.setAuth().
	async function fetchAccessToken({ forceRefreshToken }: { forceRefreshToken: boolean }) {
		try {
			if (!clerk.session && !clerk.isLoaded) {
				// Bounded so a Clerk script that never loads falls back to the old
				// behaviour (return null) instead of hanging the token fetch.
				await Promise.race([clerkReady, new Promise((resolve) => setTimeout(resolve, 10_000))]);
			}
			return (
				(await clerk.session?.getToken({
					template: 'convex',
					// Convex passes forceRefreshToken:true after the backend rejects an
					// expired JWT. Without skipCache, Clerk hands back the same expired
					// token and queries quietly stop updating after ~an hour.
					skipCache: forceRefreshToken
				})) ?? null
			);
		} catch {
			return null;
		}
	}

	const isLoaded = $derived(clerk.isLoaded);
	const isSignedIn = $derived(!!clerk.session);

	setupAuth(
		() => ({
			isLoading: !isLoaded,
			isAuthenticated: isSignedIn,
			fetchAccessToken
		}),
		{
			// Seeded from the server so the first client render already knows a
			// token is coming, instead of flashing signed-out content. This is a
			// one-time seed by design — `clerk.session` drives it from then on.
			initialState: { isAuthenticated: untrack(() => !!initialUserId) }
		}
	);
</script>

{@render children()}
