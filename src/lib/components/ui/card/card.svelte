<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<!-- Ported verbatim from the Next app's src/components/ui/card.tsx. -->
<div
	bind:this={ref}
	data-slot="card"
	class={cn('rounded-lg border bg-card text-card-foreground shadow-xs', className)}
	{...restProps}
>
	{@render children?.()}
</div>
