<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import XIcon from '@lucide/svelte/icons/x';
	import { cn, type WithoutChildrenOrChild } from '$lib/utils.js';
	import DialogPortal from './dialog-portal.svelte';
	import DialogOverlay from './dialog-overlay.svelte';
	import type { ComponentProps, Snippet } from 'svelte';

	let {
		ref = $bindable(null),
		class: className,
		portalProps,
		children,
		...restProps
	}: WithoutChildrenOrChild<DialogPrimitive.ContentProps> & {
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof DialogPortal>>;
		children: Snippet;
	} = $props();
</script>

<!--
	The Next app added a `DialogNavMenuContent` variant to shadcn's dialog for the
	mobile nav sheet (src/components/ui/dialog.tsx). Ported here verbatim, including
	its lighter overlay.
-->
<DialogPortal {...portalProps}>
	<DialogOverlay class="fixed inset-0 bg-black/30" />
	<DialogPrimitive.Content
		bind:ref
		data-slot="dialog-nav-menu-content"
		class={cn(
			'fixed top-3 right-3 z-50 w-full max-w-[300px] rounded-lg border bg-background p-6 shadow-lg duration-200',
			'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
			className
		)}
		{...restProps}
	>
		{@render children?.()}
		<DialogPrimitive.Close
			class="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-open:bg-accent data-open:text-muted-foreground"
		>
			<XIcon class="h-4 w-4" tabindex={0} />
			<span class="sr-only">Close</span>
		</DialogPrimitive.Close>
	</DialogPrimitive.Content>
</DialogPortal>
