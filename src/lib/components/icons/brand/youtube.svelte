<script lang="ts">
	// Brand icons were removed from lucide in v1. These paths are copied verbatim
	// from lucide-react@0.396.0 — the version the Next app renders — so the icons
	// stay pixel-identical across the port.
	let {
		size = 24,
		strokeWidth = 2,
		class: className
	}: { size?: number | string; strokeWidth?: number | string; class?: string } = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width={strokeWidth}
	stroke-linecap="round"
	stroke-linejoin="round"
	class={className}
>
	<path
		d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"
	/>
	<path d="m10 15 5-3-5-3z" />
</svg>
