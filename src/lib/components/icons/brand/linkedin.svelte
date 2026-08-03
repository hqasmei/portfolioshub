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
	<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
	<rect width="4" height="12" x="2" y="9" />
	<circle cx="4" cy="4" r="2" />
</svg>
