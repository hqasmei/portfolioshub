<script lang="ts">
	import { env } from '$env/dynamic/public';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import { toast } from 'svelte-sonner';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { feedbackFormSchema } from '$lib/schemas/feedback.js';

	let { open = $bindable(true) }: { open?: boolean } = $props();

	// SPA mode: this posts cross-origin to projectplannerai from inside a modal,
	// so there is no SvelteKit form action to progressively enhance. superforms
	// is used because shadcn-svelte's Form.* components require its context.
	const form = superForm(defaults(zod(feedbackFormSchema)), {
		SPA: true,
		validators: zod(feedbackFormSchema),
		onUpdate: async ({ form: f }) => {
			if (!f.valid) return;
			await fetch('https://projectplannerai.com/api/feedback', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					projectId: env.PUBLIC_PROJECT_PLANNER_AI_ID,
					feedback: f.data.feedback,
					name: f.data.name,
					email: f.data.email
				})
			});
			open = false;
			toast.success('Feedback successfully submitted! ');
		}
	});

	const { form: formData, enhance, submitting } = form;
</script>

<form method="POST" use:enhance class="space-y-4 px-4 pb-4 md:px-0 md:pb-0">
	<Form.Field {form} name="name">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Your name</Form.Label>
				<!-- svelte-ignore a11y_autofocus -->
				<Input {...props} bind:value={$formData.name} placeholder="Hosna Qasmei" autofocus />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="email">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Your email</Form.Label>
				<Input {...props} bind:value={$formData.email} placeholder="test@example.com" />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="feedback">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Feedback</Form.Label>
				<Textarea
					{...props}
					bind:value={$formData.feedback}
					placeholder="Can you please add light mode"
				/>
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
