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
	<rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
	<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
	<line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
</svg>
