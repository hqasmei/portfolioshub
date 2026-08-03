<script lang="ts">
	import { api } from '$convex/_generated/api';
	import { useQuery } from 'convex-svelte';

	import { inView } from '$lib/actions/in-view.js';
	import MainContentSkeleton from './main-content-skeleton.svelte';
	import PortfolioCard from './portfolio-card.svelte';

	let {
		selectedSort,
		selectedFilter,
		searchValue
	}: {
		selectedSort: string;
		selectedFilter: string | null;
		searchValue: string;
	} = $props();

	let visibleCount = $state(6);

	const portfolios = useQuery(api.portfolios.getPortfolios, () => ({
		sortType: selectedSort || 'recentlyAdded'
	}));

	// Kept verbatim from the Next app, including the quirk that an empty result
	// set keeps the skeleton on screen rather than showing an empty state.
	const isLoading = $derived(portfolios.isLoading || (portfolios.data?.length ?? 0) === 0);

	const filteredData = $derived.by(() => {
		const data = portfolios.data;
		const search = searchValue.toLowerCase();

		if (selectedFilter === 'All' || selectedFilter === null || !data) {
			return data?.filter((portfolio) => portfolio.name.toLowerCase().includes(search));
		}

		return data
			.filter((portfolio) => portfolio.titles?.map((title) => `${title}s`).includes(selectedFilter))
			.filter((portfolio) => portfolio.name.toLowerCase().includes(search));
	});

	const hasMoreData = $derived(visibleCount < (filteredData?.length ?? 0));
</script>

{#if isLoading}
	<MainContentSkeleton />
{:else if filteredData?.length === 0}
	<div class="flex h-64 items-center justify-center">
		<p class="text-gray-500">No search results found.</p>
	</div>
{:else}
	<div class="flex flex-col gap-2 pb-4 md:pb-4">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
			{#each filteredData?.slice(0, visibleCount) ?? [] as item (item._id)}
				<PortfolioCard {item} />
			{/each}
		</div>
		{#if hasMoreData}
			<div class="flex justify-center pt-4">
				<!-- Invisible sentinel, exactly as in the Next app: scrolling it into
				     view loads six more cards. -->
				<button
					use:inView={{ onEnter: () => (visibleCount += 6) }}
					aria-label="Load more"
					class="h-px w-px"
				></button>
			</div>
		{/if}
	</div>
{/if}
