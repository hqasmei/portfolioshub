<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';

	// Ported verbatim from the Next app's src/components/ui/badge.tsx.
	export const badgeVariants = tv({
		base: 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
		variants: {
			variant: {
				default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
				secondary:
					'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
				destructive:
					'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
				outline: 'text-foreground',
				// Status tints: soft surface, readable text, matching hairline.
				success: 'border-success-border bg-success text-success-foreground',
				warning: 'border-warning-border bg-warning text-warning-foreground',
				danger: 'border-danger-border bg-danger text-danger-foreground',
				info: 'border-info-border bg-info text-info-foreground',
				neutral: 'border-border bg-muted text-muted-foreground'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	});

	export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];
</script>

<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		href,
		class: className,
		variant = 'default',
		children,
		...restProps
	}: WithElementRef<HTMLAnchorAttributes> & {
		variant?: BadgeVariant;
	} = $props();
</script>

<svelte:element
	this={href ? 'a' : 'span'}
	bind:this={ref}
	data-slot="badge"
	{href}
	class={cn(badgeVariants({ variant }), className)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
