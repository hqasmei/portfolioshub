<script lang="ts">
	import { api } from '$convex/_generated/api';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import { useMutation } from 'convex-svelte';
	import { toast } from 'svelte-sonner';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { submissionFormSchema } from '$lib/schemas/submission.js';

	let { open = $bindable(true) }: { open?: boolean } = $props();

	const createSubmission = useMutation(api.submissions.createSubmission);

	const form = superForm(defaults(zod(submissionFormSchema)), {
		SPA: true,
		validators: zod(submissionFormSchema),
		onUpdate: async ({ form: f }) => {
			if (!f.valid) return;
			await createSubmission({ name: f.data.name, link: f.data.link });
			open = false;
			toast.success(
				'Your portfolio has been submitted! We will review it shortly. It should appear within a few hours.'
			);
		}
	});

	const { form: formData, enhance, submitting } = form;
</script>

<form method="POST" use:enhance class="space-y-4 px-4 pb-4 md:px-0 md:pb-0">
	<Form.Field {form} name="name">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Name</Form.Label>
				<!-- svelte-ignore a11y_autofocus -->
				<Input {...props} bind:value={$formData.name} placeholder="Hosna Qasmei" autofocus />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="link">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Portfolio website</Form.Label>
				<Input {...props} bind:value={$formData.link} placeholder="https://www.example.com" />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<div class="flex w-full justify-end">
		<Button type="submit" disabled={$submitting}>
			{#if $submitting}
				<Loader2Icon class="h-4 w-4 animate-spin" />
			{:else}
				<span>Submit</span>
			{/if}
		</Button>
	</div>
</form>
