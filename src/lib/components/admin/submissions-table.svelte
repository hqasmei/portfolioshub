<script lang="ts">
	import { api } from '$convex/_generated/api';
	import type { Doc } from '$convex/_generated/dataModel';
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { useMutation } from 'convex-svelte';
	import { format } from 'date-fns';
	import { toast } from 'svelte-sonner';

	import AiReviewCard from '$lib/components/admin/ai-review-card.svelte';
	import DeleteConfirmForm from '$lib/components/admin/delete-confirm-form.svelte';
	import PortfolioForm from '$lib/components/admin/portfolio-form.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import {
		STATUS_LABELS,
		STATUS_VARIANTS,
		VERDICT_LABELS,
		VERDICT_VARIANTS,
		normalizeStatus,
		selectSubmissions,
		type StatusFilter
	} from '$lib/admin/submissions-filter.js';
	import {
		DEFAULT_PAGE_SIZE,
		PAGE_SIZES,
		ariaSortFor,
		toggleSort,
		type SortColumn,
		type SortKey
	} from '$lib/admin/table-view.js';
	import { cn } from '$lib/utils.js';

	/**
	 * The submissions moderation table. Replaces the unpaginated card grid the
	 * admin page used to render inline.
	 *
	 * The page owns the Convex subscription and the admin gate; this component
	 * owns the view state and the submission dialogs, which is what keeps
	 * +page.svelte from being one long file again.
	 */
	let {
		submissions,
		isLoading = false,
		errorMessage = null
	}: {
		submissions: Doc<'submissions'>[] | undefined;
		isLoading?: boolean;
		errorMessage?: string | null;
	} = $props();

	const deleteSubmission = useMutation(api.submissions.deleteSubmission);
	const rejectSubmission = useMutation(api.submissions.rejectSubmission);
	const retryReview = useMutation(api.submissions.retryReview);

	const COLUMN_COUNT = 6;

	const statusLabels: Record<StatusFilter, string> = {
		all: 'All statuses',
		...STATUS_LABELS
	};

	let search = $state('');
	// The queue, not the archive: what lands here by default is the work.
	let status = $state<StatusFilter>('needs_review');
	let sort = $state<SortKey>('newest');
	let page = $state(1);
	let pageSize = $state<number>(DEFAULT_PAGE_SIZE);

	let item = $state<Doc<'submissions'> | null>(null);
	let isPromoteOpen = $state(false);
	let isRejectOpen = $state(false);

	const view = $derived(selectSubmissions(submissions, { search, status, sort, page, pageSize }));

	// Every control that changes the result set resets the page in its own
	// handler. Combined with the clamp inside selectSubmissions (which covers
	// rows disappearing underneath you), that removes any need for an $effect
	// writing back into the state it reads.
	function setSearch(value: string) {
		search = value;
		page = 1;
	}

	function setStatus(value: StatusFilter) {
		status = value;
		page = 1;
	}

	function setPageSize(value: number) {
		pageSize = value;
		page = 1;
	}

	function sortBy(column: SortColumn) {
		sort = toggleSort(sort, column);
		page = 1;
	}

	function clearFilters() {
		search = '';
		status = 'needs_review';
		page = 1;
	}

	function promote(submission: Doc<'submissions'>) {
		item = submission;
		isPromoteOpen = true;
	}

	function reject(submission: Doc<'submissions'>) {
		item = submission;
		isRejectOpen = true;
	}

	async function rerun(submission: Doc<'submissions'>) {
		try {
			await retryReview({ submissionId: submission._id });
			toast.success('Reviewing again — the row updates when it finishes.');
		} catch (error) {
			console.error('Error re-running the review:', error);
			toast.error('Could not start the review. Please try again.');
		}
	}

	/**
	 * An undecided row is rejected (a status change, so the URL stays on file and
	 * a resubmission is caught as a duplicate); a decided one is deleted for
	 * real. Same menu slot, two different destructive actions.
	 */
	const isRejecting = $derived(
		item !== null && ['pending', 'needs_review'].includes(normalizeStatus(item.status))
	);
</script>

{#snippet statusBadge(value: string | undefined)}
	{@const normalized = normalizeStatus(value)}
	<Badge variant={STATUS_VARIANTS[normalized] ?? 'neutral'} class="whitespace-nowrap">
		{STATUS_LABELS[normalized]}
	</Badge>
{/snippet}

{#snippet verdictCell(submission: Doc<'submissions'>)}
	{@const review = submission.review}
	{#if !review}
		<span class="text-xs text-muted-foreground">—</span>
	{:else}
		<div class="flex items-center gap-2">
			<Badge
				variant={review.verdict ? VERDICT_VARIANTS[review.verdict] : 'neutral'}
				class="whitespace-nowrap"
			>
				{review.verdict ? VERDICT_LABELS[review.verdict] : 'No verdict'}
			</Badge>
			{#if review.confidence !== undefined}
				<span class="text-xs text-muted-foreground">{Math.round(review.confidence * 100)}%</span>
			{/if}
		</div>
	{/if}
{/snippet}

{#snippet sortableHead(column: SortColumn, label: string, extraClass: string)}
	{@const direction = ariaSortFor(sort, column)}
	<Table.Head aria-sort={direction} class={extraClass}>
		<button
			type="button"
			onclick={() => sortBy(column)}
			class="-ml-2 inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
			aria-label={`Sort by ${label.toLowerCase()}${
				direction === 'none' ? '' : `, currently ${direction}`
			}`}
		>
			{label}
			{#if direction === 'ascending'}
				<ArrowUpIcon class="size-3.5" aria-hidden="true" />
			{:else if direction === 'descending'}
				<ArrowDownIcon class="size-3.5" aria-hidden="true" />
			{:else}
				<ChevronsUpDownIcon class="size-3.5 opacity-50" aria-hidden="true" />
			{/if}
		</button>
	</Table.Head>
{/snippet}

<div class="flex flex-col gap-3">
	<!-- Toolbar -->
	<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
			<div class="relative">
				<Label for="submissions-search" class="sr-only">Search submissions</Label>
				<SearchIcon
					class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
					aria-hidden="true"
				/>
				<Input
					id="submissions-search"
					type="search"
					placeholder="Search name or link…"
					value={search}
					oninput={(event) => setSearch(event.currentTarget.value)}
					class="pl-8 sm:w-64"
				/>
			</div>

			<Select.Root
				type="single"
				value={status}
				onValueChange={(value) => setStatus(value as StatusFilter)}
			>
				<Select.Trigger class="sm:w-[160px]" aria-label="Filter by status">
					{statusLabels[status]}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="needs_review">Needs review</Select.Item>
					<Select.Item value="pending">Pending</Select.Item>
					<Select.Item value="completed">Completed</Select.Item>
					<Select.Item value="rejected">Rejected</Select.Item>
					<Select.Item value="all">All statuses</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>

		<p class="text-sm text-muted-foreground" aria-live="polite">
			{#if isLoading}
				Loading submissions…
			{:else if view.total === 0}
				No submissions
			{:else}
				Showing {view.rangeStart}–{view.rangeEnd} of {view.total}
				{#if view.isFiltered}
					<span>(filtered from {view.totalUnfiltered})</span>
				{/if}
			{/if}
		</p>
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Caption class="sr-only">Portfolio submissions awaiting review</Table.Caption>
			<Table.Header>
				<Table.Row>
					{@render sortableHead('name', 'Name', '')}
					<Table.Head>Link</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head class="hidden lg:table-cell">AI review</Table.Head>
					{@render sortableHead('added', 'Added', 'hidden md:table-cell')}
					<Table.Head class="w-10"><span class="sr-only">Actions</span></Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if isLoading}
					<!-- The toolbar's aria-live region announces the loading state; a
					     status div here would be invalid inside <tbody>. -->
					{#each Array.from({ length: 5 }) as _, index (index)}
						<Table.Row aria-hidden="true">
							<Table.Cell><Skeleton class="h-4 w-40" /></Table.Cell>
							<Table.Cell><Skeleton class="h-4 w-32" /></Table.Cell>
							<Table.Cell><Skeleton class="h-5 w-20 rounded-full" /></Table.Cell>
							<Table.Cell class="hidden lg:table-cell">
								<Skeleton class="h-5 w-24 rounded-full" />
							</Table.Cell>
							<Table.Cell class="hidden md:table-cell"><Skeleton class="h-4 w-24" /></Table.Cell>
							<Table.Cell><Skeleton class="h-8 w-8 rounded-md" /></Table.Cell>
						</Table.Row>
					{/each}
				{:else if errorMessage}
					<Table.Row>
						<Table.Cell colspan={COLUMN_COUNT} class="py-10 text-center text-destructive">
							{errorMessage}
						</Table.Cell>
					</Table.Row>
				{:else if view.totalUnfiltered === 0}
					<Table.Row>
						<Table.Cell colspan={COLUMN_COUNT} class="py-16 text-center text-muted-foreground">
							No submissions to review
						</Table.Cell>
					</Table.Row>
				{:else if view.total === 0}
					<Table.Row>
						<Table.Cell colspan={COLUMN_COUNT} class="py-16 text-center text-muted-foreground">
							No submissions match your filters.
							<Button variant="link" class="px-1" onclick={clearFilters}>Clear filters</Button>
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each view.rows as submission (submission._id)}
						<Table.Row>
							<Table.Cell class="font-medium">{submission.name}</Table.Cell>
							<Table.Cell>
								<a
									href={submission.link}
									target="_blank"
									rel="noopener noreferrer"
									class="inline-flex max-w-[16rem] items-center gap-1 truncate text-muted-foreground hover:text-foreground hover:underline"
								>
									<span class="truncate">{submission.link}</span>
									<ExternalLinkIcon class="size-3.5 shrink-0" aria-hidden="true" />
									<span class="sr-only">(opens in a new tab)</span>
								</a>
							</Table.Cell>
							<Table.Cell>{@render statusBadge(submission.status)}</Table.Cell>
							<Table.Cell class="hidden lg:table-cell">
								{@render verdictCell(submission)}
							</Table.Cell>
							<Table.Cell
								class="hidden text-muted-foreground md:table-cell"
								title={new Date(submission._creationTime).toISOString()}
							>
								{format(new Date(submission._creationTime), 'MMM d, yyyy')}
							</Table.Cell>
							<Table.Cell>
								<DropdownMenu.Root>
									<DropdownMenu.Trigger
										class={buttonVariants({ variant: 'ghost', size: 'icon' })}
										aria-label={`Actions for ${submission.name}`}
									>
										<EllipsisIcon class="size-4" aria-hidden="true" />
									</DropdownMenu.Trigger>
									<DropdownMenu.Content align="end">
										<DropdownMenu.Item
											onSelect={() => window.open(submission.link, '_blank', 'noopener,noreferrer')}
										>
											Open link
										</DropdownMenu.Item>
										{#if ['pending', 'needs_review'].includes(normalizeStatus(submission.status))}
											<DropdownMenu.Separator />
											<DropdownMenu.Item onSelect={() => promote(submission)}>
												Review &amp; add portfolio
											</DropdownMenu.Item>
											<DropdownMenu.Item onSelect={() => rerun(submission)}>
												Re-run AI review
											</DropdownMenu.Item>
											<DropdownMenu.Item
												class="text-destructive"
												onSelect={() => reject(submission)}
											>
												Reject
											</DropdownMenu.Item>
										{:else}
											<DropdownMenu.Separator />
											<DropdownMenu.Item
												class="text-destructive"
												onSelect={() => reject(submission)}
											>
												Delete
											</DropdownMenu.Item>
										{/if}
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</Table.Cell>
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>

	<!-- Footer -->
	{#if !isLoading && view.total > 0}
		<div class="flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between">
			<div class="flex items-center gap-2">
				<Label for="submissions-page-size" class="text-sm whitespace-nowrap text-muted-foreground">
					Rows per page
				</Label>
				<Select.Root
					type="single"
					value={String(pageSize)}
					onValueChange={(value) => setPageSize(Number(value))}
				>
					<Select.Trigger id="submissions-page-size" class="w-[80px]" aria-label="Rows per page">
						{pageSize}
					</Select.Trigger>
					<Select.Content>
						{#each PAGE_SIZES as size (size)}
							<Select.Item value={String(size)}>{size}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			{#if view.pageCount > 1}
				<!--
					One-way binding on purpose: `view.page` is the clamped truth, so
					binding would let a stale local page fight the clamp.
				-->
				<Pagination.Root
					count={view.total}
					perPage={pageSize}
					page={view.page}
					onPageChange={(next) => (page = next)}
					class="mx-0 w-auto justify-end"
				>
					{#snippet children({ pages, currentPage })}
						<Pagination.Content>
							<Pagination.Item>
								<Pagination.Previous />
							</Pagination.Item>
							{#each pages as pageItem (pageItem.key)}
								{#if pageItem.type === 'ellipsis'}
									<Pagination.Item>
										<Pagination.Ellipsis />
									</Pagination.Item>
								{:else}
									<Pagination.Item>
										<Pagination.Link page={pageItem} isActive={currentPage === pageItem.value}>
											{pageItem.value}
										</Pagination.Link>
									</Pagination.Item>
								{/if}
							{/each}
							<Pagination.Item>
								<Pagination.Next />
							</Pagination.Item>
						</Pagination.Content>
					{/snippet}
				</Pagination.Root>
			{/if}
		</div>
	{/if}
</div>

<!-- Approve: the AI's read of the site next to the form it pre-filled -->
<Dialog.Root bind:open={isPromoteOpen}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
		<Dialog.Header>
			<Dialog.Title>Add portfolio</Dialog.Title>
		</Dialog.Header>
		{#key item?._id}
			<div class="grid gap-6 md:grid-cols-2">
				{#if item}
					<AiReviewCard submission={item} />
				{/if}
				<PortfolioForm bind:open={isPromoteOpen} mode="add" {item} />
			</div>
		{/key}
	</Dialog.Content>
</Dialog.Root>

<!-- Reject (undecided) marks the row; Delete (decided) removes it for good -->
<Dialog.Root bind:open={isRejectOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{isRejecting ? 'Reject submission' : 'Delete submission'}</Dialog.Title>
			<Dialog.Description>
				{#if isRejecting}
					{item?.name ?? 'This submission'} will be marked rejected and kept on file, so the same link
					is not reviewed again.
				{:else}
					{item?.name ?? 'This submission'} will be removed permanently. This cannot be undone.
				{/if}
			</Dialog.Description>
		</Dialog.Header>
		<DeleteConfirmForm
			bind:open={isRejectOpen}
			confirmLabel={isRejecting ? 'Reject' : 'Delete'}
			pendingLabel={isRejecting ? 'Rejecting' : 'Deleting'}
			successMessage={isRejecting ? 'Submission rejected.' : 'Deleted successfully!'}
			onConfirm={() =>
				isRejecting
					? rejectSubmission({ submissionId: item!._id })
					: deleteSubmission({ submissionId: item!._id })}
		/>
	</Dialog.Content>
</Dialog.Root>
