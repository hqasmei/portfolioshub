<script lang="ts">
	import { receiveTab, sendTab } from '$lib/tab-crossfade.js';

	let { label, isSelected, onclick }: { label: string; isSelected: boolean; onclick: () => void } =
		$props();
</script>

<button
	{onclick}
	class="{isSelected
		? 'text-foreground'
		: 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'} relative rounded-md px-2 py-1 text-sm font-medium transition-colors"
>
	<span class="relative z-10">{label}</span>
	{#if isSelected}
		<span
			in:receiveTab={{ key: 'tab' }}
			out:sendTab={{ key: 'tab' }}
			class="absolute inset-0 z-0 rounded-md bg-muted"
		></span>
	{/if}
</button>
