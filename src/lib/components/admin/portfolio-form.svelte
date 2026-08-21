<script lang="ts">
	import { api } from '$convex/_generated/api';
	import type { Doc, Id } from '$convex/_generated/dataModel';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import { useMutation } from 'convex-svelte';
	import { toast } from 'svelte-sonner';
	import { untrack } from 'svelte';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { getImageUrl } from '$lib/get-image-url.js';
	import { portfolioFormSchema } from '$lib/schemas/portfolio.js';
	import ImageDropzone from './image-dropzone.svelte';

	/**
	 * The Next app had two near-identical 250-line components,
	 * add-portfolio-form.tsx and edit-portfolio-form.tsx. They differ only in
	 * which mutations run on submit, so they are one component here with a mode.
	 *
	 * `item` is a submission in 'add' mode and a portfolio in 'edit' mode.
	 */
	let {
		open = $bindable(true),
		mode,
		item = null
	}: {
		open?: boolean;
		mode: 'add' | 'edit';
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		item?: any;
	} = $props();

	const generateUploadUrl = useMutation(api.uploads.generateUploadUrl);
	const createPortfolio = useMutation(api.portfolios.createPortfolio);
	const updatePortfolio = useMutation(api.portfolios.updatePortfolio);
	const updateSubmission = useMutation(api.submissions.updateSubmission);
	const deletePortfolioImage = useMutation(api.portfolios.deletePortfolioImage);

	let image = $state<File | null>(null);

	// `item` seeds the form once, on purpose: the admin page wraps this component
	// in {#key item?._id}, so picking a different row remounts it rather than
	// mutating a form the user may already be editing.
	//
	// In 'add' mode `item` is a submission, which by then carries what the review
	// pipeline (convex/review.ts) pulled off the site: a screenshot already in
	// Convex storage, plus suggested titles, tags and socials. Those are seeded
	// as ordinary form values — every one of them is editable, and nothing is
	// saved until the admin submits.
	const seed = untrack(() => {
		const review = item?.review;
		const imageId = item?.image ?? item?.screenshotId ?? '';

		return {
			initialUrl: imageId ? getImageUrl(imageId) : null,
			values: {
				name: item?.name ?? '',
				link: item?.link ?? '',
				tags: (item?.tags ?? review?.tags)?.join(', ') ?? '',
				titles: (item?.titles ?? review?.titles)?.join(', ') ?? '',
				socials: (item?.socials ?? review?.socials)?.join(', ') ?? '',
				image: imageId
			}
		};
	});

	const form = superForm(defaults(seed.values, zod(portfolioFormSchema)), {
		SPA: true,
		validators: zod(portfolioFormSchema),
		onUpdate: async ({ form: f }) => {
			if (!f.valid) return;

			// A trailing comma or an empty field would otherwise store [''] and show
			// up as a blank tag on the site.
			const split = (value: string) =>
				value
					.split(',')
					.map((part) => part.trim())
					.filter((part) => part !== '');

			try {
				if (mode === 'add') {
					// Either a freshly dropped file, or the screenshot the review
					// pipeline already captured and stored for this submission.
					const seededImage = f.data.image as Id<'_storage'> | '';
					if (!image && !seededImage) {
						toast.error('Please choose an image.');
						return;
					}

					if (item?._id) {
						await updateSubmission({
							submissionId: item._id,
							name: f.data.name,
							link: f.data.link,
							status: 'completed'
						});
					}

					const storageId = image ? await uploadImage(image) : (seededImage as Id<'_storage'>);

					await createPortfolio({
						name: f.data.name,
						link: f.data.link,
						tags: split(f.data.tags),
						titles: split(f.data.titles),
						socials: split(f.data.socials),
						image: storageId
					});

					open = false;
					toast.success('Submitted successfully!');
					return;
				}

				let imageId = f.data.image as Id<'_storage'>;

				if (image) {
					if (item.image) {
						await deletePortfolioImage({ storageId: item.image });
					}
					imageId = await uploadImage(image);
				}

				await updatePortfolio({
					portfolioId: (item as Doc<'portfolios'>)._id,
					name: f.data.name,
					link: f.data.link,
					tags: split(f.data.tags),
					titles: split(f.data.titles),
					socials: split(f.data.socials),
					image: imageId
				});

				open = false;
				toast.success('Portfolio updated successfully!');
			} catch (error) {
				console.error('Error saving portfolio:', error);
				toast.error('Failed to save portfolio. Please try again.');
			}
		}
	});

	async function uploadImage(file: File): Promise<Id<'_storage'>> {
		const postUrl = await generateUploadUrl({});
		const result = await fetch(postUrl, {
			method: 'POST',
			headers: { 'Content-Type': file.type },
			body: file
		});
		if (!result.ok) throw new Error('Failed to upload image');
		const { storageId } = await result.json();
		return storageId as Id<'_storage'>;
	}

	const { form: formData, enhance, submitting } = form;
</script>

<form method="POST" use:enhance class="space-y-4">
	<ImageDropzone bind:file={image} initialUrl={seed.initialUrl} />

	<Form.Field {form} name="name" class="flex flex-row items-center gap-2">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="w-20">Name</Form.Label>
				<Input {...props} bind:value={$formData.name} placeholder="Hosna Qasmei" />
			{/snippet}
		</Form.Control>
	</Form.Field>

	<Form.Field {form} name="link" class="flex flex-row items-center gap-2">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="w-20">Website</Form.Label>
				<Input {...props} bind:value={$formData.link} placeholder="https://www.example.com" />
			{/snippet}
		</Form.Control>
	</Form.Field>

	<Form.Field {form} name="titles" class="flex flex-row items-center gap-2">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="w-20">Titles</Form.Label>
				<Input {...props} bind:value={$formData.titles} placeholder="Developer, Designer" />
			{/snippet}
		</Form.Control>
	</Form.Field>

	<Form.Field {form} name="tags" class="flex flex-row items-center gap-2">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="w-20">Tags</Form.Label>
				<Input {...props} bind:value={$formData.tags} placeholder="Light, Dark" />
			{/snippet}
		</Form.Control>
	</Form.Field>

	<Form.Field {form} name="socials" class="flex flex-row items-center gap-2">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="w-20">Socials</Form.Label>
				<Textarea {...props} bind:value={$formData.socials} placeholder="https://www.example.com" />
			{/snippet}
		</Form.Control>
	</Form.Field>

	<div class="flex w-full justify-end">
		<Button type="submit" disabled={$submitting}>
			{#if $submitting}
				<div class="flex items-center gap-2">
					<Loader2Icon class="h-4 w-4 animate-spin" />
					<span>Submit</span>
				</div>
			{:else}
				<span>Submit</span>
			{/if}
		</Button>
	</div>
</form>
