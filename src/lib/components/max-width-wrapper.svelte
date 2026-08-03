<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';

	let { class: className, children }: { class?: string; children: Snippet } = $props();
</script>

<div class={cn('mx-auto flex w-full flex-col px-4 pt-4 pb-8 sm:px-8 lg:px-24', className)}>
	{@render children()}
</div>
