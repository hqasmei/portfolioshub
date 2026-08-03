<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import type { Snippet } from 'svelte';

	import * as Dialog from '$lib/components/ui/dialog/index.js';

	let { open = $bindable(false), children }: { open?: boolean; children: Snippet } = $props();

	const isMobile = new MediaQuery('(max-width: 768px)');

	// The Next app did this inside a useMemo, which is a side effect in a
	// memo hook; $effect is the honest expression of the same intent.
	$effect(() => {
		if (!isMobile.current) open = false;
	});
</script>

<Dialog.Root bind:open>
	<Dialog.NavMenuContent>
		{@render children()}
	</Dialog.NavMenuContent>
</Dialog.Root>
