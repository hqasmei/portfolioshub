<script lang="ts">
	import { api } from '$convex/_generated/api';
	import type { Doc } from '$convex/_generated/dataModel';
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import SearchIcon from '@lucide/svelte/icons/search';
	import SquarePenIcon from '@lucide/svelte/icons/square-pen';
	import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';
	import { useMutation } from 'convex-svelte';
	import { format } from 'date-fns';
	import { toast } from 'svelte-sonner';
	import { MediaQuery } from 'svelte/reactivity';

	import AiReviewCard from '$lib/components/admin/ai-review-card.svelte';
	import DeleteConfirmForm from '$lib/components/admin/delete-confirm-form.svelte';
	import PortfolioForm from '$lib/components/admin/portfolio-form.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import {
		ADMIN_STATUS_FILTER_LABELS,
		ADMIN_STATUS_LABELS,
		ADMIN_STATUS_VARIANTS,
		VERDICT_LABELS,
		VERDICT_VARIANTS,
		buildAdminRows,
		selectAdminRows,
		type AdminRow,
		type AdminStatusFilter
	} from '$lib/admin/admin-rows.js';
	import {
		DEFAULT_PAGE_SIZE,
		PAGE_SIZES,
		ariaSortFor,
		toggleSort,
		type SortColumn,
		type SortKey
	} from '$lib/admin/table-view.js';

	/**
	 * The admin table: submissions and published portfolios in one list.
	 *
	 * These used to be two near-identical tables stacked on the page, which meant
	 * following one site from submission to listing took looking in two places.
	 * They are one lifecycle, so they are one table filtered by status —
	 * buildAdminRows does the folding, this component owns the view state and the
	 * dialogs.
	 *
	 * The page owns the Convex subscriptions and the admin gate, which is what
	 * keeps +page.svelte from being one long file again.
	 */
	let {
		submissions,
		portfolios,
		isLoading = false,
		errorMessage = null
	}: {
		submissions: Doc<'submissions'>[] | undefined;
		portfolios: Doc<'portfolios'>[] | undefined;
		isLoading?: boolean;
		errorMessage?: string | null;
	} = $props();

	type Row = AdminRow<Doc<'submissions'>, Doc<'portfolios'>>;

	const deleteSubmission = useMutation(api.submissions.deleteSubmission);
	const rejectSubmission = useMutation(api.submissions.rejectSubmission);
	const retryReview = useMutation(api.submissions.retryReview);
	// Yes, the Convex export really is spelled that way.
	const deletePortfolio = useMutation(api.portfolios.delelePortfolio);

	const COLUMN_COUNT = 6;

	let search = $state('');
	// The queue, not the archive: what lands here by default is the work.
	let status = $state<AdminStatusFilter>('needs-action');
	let sort = $state<SortKey>('newest');
	let page = $state(1);
	let pageSize = $state<number>(DEFAULT_PAGE_SIZE);

	let detailRow = $state<Row | null>(null);
	let isDetailOpen = $state(false);
	let confirmRow = $state<Row | null>(null);
	let isConfirmOpen = $state(false);

	// SSR-safe: reports false until mounted, so the drawer starts as the desktop
	// side panel and flips on the client if the viewport is narrow.
	const isMobile = new MediaQuery('(max-width: 768px)');

	// A scan finishing arrives on its own through Convex, but a scan *dying*
	// produces no write at all — so the running -> stalled flip needs a clock of
	// its own, or a spinner would keep promising work that stopped.
	let now = $state(Date.now());
	$effect(() => {
		const id = setInterval(() => (now = Date.now()), 30_000);
		return () => clearInterval(id);
	});

	const rows = $derived(buildAdminRows(submissions, portfolios, now));
	const view = $derived(selectAdminRows(rows, { search, status, sort, page, pageSize }));

	// Every control that changes the result set resets the page in its own
	// handler. Combined with the clamp inside selectAdminRows (which covers rows
	// disappearing underneath you), that removes any need for an $effect writing
	// back into the state it reads.
	function setSearch(value: string) {
		search = value;
		page = 1;
	}

	function setStatus(value: AdminStatusFilter) {
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
		status = 'needs-action';
		page = 1;
	}

	function openDetail(row: Row) {
		detailRow = row;
		isDetailOpen = true;
	}

	function askToConfirm(row: Row) {
		confirmRow = row;
		isConfirmOpen = true;
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
	 * Every row opens the same drawer, so the wording is the only thing that says
	 * which of the four jobs it is — the form underneath is the same either way.
	 */
	const detail = $derived.by(() => {
		const row = detailRow;
		if (row === null) return null;
		if (row.kind === 'portfolio')
			return {
				title: 'Edit portfolio',
				description: 'Changes go live on the site as soon as you submit.',
				submitLabel: 'Save changes'
			};
		if (row.status === 'incomplete')
			return {
				title: 'Finish adding',
				description: 'This was approved but its portfolio never landed. Submitting creates it.',
				submitLabel: 'Create portfolio'
			};
		if (row.status === 'rejected')
			return {
				title: 'Rejected submission',
				description: 'Rejected earlier. Submitting publishes it after all.',
				submitLabel: 'Approve anyway'
			};
		return {
			title: 'Review submission',
			description: 'What the AI made of the site, above the form it pre-filled.',
			submitLabel: 'Approve & publish'
		};
	});

	/**
	 * One destructive dialog, three destructive actions. An undecided submission
	 * is rejected (a status change, so the URL stays on file and a resubmission
	 * is caught as a duplicate); a decided one is deleted for real; a portfolio
	 * takes its stored image down with it.
	 */
	const confirmAction = $derived.by(() => {
		const row = confirmRow;
		if (row === null) return null;

		if (row.kind === 'portfolio') {
			return {
				title: 'Delete portfolio',
				description: `${row.name} and its image will be removed permanently. This cannot be undone.`,
				confirmLabel: 'Delete',
				pendingLabel: 'Deleting',
				successMessage: 'Deleted successfully!',
				run: () => deletePortfolio({ portfolioId: row.doc._id, portfolioImageId: row.doc.image })
			};
		}

		if (row.status === 'pending' || row.status === 'needs_review') {
			return {
				title: 'Reject submission',
				description: `${row.name} will be marked rejected and kept on file, so the same link is not reviewed again.`,
				confirmLabel: 'Reject',
				pendingLabel: 'Rejecting',
				successMessage: 'Submission rejected.',
				run: () => rejectSubmission({ submissionId: row.doc._id })
			};
		}

		return {
			title: 'Delete submission',
			description: `${row.name} will be removed permanently. This cannot be undone.`,
			confirmLabel: 'Delete',
			pendingLabel: 'Deleting',
			successMessage: 'Deleted successfully!',
			run: () => deleteSubmission({ submissionId: row.doc._id })
		};
	});
</script>

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
				<Label for="admin-search" class="sr-only">Search name or link</Label>
				<SearchIcon
					class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
					aria-hidden="true"
				/>
				<Input
					id="admin-search"
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
				onValueChange={(value) => setStatus(value as AdminStatusFilter)}
			>
				<Select.Trigger class="sm:w-[170px]" aria-label="Filter by status">
					{ADMIN_STATUS_FILTER_LABELS[status]}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="needs-action">Needs action</Select.Item>
					<Select.Item value="needs_review">Needs review</Select.Item>
					<Select.Item value="pending">Pending</Select.Item>
					<Select.Item value="published">Published</Select.Item>
					<Select.Item value="incomplete">Incomplete</Select.Item>
					<Select.Item value="rejected">Rejected</Select.Item>
					<Select.Separator />
					<Select.Item value="all">All statuses</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>

		<p class="text-sm text-muted-foreground" aria-live="polite">
			{#if isLoading}
				Loading…
			{:else if view.total === 0}
				Nothing to show
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
			<Table.Caption class="sr-only">Submissions and published portfolios</Table.Caption>
			<Table.Header>
				<Table.Row>
					{@render sortableHead('name', 'Name', '')}
					<Table.Head>Link</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head class="hidden lg:table-cell">AI review</Table.Head>
					{@render sortableHead('added', 'Added', 'hidden md:table-cell')}
					<Table.Head class="w-24">Actions</Table.Head>
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
							<Table.Cell><Skeleton class="h-8 w-16 rounded-md" /></Table.Cell>
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
							Nothing here yet
						</Table.Cell>
					</Table.Row>
				{:else if view.total === 0}
					<Table.Row>
						<Table.Cell colspan={COLUMN_COUNT} class="py-16 text-center text-muted-foreground">
							No rows match your filters.
							<Button variant="link" class="px-1" onclick={clearFilters}>Clear filters</Button>
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each view.rows as row (row.key)}
						<Table.Row>
							<Table.Cell class="font-medium">{row.name}</Table.Cell>
							<Table.Cell>
								<a
									href={row.link}
									target="_blank"
									rel="noopener noreferrer"
									class="inline-flex max-w-[16rem] items-center gap-1 truncate text-muted-foreground hover:text-foreground hover:underline"
								>
									<span class="truncate">{row.link}</span>
									<ExternalLinkIcon class="size-3.5 shrink-0" aria-hidden="true" />
									<span class="sr-only">(opens in a new tab)</span>
								</a>
							</Table.Cell>
							<Table.Cell>
								<!--
									The scan states get the badge rather than the AI review column,
									which is hidden below lg — a row being worked on has to be
									visible at every width.
								-->
								{#if row.scan === 'running'}
									<Badge variant="info" class="whitespace-nowrap">
										<Loader2Icon class="mr-1 size-3 animate-spin" aria-hidden="true" />
										Scanning
									</Badge>
								{:else if row.scan === 'stalled'}
									<Badge variant="danger" class="whitespace-nowrap">
										<TriangleAlertIcon class="mr-1 size-3" aria-hidden="true" />
										Stalled
									</Badge>
								{:else}
									<Badge variant={ADMIN_STATUS_VARIANTS[row.status]} class="whitespace-nowrap">
										{ADMIN_STATUS_LABELS[row.status]}
									</Badge>
								{/if}
							</Table.Cell>
							<Table.Cell class="hidden lg:table-cell">
								{#if row.scan === 'running'}
									<span class="flex items-center gap-2 text-xs text-muted-foreground">
										<Loader2Icon class="size-3.5 animate-spin" aria-hidden="true" />
										Reviewing this site…
									</span>
								{:else if row.scan === 'stalled'}
									<span class="text-xs text-muted-foreground"> Never finished — try Rescan </span>
								{:else if row.kind === 'submission'}
									{@render verdictCell(row.doc)}
								{:else}
									<span class="text-xs text-muted-foreground">—</span>
								{/if}
							</Table.Cell>
							<Table.Cell
								class="hidden text-muted-foreground md:table-cell"
								title={new Date(row._creationTime).toISOString()}
							>
								{format(new Date(row._creationTime), 'MMM d, yyyy')}
							</Table.Cell>
							<Table.Cell>
								<div class="flex items-center gap-1">
									<!--
										Every row gets the same first action: open it and look. What
										that means differs by row, so only the label does.
									-->
									<Button
										variant="ghost"
										size="icon"
										onclick={() => openDetail(row)}
										aria-label={row.kind === 'portfolio'
											? `Edit ${row.name}`
											: `Review ${row.name}`}
									>
										<SquarePenIcon class="size-4" aria-hidden="true" />
									</Button>

									<DropdownMenu.Root>
										<DropdownMenu.Trigger
											class={buttonVariants({ variant: 'ghost', size: 'icon' })}
											aria-label={`More actions for ${row.name}`}
										>
											<EllipsisIcon class="size-4" aria-hidden="true" />
										</DropdownMenu.Trigger>
										<DropdownMenu.Content align="end">
											{#if row.kind === 'submission' && (row.status === 'pending' || row.status === 'needs_review')}
												<DropdownMenu.Item onSelect={() => rerun(row.doc)}>
													{row.doc.review ? 'Rescan' : 'Scan'}
												</DropdownMenu.Item>
												<DropdownMenu.Item
													class="text-destructive"
													onSelect={() => askToConfirm(row)}
												>
													Reject
												</DropdownMenu.Item>
											{:else if row.kind === 'submission' && row.status === 'rejected'}
												<DropdownMenu.Item onSelect={() => rerun(row.doc)}>Rescan</DropdownMenu.Item
												>
												<DropdownMenu.Item
													class="text-destructive"
													onSelect={() => askToConfirm(row)}
												>
													Delete
												</DropdownMenu.Item>
											{:else}
												<DropdownMenu.Item
													class="text-destructive"
													onSelect={() => askToConfirm(row)}
												>
													Delete
												</DropdownMenu.Item>
											{/if}
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								</div>
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
				<Label for="admin-page-size" class="text-sm whitespace-nowrap text-muted-foreground">
					Rows per page
				</Label>
				<Select.Root
					type="single"
					value={String(pageSize)}
					onValueChange={(value) => setPageSize(Number(value))}
				>
					<Select.Trigger id="admin-page-size" class="w-[80px]" aria-label="Rows per page">
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

<!--
	Every row opens this one drawer. A drawer rather than a dialog: editing is
	done against the table, and a panel that slides in from the side leaves the
	row you came from visible. On a narrow screen there is no side to slide from,
	so it comes up from the bottom as a sheet instead.

	A submission and a portfolio differ in which mutation the form runs, not in
	what the admin wants to look at — so they share the panel, and a submission
	gets the AI's evidence stacked above the same form.
-->
<Drawer.Root bind:open={isDetailOpen} direction={isMobile.current ? 'bottom' : 'right'}>
	<Drawer.Content class="data-[vaul-drawer-direction=right]:sm:max-w-xl">
		<Drawer.Header class="text-left">
			<Drawer.Title>{detail?.title ?? ''}</Drawer.Title>
			<Drawer.Description>{detail?.description ?? ''}</Drawer.Description>
		</Drawer.Header>
		<!-- The form is taller than a phone, so the body scrolls and the header stays put. -->
		<div class="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
			<!-- Remount per row, so a half-edited form never carries into the next one. -->
			{#key detailRow?.key}
				<div class="flex flex-col gap-6">
					{#if detailRow?.kind === 'submission'}
						<AiReviewCard submission={detailRow.doc} />
						<PortfolioForm
							bind:open={isDetailOpen}
							mode="add"
							item={detailRow.doc}
							submitLabel={detail?.submitLabel ?? 'Approve & publish'}
						/>
					{:else if detailRow}
						<PortfolioForm
							bind:open={isDetailOpen}
							mode="edit"
							item={detailRow.doc}
							submitLabel={detail?.submitLabel ?? 'Save changes'}
						/>
					{/if}
				</div>
			{/key}
		</div>
	</Drawer.Content>
</Drawer.Root>

<!-- Reject (undecided) marks the row; Delete removes it for good -->
<Dialog.Root bind:open={isConfirmOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{confirmAction?.title ?? 'Delete'}</Dialog.Title>
			<Dialog.Description>{confirmAction?.description ?? ''}</Dialog.Description>
		</Dialog.Header>
		<DeleteConfirmForm
			bind:open={isConfirmOpen}
			confirmLabel={confirmAction?.confirmLabel ?? 'Delete'}
			pendingLabel={confirmAction?.pendingLabel ?? 'Deleting'}
			successMessage={confirmAction?.successMessage ?? 'Deleted successfully!'}
			onConfirm={() => confirmAction!.run()}
		/>
	</Dialog.Content>
</Dialog.Root>
