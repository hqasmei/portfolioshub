/**
 * Submission-specific list logic. The search/sort/paginate pipeline lives in
 * ./table-view; this module only supplies the status dimension.
 */

import { buildView, matchesSearch, type PageView, type SortKey } from './table-view.js';

export type SubmissionStatus = 'pending' | 'needs_review' | 'completed' | 'rejected';
export type StatusFilter = 'all' | SubmissionStatus;

export type SubmissionRow = {
	_creationTime: number;
	name: string;
	link: string;
	status?: string;
};

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

/** Statuses that still want a decision from the admin, in the order they are worked. */
export const OPEN_STATUSES: SubmissionStatus[] = ['needs_review', 'pending'];

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
	pending: 'Pending',
	needs_review: 'Needs review',
	completed: 'Completed',
	rejected: 'Rejected'
};

/** How the review pipeline's verdict is worded for the admin. */
export const VERDICT_LABELS: Record<'approve' | 'review' | 'reject', string> = {
	approve: 'Looks legit',
	review: 'Worth a look',
	reject: 'Likely junk'
};

export type SelectOptions = {
	search: string;
	status: StatusFilter;
	sort: SortKey;
	page: number;
	pageSize: number;
};

export function selectSubmissions<T extends SubmissionRow>(
	rows: readonly T[] | undefined,
	{ search, status, sort, page, pageSize }: SelectOptions
): PageView<T> {
	const needle = search.trim().toLowerCase();

	return buildView(rows, {
		predicate: (row) =>
			(status === 'all' || normalizeStatus(row.status) === status) && matchesSearch(row, needle),
		isFiltered: needle !== '' || status !== 'all',
		sort,
		page,
		pageSize
	});
}
