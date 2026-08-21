<script lang="ts">
	import { format } from 'date-fns';

	import Seo from '$lib/components/seo.svelte';

	let { data } = $props();
</script>

<Seo title="Changelog" />

<div class="container mx-auto w-full">
	<div class="mb-8 flex flex-row justify-between">
		<h1 class="my-12 text-[28px] leading-[34px] font-bold tracking-[-0.416px] text-foreground">
			Changelog
		</h1>
	</div>

	{#if data.changelogs.length === 0}
		<div class="text-lg font-semibold">No changelogs found</div>
	{/if}

	<ul class="flex flex-col">
		{#each data.changelogs as changelog (changelog.id)}
			<li class="relative flex w-full flex-col sm:flex-row">
				<div class="flex w-full pb-4 sm:w-[200px] sm:pb-0">
					<p class="sans text-sm leading-[1.6] font-normal text-muted-foreground">
						<time class="sticky top-24 text-xl" datetime={changelog.date}>
							{format(changelog.date, 'PP')}
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
							<h2 class="text-4xl">{changelog.title}</h2>
							<div class="prose text-foreground">{@html changelog.html}</div>
						</div>
					</div>
				</div>
			</li>
		{/each}
	</ul>
</div>
