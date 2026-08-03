<script lang="ts">
	import Seo from '$lib/components/seo.svelte';
	import { api } from '$convex/_generated/api';
	import { useQuery } from 'convex-svelte';

	import MaxWidthWrapper from '$lib/components/max-width-wrapper.svelte';
	import TemplateCard from '$lib/components/portfolio/template-card.svelte';

	const getAllTemplates = useQuery(api.templates.getAllTemplates, {});
</script>

<Seo title="Templates" />

<MaxWidthWrapper class="pt-4">
	<div class="flex flex-col gap-2">
		<h1 class="text-3xl font-bold md:text-4xl">Portfolio Templates</h1>
		<p class="text-muted-foreground">
			Here are some templates that you can use to get started, both paid and free.
		</p>
	</div>
	<div class="relative pt-6 pb-6">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
			{#each getAllTemplates.data ?? [] as template (template._id)}
				<TemplateCard {template} />
			{/each}
		</div>
	</div>
</MaxWidthWrapper>
