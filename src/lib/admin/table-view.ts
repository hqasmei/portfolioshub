/**
 * Shared, pure list logic for the admin tables.
 *
 * Both admin tables (submissions and portfolios) need the same
 * search -> filter -> sort -> paginate pipeline over rows that have a name, a
 * link and a creation time. Only the filter predicate differs, so that is the
 * one thing callers supply.
 *
 * Kept free of Svelte/Convex imports so it runs under vitest's `node`
 * environment, which is the only place this project can test anything.
 */

export const PAGE_SIZES = [10, 25, 50] as const;
export const DEFAULT_PAGE_SIZE = 25;

export type SortColumn = 'name' | 'added';
export type SortKey = 'newest' | 'oldest' | 'name-asc' | 'name-desc';

/** The shape this module needs. Convex `Doc<'submissions'>`/`Doc<'portfolios'>` both satisfy it. */
export type NamedRow = {
	_creationTime: number;
	name: string;
	link: string;
};

export function matchesSearch(row: NamedRow, needle: string): boolean {
	if (needle === '') return true;
	return row.name.toLowerCase().includes(needle) || row.link.toLowerCase().includes(needle);
}

const comparators: Record<SortKey, (a: NamedRow, b: NamedRow) => number> = {
	newest: (a, b) => b._creationTime - a._creationTime,
	oldest: (a, b) => a._creationTime - b._creationTime,
	// Tie-break on creation time so equal names keep a stable order across pages.
	'name-asc': (a, b) =>
		a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) ||
		b._creationTime - a._creationTime,
	'name-desc': (a, b) =>
		b.name.localeCompare(a.name, undefined, { sensitivity: 'base' }) ||
		b._creationTime - a._creationTime
};

export type PageView<T> = {
	/** The rows for the current page. */
	rows: T[];
	/** How many rows matched the filters, across all pages. */
	total: number;
	/** How many rows exist before any filtering — drives "nothing exists" vs "nothing matches". */
	totalUnfiltered: number;
	isFiltered: boolean;
	/** The requested page, clamped into range — see below. */
	page: number;
	pageCount: number;
	/** 1-based inclusive range of the current page; both 0 when there are no rows. */
	rangeStart: number;
	rangeEnd: number;
};

export type BuildViewOptions<T> = {
	predicate: (row: T) => boolean;
	/** Whether any filter is actually narrowing the list, for the "filtered from N" label. */
	isFiltered: boolean;
	sort: SortKey;
	page: number;
	pageSize: number;
};

/**
 * Filter -> sort -> paginate, in one pass. Never mutates its input.
 *
 * The returned `page` is the *clamped* page. That is what makes "narrowing the
 * filter drops you back to a valid page" fall out of the derivation, instead of
 * needing an effect that writes back into the state it reads. It also covers the
 * data-driven case: deleting the last row on the last page.
 *
 * `all` accepts `undefined` so the loading state can call it without a branch.
 */
export function buildView<T extends NamedRow>(
	all: readonly T[] | undefined,
	{ predicate, isFiltered, sort, page, pageSize }: BuildViewOptions<T>
): PageView<T> {
	const source = all ?? [];
	const sorted = source.filter(predicate).sort(comparators[sort]);

	const size = Math.max(1, Math.trunc(pageSize) || DEFAULT_PAGE_SIZE);
	const pageCount = Math.max(1, Math.ceil(sorted.length / size));
	const current = Math.min(Math.max(1, Math.trunc(page) || 1), pageCount);
	const start = (current - 1) * size;
	const pageRows = sorted.slice(start, start + size);

	return {
		rows: pageRows,
		total: sorted.length,
		totalUnfiltered: source.length,
		isFiltered,
		page: current,
		pageCount,
		rangeStart: pageRows.length === 0 ? 0 : start + 1,
		rangeEnd: start + pageRows.length
	};
}

/** Clicking a sortable header flips that column's direction. */
export function toggleSort(current: SortKey, column: SortColumn): SortKey {
	if (column === 'added') return current === 'newest' ? 'oldest' : 'newest';
	return current === 'name-asc' ? 'name-desc' : 'name-asc';
}

export function ariaSortFor(
	current: SortKey,
	column: SortColumn
): 'ascending' | 'descending' | 'none' {
	if (column === 'added') {
		if (current === 'newest') return 'descending';
		if (current === 'oldest') return 'ascending';
		return 'none';
	}
	if (current === 'name-asc') return 'ascending';
	if (current === 'name-desc') return 'descending';
	return 'none';
}
