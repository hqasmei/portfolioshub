<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import type { Snippet } from 'svelte';

	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';

	let {
		open = $bindable(false),
		header,
		description,
		children
	}: {
		open?: boolean;
		header: string;
		description?: string;
		children: Snippet;
	} = $props();

	// Svelte 5's MediaQuery is SSR-safe and matches the Next app's
	// use-media-query hook, which reported `null` until after mount.
	const isMobile = new MediaQuery('(max-width: 768px)');
</script>

{#if isMobile.current}
	<Drawer.Root bind:open>
		<Drawer.Content>
			<Drawer.Header class="text-left">
				<Drawer.Title>{header}</Drawer.Title>
				{#if description}
					<Drawer.Description>{description}</Drawer.Description>
				{/if}
			</Drawer.Header>
			{@render children()}
		</Drawer.Content>
	</Drawer.Root>
{:else}
	<Dialog.Root bind:open>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>{header}</Dialog.Title>
				{#if description}
					<Dialog.Description>{description}</Dialog.Description>
				{/if}
			</Dialog.Header>
			{@render children()}
		</Dialog.Content>
	</Dialog.Root>
{/if}
