<script lang="ts">
	import SearchIcon from '@lucide/svelte/icons/search';
	import XIcon from '@lucide/svelte/icons/x';

	let { searchValue = $bindable('') }: { searchValue?: string } = $props();

	let active = $state(false);
</script>

<div class="grid place-items-center">
	<div
		class="relative {active
			? 'w-56'
			: 'w-9'} h-9 rounded-full border shadow transition-all duration-500"
	>
		<!-- svelte-ignore a11y_autofocus -->
		<input
			type="text"
			autofocus
			bind:value={searchValue}
			placeholder="Search"
			class="absolute inset-0 h-full w-full rounded-full px-9 outline-none {active
				? 'opacity-100'
				: 'opacity-0'} transition-opacity duration-500"
		/>
		<div
			class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-all duration-500 {active
				? 'translate-x-0 transform'
				: 'absolute top-0 right-0 bottom-0'}"
			role="button"
			tabindex="0"
			onclick={() => (active = !active)}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') active = !active;
			}}
		>
			<SearchIcon size={18} class="mb-0.5 ml-0.5" />
		</div>
		{#if active && searchValue !== ''}
			<div
				class="absolute top-0 right-2 bottom-0 flex cursor-pointer items-center transition-all duration-500"
				role="button"
				tabindex="0"
				onclick={() => (searchValue = '')}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') searchValue = '';
				}}
			>
				<XIcon size={22} class="stroke-muted-foreground" />
			</div>
		{/if}
	</div>
</div>
