<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
</script>

<div class="flex flex-col gap-4">
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
		{#each Array.from({ length: 6 }) as _, idx (idx)}
			<Card.Root class="relative w-full">
				<div>
					<div class="overflow-hidden rounded-t-lg border-b">
						<Skeleton class="h-80 rounded-none object-top" />
					</div>
				</div>

				<Card.Content class="flex px-4 py-3">
					<Skeleton class="h-6 w-36" />
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</div>
