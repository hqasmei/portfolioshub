<script lang="ts">
	import { api } from '$convex/_generated/api';
	import { useQuery } from 'convex-svelte';

	const portfolios = useQuery(api.portfolios.getAllPortfolios, {});
	const numberOfPortfolios = $derived(portfolios.data?.length);
</script>

<div class="flex w-full items-center justify-center sm:mt-8">
	<div class="group relative">
		<div
			class="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-emerald-600 blur-sm transition-all duration-300 group-hover:blur"
		></div>
		<a
			href="/templates"
			class="relative inline-flex items-center space-x-2 rounded-full border border-emerald-500 bg-white px-4 py-1 text-emerald-600 transition-all duration-200 hover:text-emerald-700 dark:bg-black dark:text-emerald-400 dark:hover:text-emerald-300"
		>
			<span class="text-sm font-medium">Introducing Portfolio Templates</span>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-4 w-4"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
					clip-rule="evenodd"
				/>
			</svg>
		</a>
	</div>
</div>

<div class="flex flex-col items-center gap-y-6 sm:gap-y-7">
	<h1
		class="lg:-tracking-4 -tracking-3 max-w-3xl text-center text-4xl font-bold text-pretty text-neutral-900 md:text-5xl lg:text-6xl lg:leading-[4rem] lg:font-extrabold dark:text-white"
	>
		Best place to find{' '}
		<span class="relative inline-block">
			portfolio
			<svg
				class="absolute -bottom-1 left-0 h-3 w-full"
				viewBox="0 0 200 9"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M1 7.5C31 3.5 61 3.5 91 3.5C121 3.5 151 3.5 181 7.5"
					stroke="url(#paint0_linear)"
					stroke-width="2"
					stroke-linecap="round"
				/>
				<defs>
					<linearGradient
						id="paint0_linear"
						x1="1"
						y1="5"
						x2="181"
						y2="5"
						gradientUnits="userSpaceOnUse"
					>
						<stop stop-color="#34d399" />
						<stop offset="1" stop-color="#059669" />
					</linearGradient>
				</defs>
			</svg>
		</span>{' '}
		inspiration
	</h1>
</div>
<p
	class="mx-auto block max-w-sm text-center text-base text-balance text-neutral-700 md:max-w-3xl md:text-lg xl:text-xl dark:text-neutral-300"
>
	Browse our curated collection of{' '}
	{#if numberOfPortfolios}
		<span class="font-semibold text-foreground">{numberOfPortfolios}+</span>
	{/if}{' '}
	exceptional designs to help you create your best portfolio yet.
</p>
