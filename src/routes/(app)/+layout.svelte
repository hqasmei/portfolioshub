<script lang="ts">
	import { page } from '$app/state';

	import Footer from '$lib/components/layout/footer.svelte';
	import Header from '$lib/components/layout/header.svelte';
	import ScrollToTopButton from '$lib/components/scroll-to-top-button.svelte';

	let { children } = $props();

	// The Next app had two byte-identical shells — (unauthenticated)/layout.tsx
	// and (authenticated)/(main)/layout.tsx — so they are unified here.
	// Its Footer component self-gated on `pathname === '/'`; that check is
	// hoisted to the call site.
	const isHome = $derived(page.url.pathname === '/');
</script>

<Header />
<main class="flex min-h-screen flex-col items-center">
	<div class="flex w-full flex-1 flex-col items-center">
		{@render children()}
	</div>
</main>
<ScrollToTopButton />
{#if isHome}
	<Footer />
{/if}
