<script lang="ts">
	import Seo from '$lib/components/seo.svelte';
	import { api } from '$convex/_generated/api';
	import { useQuery } from 'convex-svelte';

	import MaxWidthWrapper from '$lib/components/max-width-wrapper.svelte';
	import PortfolioCard from '$lib/components/portfolio/portfolio-card.svelte';
	import { useSession } from '$lib/hooks/session.svelte.js';

	const session = useSession();

	const getAllFavorites = useQuery(api.favorites.getFavoritesForUser, () =>
		session.isConvexAuthed ? {} : 'skip'
	);
</script>

<Seo title="Favorites" />

<MaxWidthWrapper class="pt-4 md:pt-0">
	<span class="text-3xl font-bold md:hidden md:text-4xl">Favorites</span>

	{#if getAllFavorites.data && getAllFavorites.data.length === 0}
		<div
			class="mt-6 flex h-56 flex-col items-center justify-center gap-4 rounded-md border px-4 text-center"
		>
			<h1 class="text-xl font-bold md:text-2xl">You have no favorites yet!</h1>
			<p class="text-sm text-balance text-muted-foreground md:text-base">
				Start by adding some favorites to your dashboard!
			</p>
		</div>
	{:else}
		<div class="mt-6 grid grid-cols-1 gap-4 pb-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
			{#each getAllFavorites.data ?? [] as item (item._id)}
				<PortfolioCard item={item.portfolioId} isFavoriteCard={true} favoriteId={item._id} />
			{/each}
		</div>
	{/if}
</MaxWidthWrapper>
