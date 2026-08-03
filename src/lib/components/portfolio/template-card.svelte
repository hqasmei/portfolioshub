<script lang="ts">
	import type { Doc } from '$convex/_generated/dataModel';

	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { getImageUrl } from '$lib/get-image-url.js';

	let { template }: { template: Doc<'templates'> } = $props();
</script>

<Card.Root class="relative w-full rounded-xl border-t-0 shadow-xs hover:shadow-xl">
	<div class="relative">
		<a href={template.link} target="_blank" rel="noopener noreferrer">
			<div>
				<div class="overflow-hidden rounded-t-xl border-t">
					<img
						src={getImageUrl(template.image)}
						alt={template.name}
						width="400"
						height="200"
						fetchpriority="high"
						decoding="async"
						class="h-80 w-full border-b object-cover object-top"
					/>
				</div>
			</div>
			<div class="p-4 text-start">
				<div class="flex flex-row items-center justify-between">
					<h3 class="text-xl font-bold">{template.name}</h3>
					{#if template.isPaid}
						<Badge class="text-foreground dark:border-yellow-300 dark:bg-yellow-700">Paid</Badge>
					{:else}
						<Badge class="text-foreground dark:border-green-300 dark:bg-green-700">Free</Badge>
					{/if}
				</div>

				<span class="line-clamp-2 text-sm text-muted-foreground">{template.description}</span>

				{#if template.technology && template.technology.length > 0 && !template.technology.includes('')}
					<div class="flex flex-wrap gap-2 pt-2">
						{#each template.technology as tag, idx (idx)}
							<Badge variant="secondary" class="whitespace-nowrap">{tag}</Badge>
						{/each}
					</div>
				{/if}
			</div>
		</a>
	</div>
</Card.Root>
