<script lang="ts">
	import Seo from '$lib/components/seo.svelte';
	import MaxWidthWrapper from '$lib/components/max-width-wrapper.svelte';
	import FilterAndSortBar from '$lib/components/portfolio/filter-and-sort-bar.svelte';
	import MainContent from '$lib/components/portfolio/main-content.svelte';

	let selectedSort = $state('recentlyAdded');
	let selectedFilter = $state('All');
	let searchValue = $state('');
</script>

<Seo title="Dashboard" />

<MaxWidthWrapper class="pt-4 md:pt-0">
	<span class="block text-3xl font-bold md:hidden md:text-4xl">Dashboard</span>
	<div class="relative pt-2 pb-6">
		<FilterAndSortBar bind:searchValue bind:selectedSort bind:selectedFilter />
		<MainContent {selectedSort} {selectedFilter} {searchValue} />
	</div>
</MaxWidthWrapper>
