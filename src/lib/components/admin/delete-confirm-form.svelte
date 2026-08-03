<script lang="ts">
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import { toast } from 'svelte-sonner';

	import { Button } from '$lib/components/ui/button/index.js';

	/**
	 * Replaces the Next app's delete-portfolio-form.tsx and
	 * delete-submission-form.tsx. Both used react-hook-form in name only — no
	 * fields, and their zod schemas were never exercised — so this is plain
	 * buttons plus a loading flag.
	 */
	let { open = $bindable(true), onConfirm }: { open?: boolean; onConfirm: () => Promise<unknown> } =
		$props();

	let isLoading = $state(false);

	async function handleDelete() {
		isLoading = true;
		try {
			await onConfirm();
			open = false;
			toast.success('Deleted successfully!');
		} catch (error) {
			console.log(error);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="flex w-full justify-center space-x-6">
	<Button
		size="lg"
		variant="outline"
		disabled={isLoading}
		class="w-full"
		type="button"
		onclick={() => (open = false)}
	>
		Cancel
	</Button>
	<Button
		size="lg"
		type="button"
		disabled={isLoading}
		onclick={handleDelete}
		class="w-full bg-red-500 hover:bg-red-400"
	>
		{#if isLoading}
			<Loader2Icon class="mr-2 h-4 w-4 animate-spin" />
			Deleting
		{:else}
			<span>Delete</span>
		{/if}
	</Button>
</div>
