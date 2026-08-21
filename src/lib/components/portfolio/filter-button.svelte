<script lang="ts">
	import { receiveTab, sendTab } from '$lib/tab-crossfade.js';

	let { label, isSelected, onclick }: { label: string; isSelected: boolean; onclick: () => void } =
		$props();
</script>

<button
	{onclick}
	class="{isSelected
		? 'text-foreground'
		: 'text-muted-foreground hover:text-foreground'} relative rounded-full px-3 py-1 text-sm font-medium transition-colors"
>
	<span class="relative z-10">{label}</span>
	{#if isSelected}
		<span
			in:receiveTab={{ key: 'tab' }}
			out:sendTab={{ key: 'tab' }}
			class="absolute inset-0 z-0 rounded-full bg-muted"
		></span>
	{/if}
</button>
