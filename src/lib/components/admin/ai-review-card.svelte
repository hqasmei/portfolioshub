<script lang="ts">
	import type { Doc } from '$convex/_generated/dataModel';
	import CheckIcon from '@lucide/svelte/icons/check';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';
	import XIcon from '@lucide/svelte/icons/x';

	import { VERDICT_LABELS } from '$lib/admin/submissions-filter.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { getImageUrl } from '$lib/get-image-url.js';
	import { cn } from '$lib/utils.js';

	/**
	 * What the review pipeline (convex/review.ts) found, shown above the add form
	 * so the decision and the evidence for it are on one screen.
	 *
	 * It is a recommendation, never an action: nothing here approves anything,
	 * and the wording is deliberately hedged ("looks legit") so it reads as a
	 * second opinion rather than a ruling.
	 */
	let { submission }: { submission: Doc<'submissions'> } = $props();

	const review = $derived(submission.review);

	const verdictClass = {
		approve: 'bg-green-700 hover:bg-green-800',
		review: 'bg-yellow-700 hover:bg-yellow-800',
		reject: 'bg-red-700 hover:bg-red-800'
	} as const;

	/**
	 * `positive` is what a good portfolio looks like for that check, so the tick
	 * always means "fine" — `isPlaceholder: false` and `loads: true` both read as
	 * a tick rather than making the reader invert half the row in their head.
	 */
	type ReviewChecks = NonNullable<NonNullable<Doc<'submissions'>['review']>['checks']>;

	const checkLabels: { key: keyof ReviewChecks; label: string; positive: boolean }[] = [
		{ key: 'loads', label: 'Loads', positive: true },
		{ key: 'isPersonalPortfolio', label: 'Personal site', positive: true },
		{ key: 'hasOwnWork', label: 'Shows own work', positive: true },
		{ key: 'isPlaceholder', label: 'Placeholder', positive: false },
		{ key: 'isTemplateDemo', label: 'Template demo', positive: false },
		{ key: 'nsfw', label: 'NSFW', positive: false }
	];
</script>

<section class="flex flex-col gap-3" aria-label="AI review">
	{#if submission.screenshotId}
		<img
			src={getImageUrl(submission.screenshotId)}
			alt={`Screenshot of ${submission.link}`}
			class="aspect-[16/10] w-full rounded-md border object-cover object-top"
			loading="lazy"
		/>
	{/if}

	{#if !review}
		<p class="flex items-center gap-2 text-sm text-muted-foreground">
			<Loader2Icon class="size-4 animate-spin" aria-hidden="true" />
			Reviewing this site…
		</p>
	{:else}
		<div class="flex flex-wrap items-center gap-2">
			{#if review.verdict}
				<Badge class={cn('text-foreground', verdictClass[review.verdict])}>
					{VERDICT_LABELS[review.verdict]}
				</Badge>
			{/if}
			{#if review.confidence !== undefined}
				<span class="text-xs text-muted-foreground">
					{Math.round(review.confidence * 100)}% confident
				</span>
			{/if}
		</div>

		{#if review.reason}
			<p class="text-sm">{review.reason}</p>
		{/if}

		{#if review.state === 'failed'}
			<p
				class="flex items-start gap-2 rounded-md border border-yellow-700/40 bg-yellow-700/10 p-2 text-xs text-muted-foreground"
			>
				<TriangleAlertIcon class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
				<span>
					The review did not finish, so check this one yourself.
					{#if review.error}<span class="block break-words opacity-80">{review.error}</span>{/if}
				</span>
			</p>
		{/if}

		{#if review.checks}
			{@const checks = review.checks}
			<ul class="flex flex-wrap gap-1.5">
				{#each checkLabels as check (check.key)}
					{@const isFine = checks[check.key] === check.positive}
					<li
						class={cn(
							'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs',
							isFine ? 'text-muted-foreground' : 'border-red-700/40 text-red-600 dark:text-red-400'
						)}
					>
						{#if isFine}
							<CheckIcon class="size-3" aria-hidden="true" />
						{:else}
							<XIcon class="size-3" aria-hidden="true" />
						{/if}
						{check.label}
					</li>
				{/each}
			</ul>
		{/if}

		{#if review.description}
			<p class="text-xs text-muted-foreground">{review.description}</p>
		{/if}

		{#if review.tech?.length}
			<p class="text-xs text-muted-foreground">
				<span class="font-medium text-foreground">Built with:</span>
				{review.tech.join(', ')}
			</p>
		{/if}

		{#if review.socials?.length}
			<ul class="flex flex-wrap gap-x-3 gap-y-1 text-xs">
				{#each review.socials as social (social)}
					<li>
						<a
							href={social}
							target="_blank"
							rel="noopener noreferrer nofollow"
							class="text-muted-foreground hover:text-foreground hover:underline"
						>
							{social.replace(/^https?:\/\/(www\.)?/, '')}
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
</section>
