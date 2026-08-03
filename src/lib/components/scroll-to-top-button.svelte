<script lang="ts">
	import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';

	// Replaces the Next app's useState/useEffect scroll listener.
	let scrollY = $state(0);
	const isVisible = $derived(scrollY > 300);

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<svelte:window bind:scrollY />

{#if isVisible}
	<button
		onclick={scrollToTop}
		aria-label="Scroll to top"
		class="fixed right-4 bottom-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-foreground font-medium text-background shadow transition duration-300 ease-in-out md:right-12 md:bottom-12"
	>
		<ChevronUpIcon class="mb-0.5 stroke-[2.25px]" size={24} />
	</button>
{/if}
