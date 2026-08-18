/**
 * Submission-specific list logic. The search/sort/paginate pipeline lives in
 * ./table-view; this module only supplies the status dimension.
 */

import { buildView, matchesSearch, type PageView, type SortKey } from './table-view.js';

export type SubmissionStatus = 'pending' | 'completed';
export type StatusFilter = 'all' | SubmissionStatus;

export type SubmissionRow = {
	_creationTime: number;
	name: string;
	link: string;
	status?: string;
};

/**
 * The schema types status as `v.optional(v.string())`, so a row can arrive with
 * no status at all (or a typo'd one). Only 'completed' counts as done —
 * everything else still needs review, which is the safe way to be wrong: an
 * unrecognized status shows up under Pending rather than vanishing from every
 * filter.
 */
export function normalizeStatus(status: string | undefined): SubmissionStatus {
	return status?.trim().toLowerCase() === 'completed' ? 'completed' : 'pending';
}

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
