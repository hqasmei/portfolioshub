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
	<path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7" />
</svg>
