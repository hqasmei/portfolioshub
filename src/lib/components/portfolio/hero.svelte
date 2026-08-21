<script lang="ts">
	import { api } from '$convex/_generated/api';
	import { useQuery } from 'convex-svelte';

	const portfolios = useQuery(api.portfolios.getAllPortfolios, {});
	const numberOfPortfolios = $derived(portfolios.data?.length);
</script>

<div class="flex flex-col items-center gap-y-6 pt-6 sm:pt-14">
	<h1
		class="lg:-tracking-4 -tracking-3 max-w-3xl text-center text-4xl font-bold text-pretty text-foreground md:text-5xl lg:text-6xl lg:leading-[4rem] lg:font-extrabold"
	>
		Best place to find{' '}
		<span class="relative inline-block">
			portfolio
			<!-- One of the two sanctioned uses of the accent green. -->
			<svg
				class="absolute -bottom-1 left-0 h-3 w-full text-brand"
				viewBox="0 0 200 9"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M1 7.5C31 3.5 61 3.5 91 3.5C121 3.5 151 3.5 181 7.5"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
				/>
			</svg>
		</span>{' '}
		inspiration
	</h1>
</div>
<p
	class="mx-auto block max-w-sm text-center text-base text-balance text-muted-foreground md:max-w-3xl md:text-lg xl:text-xl"
>
	Browse our curated collection of{' '}
	{#if numberOfPortfolios}
		<span class="font-semibold text-foreground">{numberOfPortfolios}+</span>
	{/if}{' '}
	exceptional designs to help you create your best portfolio yet.
</p>
