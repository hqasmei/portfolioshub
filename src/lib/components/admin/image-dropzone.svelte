<script lang="ts">
	import ImageIcon from '@lucide/svelte/icons/image';

	import { cn } from '$lib/utils.js';

	let {
		file = $bindable(null),
		initialUrl = null
	}: { file?: File | null; initialUrl?: string | null } = $props();

	let isDragActive = $state(false);
	let objectUrl = $state<string | null>(null);

	const previewUrl = $derived(objectUrl ?? initialUrl);

	function accept(next: File | null | undefined) {
		if (!next) return;
		// The Next app created object URLs but never revoked them.
		if (objectUrl) URL.revokeObjectURL(objectUrl);
		file = next;
		objectUrl = URL.createObjectURL(next);
	}

	$effect(() => {
		return () => {
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	});
</script>

<label for="file-upload" class="cursor-pointer">
	<div
		role="button"
		tabindex="0"
		ondragover={(e) => {
			e.preventDefault();
			isDragActive = true;
		}}
		ondragleave={() => (isDragActive = false)}
		ondrop={(e) => {
			e.preventDefault();
			isDragActive = false;
			accept(e.dataTransfer?.files?.[0]);
		}}
		class={cn(
			isDragActive ? 'border-border-strong' : '',
			'flex h-36 flex-col items-center justify-center gap-2 rounded-md border border-dashed'
		)}
	>
		{#if previewUrl}
			<img
				src={previewUrl}
				alt="Uploaded"
				width="400"
				height="200"
				class="w-full overflow-hidden rounded-md object-cover object-top"
			/>
		{:else}
			<ImageIcon class="stroke-muted-foreground" />
			<span class="text-xs text-muted-foreground">Upload image</span>
		{/if}
		<input
			id="file-upload"
			type="file"
			accept="image/*"
			class="hidden"
			onchange={(e) => accept(e.currentTarget.files?.[0])}
		/>
	</div>
</label>
