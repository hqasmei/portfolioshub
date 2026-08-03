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

	// Hoisted so its identity stays stable. The getter below re-runs whenever
	// isLoaded/isSignedIn change; an inline arrow would look like a new auth
	// provider each time and churn client.setAuth().
	async function fetchAccessToken({ forceRefreshToken }: { forceRefreshToken: boolean }) {
		try {
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
