<script lang="ts">
	import { api } from '$convex/_generated/api';
	import ArrowDownAZIcon from '@lucide/svelte/icons/arrow-down-a-z';
	import HeartIcon from '@lucide/svelte/icons/heart';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import { useQuery } from 'convex-svelte';

	import * as Select from '$lib/components/ui/select/index.js';
	import FilterButton from './filter-button.svelte';
	import SearchBox from './search-box.svelte';

	let {
		searchValue = $bindable(''),
		selectedSort = $bindable('recentlyAdded'),
		selectedFilter = $bindable('All')
	}: {
		searchValue?: string;
		selectedSort?: string;
		selectedFilter?: string;
	} = $props();

	const getUniqueTitles = useQuery(api.portfolios.getUniqueTitles, {});

	const uniqueTags = $derived(['All', ...(getUniqueTitles.data ?? [])]);

	const sortLabels: Record<string, string> = {
		recentlyAdded: 'Recently Added',
		mostPopular: 'Most Popular',
		alphabetical: 'Alphabetical'
	};
</script>

{#if getUniqueTitles.data && getUniqueTitles.data.length > 0}
	<div class="flex flex-col items-start gap-4 pb-4 md:flex-row md:items-center md:justify-between">
		<!-- Filter -->
		<div
			class="relative flex w-full justify-start overflow-x-auto pr-8"
			style="mask-image: linear-gradient(to left, transparent 0%, black 20%);"
		>
			{#each uniqueTags as tag (tag)}
				<FilterButton
					label={tag}
					isSelected={selectedFilter === tag}
					onclick={() => (selectedFilter = tag)}
				/>
			{/each}
		</div>
		<!-- Select -->
		<div class="flex w-full items-center justify-end gap-2 md:w-fit">
			<SearchBox bind:searchValue />
			<Select.Root type="single" bind:value={selectedSort}>
				<Select.Trigger class="md:w-[190px]">
					{sortLabels[selectedSort] ?? ''}
				</Select.Trigger>
				<Select.Content class="text-xs">
					<Select.Group>
						<Select.GroupHeading>Sort by</Select.GroupHeading>
						<Select.Item value="recentlyAdded">
							<div class="flex items-center gap-2">
								<SparklesIcon size={16} />
								<span>Recently Added</span>
							</div>
						</Select.Item>
						<Select.Item value="mostPopular">
							<div class="flex items-center gap-2">
								<HeartIcon size={16} />
								<span>Most Popular</span>
							</div>
						</Select.Item>
						<Select.Item value="alphabetical">
							<div class="flex items-center gap-2">
								<ArrowDownAZIcon size={16} />
								<span>Alphabetical</span>
							</div>
						</Select.Item>
					</Select.Group>
				</Select.Content>
			</Select.Root>
		</div>
	</div>
{/if}
