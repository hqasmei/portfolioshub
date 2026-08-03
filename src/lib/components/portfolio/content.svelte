<script lang="ts">
	import FilterAndSortBar from './filter-and-sort-bar.svelte';
	import MainContent from './main-content.svelte';

	// The Next app duplicated this state in (landing)/_components/content.tsx and
	// dashboard/page.tsx; both now use this one component.
	let selectedSort = $state('recentlyAdded');
	let selectedFilter = $state('All');
	let searchValue = $state('');
</script>

<div class="py-6">
	<FilterAndSortBar bind:searchValue bind:selectedSort bind:selectedFilter />
	<MainContent {selectedSort} {selectedFilter} {searchValue} />
</div>
