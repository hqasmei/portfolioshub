/**
 * The admin table's row model.
 *
 * `submissions` and `portfolios` are two separate Convex tables with no foreign
 * key between them: approving a submission flips it to `completed` *and*
 * inserts a portfolio (see portfolio-form.svelte). The admin, though, is
 * looking at one thing moving through one lifecycle:
 *
 *   pending -> needs_review -> published   (a portfolio doc)
 *                           \> rejected
 *
 * So this module folds both tables into a single row list, keyed on the URL.
 * The search/sort/paginate pipeline itself lives in ./table-view.
 *
 * Kept free of Svelte imports so it runs under vitest's `node` environment.
 * `normalizeLink` is a pure helper — importing it rather than re-deriving the
 * canonical form is deliberate: the client-side match and the backend's
 * duplicate check (convex/portfolios.ts) have to agree.
 */

import { normalizeLink } from '$convex/reviewLogic.js';

import { buildView, matchesSearch, type PageView, type SortKey } from './table-view.js';

export type SubmissionStatus = 'pending' | 'needs_review' | 'completed' | 'rejected';

const KNOWN: SubmissionStatus[] = ['pending', 'needs_review', 'completed', 'rejected'];

/**
 * The schema types status as `v.optional(v.string())`, so a row can arrive with
 * no status at all (or a typo'd one) — and rows created before the AI review
 * pipeline only ever carried 'pending' or 'completed'.
 *
 * Anything unrecognized, including the transient 'reviewing', is reported as
 * pending. That is the safe way to be wrong: an unknown status shows up in the
 * queue rather than vanishing from every filter.
 */
export function normalizeStatus(status: string | undefined): SubmissionStatus {
	const value = status?.trim().toLowerCase();
	return KNOWN.find((known) => known === value) ?? 'pending';
}

/**
 * What a row is, from the admin's point of view.
 *
 * 'published' is a portfolio. 'incomplete' has no equivalent in either table:
 * it is a submission marked `completed` whose portfolio is missing, which is
 * what the non-transactional approve flow leaves behind if the insert fails
 * after the status patch. Surfacing it beats hiding it.
 */
export type AdminStatus = 'pending' | 'needs_review' | 'published' | 'rejected' | 'incomplete';

/** 'needs-action' is the default view: everything still waiting on the admin. */
export type AdminStatusFilter = 'all' | 'needs-action' | AdminStatus;

export const ADMIN_STATUS_LABELS: Record<AdminStatus, string> = {
	pending: 'Scanning',
	needs_review: 'Needs review',
	published: 'Published',
	rejected: 'Rejected',
	incomplete: 'Incomplete'
};

/** The badge tint each status carries, alongside its label. */
export const ADMIN_STATUS_VARIANTS: Record<
	AdminStatus,
	'warning' | 'info' | 'success' | 'neutral' | 'danger'
> = {
	pending: 'warning',
	needs_review: 'info',
	published: 'success',
	rejected: 'neutral',
	incomplete: 'danger'
};

/**
 * Whether the AI review pipeline is currently working on a row.
 *
 * A submission sits in 'pending' from the moment it is queued until saveReview
 * lands, which is normally seconds — but a run that dies before writing back
 * leaves the row there forever, with nothing in the system to retry it. So a
 * spinner alone would be a lie. 'stalled' is that dead-scan case, surfaced
 * rather than spun.
 */
export type ScanState = 'idle' | 'running' | 'stalled';

/**
 * How long a scan may run before the table stops claiming it is working. A real
 * review is a headless render plus a model call — well under a minute — so ten
 * minutes is generous enough that a row only crosses it when something broke.
 */
export const SCAN_STALE_AFTER_MS = 10 * 60 * 1000;

export const ADMIN_STATUS_FILTER_LABELS: Record<AdminStatusFilter, string> = {
	'needs-action': 'Needs action',
	all: 'All statuses',
	...ADMIN_STATUS_LABELS
};

/** How the review pipeline's verdict is worded for the admin. */
export const VERDICT_LABELS: Record<'approve' | 'review' | 'reject', string> = {
	approve: 'Looks legit',
	review: 'Worth a look',
	reject: 'Likely junk'
};

export const VERDICT_VARIANTS: Record<
	'approve' | 'review' | 'reject',
	'success' | 'warning' | 'danger'
> = {
	approve: 'success',
	review: 'warning',
	reject: 'danger'
};

/**
 * The shapes this module needs. `Doc<'submissions'>` and `Doc<'portfolios'>`
 * both satisfy them structurally, which is what keeps the Convex types out of
 * here.
 */
export type SubmissionLike = {
	_id: string;
	_creationTime: number;
	name: string;
	link: string;
	status?: string;
	reviewStartedAt?: number;
};

export type PortfolioLike = {
	_id: string;
	_creationTime: number;
	name: string;
	link: string;
};

/**
 * One row of the merged table. Discriminated on `kind` so the action menu can
 * narrow to the right document without a cast.
 */
export type AdminRow<S = SubmissionLike, P = PortfolioLike> =
	| {
			kind: 'submission';
			/** `{#each}` key — an `_id` alone can collide across the two tables. */
			key: string;
			_creationTime: number;
			name: string;
			link: string;
			status: Exclude<AdminStatus, 'published'>;
			/** Live state of the AI review pipeline for this row. */
			scan: ScanState;
			doc: S;
	  }
	| {
			kind: 'portfolio';
			key: string;
			_creationTime: number;
			name: string;
			link: string;
			status: 'published';
			scan: 'idle';
			doc: P;
	  };

/**
 * Only a row still waiting on the pipeline can be scanning, and 'pending' is
 * the only status that means that ('reviewing' normalizes into it).
 *
 * Rows predating this field fall back to `_creationTime`, which for anything
 * genuinely stuck is old enough to read as stalled — the right answer for them.
 */
function scanState(submission: SubmissionLike, status: SubmissionStatus, now: number): ScanState {
	if (status !== 'pending') return 'idle';
	const startedAt = submission.reviewStartedAt ?? submission._creationTime;
	return now - startedAt < SCAN_STALE_AFTER_MS ? 'running' : 'stalled';
}

/**
 * Fold the two tables into one row list.
 *
 * A `completed` submission and its portfolio are the same site, so only the
 * portfolio is emitted — it is the live record, and the one with an Edit
 * action. The match is on the normalized link rather than the submission's
 * stored `normalizedLink`, which `updateSubmission` does not recompute and so
 * goes stale exactly when the admin edits the link while approving.
 *
 * Returns `[]` unless *both* lists have loaded. Half-loaded data would render
 * every approved submission as 'incomplete', which is alarming and wrong;
 * making that unrepresentable here beats trusting the caller's loading flag.
 *
 * `now` is a parameter so the running/stalled cut is testable, and so the
 * caller can tick it and have a stuck row correct itself without a reload.
 */
export function buildAdminRows<S extends SubmissionLike, P extends PortfolioLike>(
	submissions: readonly S[] | undefined,
	portfolios: readonly P[] | undefined,
	now: number = Date.now()
): AdminRow<S, P>[] {
	if (submissions === undefined || portfolios === undefined) return [];

	const published = new Set(portfolios.map((portfolio) => normalizeLink(portfolio.link)));

	const rows: AdminRow<S, P>[] = portfolios.map((portfolio) => ({
		kind: 'portfolio',
		key: `p:${portfolio._id}`,
		_creationTime: portfolio._creationTime,
		name: portfolio.name,
		link: portfolio.link,
		status: 'published',
		scan: 'idle',
		doc: portfolio
	}));

	for (const submission of submissions) {
		const status = normalizeStatus(submission.status);
		if (status === 'completed' && published.has(normalizeLink(submission.link))) continue;

		rows.push({
			kind: 'submission',
			key: `s:${submission._id}`,
			_creationTime: submission._creationTime,
			name: submission.name,
			link: submission.link,
			status: status === 'completed' ? 'incomplete' : status,
			scan: scanState(submission, status, now),
			doc: submission
		});
	}

	return rows;
}

function matchesStatus(status: AdminStatus, filter: AdminStatusFilter): boolean {
	if (filter === 'all') return true;
	if (filter === 'needs-action') return status === 'pending' || status === 'needs_review';
	return status === filter;
}

export type SelectAdminOptions = {
	search: string;
	status: AdminStatusFilter;
	sort: SortKey;
	page: number;
	pageSize: number;
};

export function selectAdminRows<S, P>(
	rows: readonly AdminRow<S, P>[] | undefined,
	{ search, status, sort, page, pageSize }: SelectAdminOptions
): PageView<AdminRow<S, P>> {
	const needle = search.trim().toLowerCase();

	return buildView(rows, {
		predicate: (row) => matchesStatus(row.status, status) && matchesSearch(row, needle),
		isFiltered: needle !== '' || status !== 'all',
		sort,
		page,
		pageSize
	});
}
