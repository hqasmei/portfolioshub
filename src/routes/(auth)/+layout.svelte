<script lang="ts">
	let { children } = $props();
</script>

<!-- Ported from the Next app's src/app/(auth)/layout.tsx. -->
<div class="flex min-h-screen flex-col items-center justify-center">
	{@render children()}
</div>
