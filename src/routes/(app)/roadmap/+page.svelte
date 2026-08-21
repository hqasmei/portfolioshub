<script lang="ts">
	import { format } from 'date-fns';

	import Seo from '$lib/components/seo.svelte';

	let { data } = $props();
</script>

<Seo title="Roadmap" />

<div class="container mx-auto w-full">
	<div class="mb-8 flex flex-row justify-between">
		<h1 class="my-12 text-[28px] leading-[34px] font-bold tracking-[-0.416px] text-foreground">
			Roadmap
		</h1>
	</div>

	{#if data.roadmapItems.length === 0}
		<div class="text-lg font-semibold">No roadmap items found</div>
	{/if}

	<ul class="flex flex-col">
		{#each data.roadmapItems as roadmapItem (roadmapItem.id)}
			<li class="relative flex w-full flex-col sm:flex-row">
				<div class="flex w-full pb-4 sm:w-[200px] sm:pb-0">
					<p class="sans text-sm leading-[1.6] font-normal text-muted-foreground">
						<time class="sticky top-24 text-xl" datetime={roadmapItem.releaseDate}>
							{format(roadmapItem.releaseDate, 'PP')}
						</time>
					</p>
				</div>

				<div class="relative hidden sm:flex sm:w-[100px]">
					<div class="absolute top-0.5 left-0.5 h-full w-0.5 bg-border"></div>
					<div
						class="sticky top-[102px] left-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-border-strong"
					></div>
				</div>

				<div class="w-full pb-16">
					<div class="space-y-4">
						<div class="flex flex-col gap-4">
							<h2 class="text-4xl">{roadmapItem.title}</h2>
							<div class="prose text-foreground">{@html roadmapItem.html}</div>
						</div>
					</div>
				</div>
			</li>
		{/each}
	</ul>
</div>
