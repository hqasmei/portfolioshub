<script lang="ts">
	import { page } from '$app/state';
	import { api } from '$convex/_generated/api';
	import type { Id } from '$convex/_generated/dataModel';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import HeartIcon from '@lucide/svelte/icons/heart';
	import { useMutation, useQuery } from 'convex-svelte';
	import { SignInButton } from 'svelte-clerk';

	import SocialIcon from '$lib/components/social-icon.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { useFavorites } from '$lib/hooks/favorites.svelte.js';
	import { useSession } from '$lib/hooks/session.svelte.js';
	import { getImageUrl } from '$lib/get-image-url.js';
	import { cn } from '$lib/utils.js';

	const portfolioId = $derived(page.params.id as Id<'portfolios'>);

	const session = useSession();
	const favorites = useFavorites();
	const query = useQuery(api.portfolios.getPortfolioFromId, () => ({ portfolioId }));

	const addFavorite = useMutation(api.favorites.addFavorite);
	const removeFavorite = useMutation(api.favorites.removeFavorite);
	const incrementPortfolioFavoriteCount = useMutation(
		api.portfolios.incrementPortfolioFavoriteCount
	);
	const decrementPortfolioFavoriteCount = useMutation(
		api.portfolios.decrementPortfolioFavoriteCount
	);

	const portfolio = $derived(query.data);
	const isFavorited = $derived(favorites.map.has(portfolioId));

	async function handleFavoriteClick() {
		const favoriteId = favorites.map.get(portfolioId);
		if (favoriteId) {
			// Portfolio is favorited, so remove the favorite
			await removeFavorite({ favoriteId });
			await decrementPortfolioFavoriteCount({ portfolioId });
		} else {
			// Portfolio is not favorited, so add a favorite
			await addFavorite({ portfolioId });
			await incrementPortfolioFavoriteCount({ portfolioId });
		}
	}
</script>

<svelte:head>
	<title>{portfolio ? `${portfolio.name} | PortfoliosHub` : 'PortfoliosHub'}</title>
</svelte:head>

{#if portfolio}
	<main
		class="relative mx-auto flex w-full flex-col gap-4 px-4 pt-4 pb-8 sm:px-8 lg:flex-row lg:gap-8 lg:px-24"
	>
		<!-- Left sidebar - fixed -->
		<div class="lg:sticky lg:top-0 lg:h-screen lg:w-1/6">
			<div class="lg:sticky lg:top-10 lg:-mt-12 lg:h-[calc(100vh-3.5rem)] lg:py-12">
				<button
					onclick={() => history.back()}
					class="group flex items-center gap-1 text-sm text-muted-foreground"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4 rotate-180 fill-muted-foreground transition-colors duration-200 group-hover:-translate-x-0.5 group-hover:fill-foreground"
						viewBox="0 0 20 20"
					>
						<path
							fill-rule="evenodd"
							d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
							clip-rule="evenodd"
						/>
					</svg>
					<span class="transition-colors duration-200 group-hover:text-foreground">Back</span>
				</button>
			</div>
		</div>

		<!-- Center content - main scrollable area -->
		<div class="w-full lg:w-3/6">
			<div class="space-y-8">
				<img
					src={getImageUrl(portfolio.image)}
					alt={portfolio.name}
					width="1940"
					height="1340"
					fetchpriority="high"
					decoding="async"
					class="w-full rounded-lg object-cover object-top shadow-md"
				/>
			</div>
		</div>

		<!-- Right sidebar - fixed -->
		<div class="lg:sticky lg:top-0 lg:h-screen lg:w-2/6">
			<div class="lg:sticky lg:top-10 lg:-mt-12 lg:h-[calc(100vh-3.5rem)] lg:py-12">
				<div class="rounded-lg bg-secondary/50 p-4">
					<div class="flex flex-col gap-1">
						<h2 class="text-2xl font-bold">{portfolio.name}</h2>
						{#if portfolio.titles && !portfolio.titles.includes('')}
							<div class="flex flex-wrap gap-2">
								{#each portfolio.titles as title, idx (idx)}
									<Badge variant="secondary">{title}</Badge>
								{/each}
							</div>
						{/if}
					</div>

					{#if portfolio.favoritesCount !== undefined && portfolio.favoritesCount !== null}
						<div class="mt-4 text-sm text-muted-foreground">
							{portfolio.favoritesCount === 1 ? '1 like' : `${portfolio.favoritesCount} likes`}
						</div>
					{/if}

					<div class="mt-4 flex flex-row items-center justify-between">
						{#if portfolio.socials && portfolio.socials.length > 0}
							<div class="flex items-center gap-2">
								<div class="flex items-center gap-2">
									{#each portfolio.socials as social, idx (idx)}
										<div
											class="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
										>
											<SocialIcon url={social} class="stroke-muted-foreground" />
										</div>
									{/each}
								</div>
							</div>
						{/if}

						<div class="flex items-center justify-end gap-2">
							<div class="flex items-center gap-2">
								{#if session.isLoggedIn}
									<Button
										size="icon"
										variant="ghost"
										onclick={handleFavoriteClick}
										class="flex h-8 w-8 items-center gap-2 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
									>
										<HeartIcon
											size={18}
											class={cn(
												'stroke-muted-foreground duration-200 group-hover:stroke-emerald-500',
												isFavorited && 'fill-emerald-500 stroke-emerald-500'
											)}
										/>
									</Button>
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
							</div>

							<Button
								size="icon"
								variant="ghost"
								href={portfolio.link}
								target="_blank"
								class="h-8 w-8 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
							>
								<ExternalLinkIcon size={18} />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</main>
{/if}
