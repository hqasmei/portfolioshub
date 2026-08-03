<script lang="ts">
	import { api } from '$convex/_generated/api';
	import type { Doc, Id } from '$convex/_generated/dataModel';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import HeartIcon from '@lucide/svelte/icons/heart';
	import { useMutation, useQuery } from 'convex-svelte';
	import { SignInButton } from 'svelte-clerk';

	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { useFavorites } from '$lib/hooks/favorites.svelte.js';
	import { useSession } from '$lib/hooks/session.svelte.js';
	import { getImageUrl } from '$lib/get-image-url.js';
	import { cn } from '$lib/utils.js';

	let {
		item,
		isFavoriteCard = false,
		favoriteId
	}: {
		item: Doc<'portfolios'> | Id<'portfolios'>;
		isFavoriteCard?: boolean;
		favoriteId?: Id<'favorites'>;
	} = $props();

	const session = useSession();
	const favorites = useFavorites();

	const portfolioId = $derived(typeof item === 'object' ? item._id : item);

	// The Next app ran this query for *every* card and threw the result away
	// unless isFavoriteCard — N+1 live subscriptions on the grid. Skipping when
	// it isn't needed renders identically with far fewer subscriptions.
	const queryResult = useQuery(api.portfolios.getPortfolioFromId, () =>
		isFavoriteCard ? { portfolioId } : 'skip'
	);

	const portfolio = $derived(
		isFavoriteCard ? queryResult.data : typeof item === 'object' ? item : null
	);

	const addFavorite = useMutation(api.favorites.addFavorite);
	const removeFavorite = useMutation(api.favorites.removeFavorite);
	const incrementPortfolioFavoriteCount = useMutation(
		api.portfolios.incrementPortfolioFavoriteCount
	);
	const decrementPortfolioFavoriteCount = useMutation(
		api.portfolios.decrementPortfolioFavoriteCount
	);

	const isFavorited = $derived(isFavoriteCard || favorites.map.has(portfolioId));

	async function handleFavoriteClick() {
		if (isFavoriteCard) {
			await removeFavorite({ favoriteId: favoriteId as Id<'favorites'> });
		} else if (isFavorited) {
			const favId = favorites.map.get(portfolioId);
			await removeFavorite({ favoriteId: favId as Id<'favorites'> });
			await decrementPortfolioFavoriteCount({ portfolioId });
		} else {
			await addFavorite({ portfolioId });
			await incrementPortfolioFavoriteCount({ portfolioId });
		}
	}
</script>

{#if portfolio}
	{@const showCount = !isFavoriteCard && !!portfolio.favoritesCount}
	<Card.Root class="group relative w-full transition-all duration-200 hover:shadow-lg">
		<a href="/portfolio/{portfolio._id}">
			<!-- next/image gave nothing here: the Convex /getImage endpoint does no
			     resizing, so a plain <img> is byte-for-byte the same request. -->
			<img
				src={getImageUrl(portfolio.image)}
				alt={portfolio.name}
				width="400"
				height="200"
				fetchpriority="high"
				decoding="async"
				class="h-80 w-full rounded-t-lg border-b object-cover object-top"
			/>
			<Card.Content class="p-4 transition-all duration-200 dark:group-hover:bg-accent/50">
				<div class="flex flex-col items-start gap-2">
					<div class="flex flex-col items-start gap-1">
						<h3 class="text-lg font-medium text-foreground transition-all duration-200">
							{portfolio.name}
						</h3>
						<div class="flex flex-wrap gap-2">
							{#each portfolio.titles ?? [] as title, idx (idx)}
								<Badge variant="secondary">
									<span class="text-xs text-muted-foreground">{title}</span>
								</Badge>
							{/each}
						</div>
					</div>
				</div>
			</Card.Content>
		</a>
		<div class="absolute right-4 bottom-4 flex flex-row items-center">
			<div class="flex items-center gap-4">
				<div class="flex items-center gap-2">
					{#if session.isLoggedIn}
						<button onclick={handleFavoriteClick} aria-label="Toggle favorite">
							<HeartIcon
								size={18}
								class={cn(
									'stroke-muted-foreground duration-200 group-hover:stroke-emerald-500',
									isFavorited && 'fill-emerald-500 stroke-emerald-500'
								)}
							/>
						</button>
					{:else}
						<SignInButton mode="modal">
							<button aria-label="Sign in to favorite">
								<HeartIcon
									size={18}
									class={cn(
										'stroke-muted-foreground duration-200 hover:stroke-emerald-500',
										isFavorited && 'fill-emerald-500 stroke-emerald-500'
									)}
								/>
							</button>
						</SignInButton>
					{/if}
					{#if showCount}
						<span
							class={cn(
								'text-sm text-muted-foreground duration-200 group-hover:text-emerald-500',
								isFavorited && 'text-emerald-500'
							)}
						>
							{portfolio.favoritesCount ?? 0}
						</span>
					{/if}
				</div>
				<a href={portfolio.link} target="_blank" rel="noopener noreferrer">
					<ExternalLinkIcon
						size={18}
						class="stroke-muted-foreground duration-200 hover:stroke-emerald-500"
					/>
				</a>
			</div>
		</div>
	</Card.Root>
{/if}
