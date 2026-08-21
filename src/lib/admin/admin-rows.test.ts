import { describe, expect, it } from 'vitest';

import {
	SCAN_STALE_AFTER_MS,
	buildAdminRows,
	normalizeStatus,
	selectAdminRows,
	type AdminRow,
	type PortfolioLike,
	type SubmissionLike
} from './admin-rows';
import type { SortKey } from './table-view';

const defaults = {
	search: '',
	status: 'all' as const,
	sort: 'newest' as SortKey,
	page: 1,
	pageSize: 25
};

let nextId = 0;

function submission(name: string, over: Partial<SubmissionLike> = {}): SubmissionLike {
	return {
		_id: `sub${nextId++}`,
		name,
		link: `https://${name.toLowerCase().replace(/\s/g, '')}.com`,
		_creationTime: 1_000,
		status: 'pending',
		...over
	};
}

function portfolio(name: string, over: Partial<PortfolioLike> = {}): PortfolioLike {
	return {
		_id: `port${nextId++}`,
		name,
		link: `https://${name.toLowerCase().replace(/\s/g, '')}.com`,
		_creationTime: 1_000,
		...over
	};
}

/** The common case in these tests: rows built from submissions alone. */
function rowsOf(subs: SubmissionLike[], ports: PortfolioLike[] = []) {
	return buildAdminRows(subs, ports);
}

function names(view: { rows: AdminRow<SubmissionLike, PortfolioLike>[] }) {
	return view.rows.map((row) => row.name);
}

function manySubmissions(n: number): SubmissionLike[] {
	return Array.from({ length: n }, (_, i) => submission(`User ${i}`, { _creationTime: i }));
}

describe('normalizeStatus', () => {
	// The schema is `v.optional(v.string())`, so all of these can reach the client.
	it('treats a missing status as pending', () => {
		expect(normalizeStatus(undefined)).toBe('pending');
	});

	it('treats an unrecognized status as pending rather than dropping the row', () => {
		expect(normalizeStatus('archived')).toBe('pending');
		expect(normalizeStatus('')).toBe('pending');
	});

	it('reports the transient reviewing state as pending', () => {
		expect(normalizeStatus('reviewing')).toBe('pending');
	});

	it('recognizes completed regardless of case or padding', () => {
		expect(normalizeStatus('completed')).toBe('completed');
		expect(normalizeStatus('  COMPLETED ')).toBe('completed');
	});
});

describe('buildAdminRows', () => {
	it('waits for both lists before deciding anything', () => {
		// Otherwise every approved submission would briefly render as Incomplete.
		expect(buildAdminRows(undefined, [portfolio('A')])).toEqual([]);
		expect(buildAdminRows([submission('A')], undefined)).toEqual([]);
		expect(buildAdminRows(undefined, undefined)).toEqual([]);
	});

	it('collapses an approved submission and its portfolio into one published row', () => {
		const rows = rowsOf(
			[submission('Jane', { status: 'completed', link: 'https://jane.com' })],
			[portfolio('Jane', { link: 'https://jane.com' })]
		);

		expect(rows).toHaveLength(1);
		expect(rows[0]).toMatchObject({ kind: 'portfolio', status: 'published', name: 'Jane' });
	});

	it('matches on the normalized link, not the raw one', () => {
		const rows = rowsOf(
			[submission('Jane', { status: 'completed', link: 'http://WWW.Jane.com/?ref=x' })],
			[portfolio('Jane', { link: 'https://jane.com/' })]
		);

		expect(rows).toHaveLength(1);
		expect(rows[0].kind).toBe('portfolio');
	});

	it('ignores a stale normalizedLink on the submission', () => {
		// updateSubmission patches `link` without recomputing `normalizedLink`, so
		// the stored value is exactly what goes wrong when an admin edits the link
		// while approving. The match has to key on the live link.
		const stale = {
			...submission('Jane', { status: 'completed', link: 'https://jane.dev' }),
			normalizedLink: 'old-typo.com'
		};
		const rows = rowsOf([stale], [portfolio('Jane', { link: 'https://jane.dev' })]);

		expect(rows).toHaveLength(1);
		expect(rows[0].kind).toBe('portfolio');
	});

	it('flags a completed submission with no portfolio as incomplete', () => {
		const rows = rowsOf(
			[submission('Ghost', { status: 'completed' })],
			[portfolio('Someone else')]
		);

		const ghost = rows.find((row) => row.name === 'Ghost');
		expect(ghost).toMatchObject({ kind: 'submission', status: 'incomplete' });
	});

	it('carries the open statuses through unchanged', () => {
		const rows = rowsOf([
			submission('A', { status: 'pending' }),
			submission('B', { status: 'needs_review' }),
			submission('C', { status: 'rejected' })
		]);

		expect(rows.map((row) => row.status)).toEqual(['pending', 'needs_review', 'rejected']);
	});

	it('keys rows per table so ids cannot collide across them', () => {
		const rows = rowsOf([submission('A', { _id: 'shared' })], [portfolio('B', { _id: 'shared' })]);
		expect(new Set(rows.map((row) => row.key)).size).toBe(2);
	});

	it('keeps the underlying document on the row', () => {
		const sub = submission('A');
		const port = portfolio('B');
		const rows = rowsOf([sub], [port]);

		expect(rows.find((row) => row.kind === 'submission')?.doc).toBe(sub);
		expect(rows.find((row) => row.kind === 'portfolio')?.doc).toBe(port);
	});
});

describe('buildAdminRows scan state', () => {
	const NOW = 1_700_000_000_000;

	function scanOf(over: Partial<SubmissionLike>) {
		const rows = buildAdminRows([submission('A', over)], [], NOW);
		return rows[0].scan;
	}

	it('reports a freshly queued row as running', () => {
		expect(scanOf({ status: 'pending', reviewStartedAt: NOW - 5_000 })).toBe('running');
	});

	it('reports a row the pipeline picked up as running', () => {
		// 'reviewing' normalizes into pending, so it lands in the same branch.
		expect(scanOf({ status: 'reviewing', reviewStartedAt: NOW - 5_000 })).toBe('running');
	});

	it('reports a scan past the cutoff as stalled rather than spinning forever', () => {
		expect(scanOf({ status: 'pending', reviewStartedAt: NOW - SCAN_STALE_AFTER_MS - 1 })).toBe(
			'stalled'
		);
	});

	it('measures from reviewStartedAt, so a rescan of an old row is not stale on arrival', () => {
		expect(
			scanOf({
				status: 'pending',
				_creationTime: NOW - 30 * 24 * 3600_000,
				reviewStartedAt: NOW - 1_000
			})
		).toBe('running');
	});

	it('falls back to creation time for rows predating the field', () => {
		expect(scanOf({ status: 'pending', _creationTime: NOW - 73 * 3600_000 })).toBe('stalled');
	});

	it('is idle once the review has landed, whatever the verdict', () => {
		expect(scanOf({ status: 'needs_review', reviewStartedAt: NOW })).toBe('idle');
		expect(scanOf({ status: 'rejected', reviewStartedAt: NOW })).toBe('idle');
	});

	it('is idle for portfolios, which the pipeline never touches', () => {
		const rows = buildAdminRows([], [portfolio('P')], NOW);
		expect(rows[0].scan).toBe('idle');
	});
});

describe('selectAdminRows filtering', () => {
	it('returns everything when the status filter is all', () => {
		const rows = rowsOf([submission('A')], [portfolio('B')]);
		expect(selectAdminRows(rows, defaults).total).toBe(2);
	});

	it('selects exactly the open submissions for needs-action', () => {
		const rows = rowsOf(
			[
				submission('Pending one', { status: 'pending' }),
				submission('Review one', { status: 'needs_review' }),
				submission('Rejected one', { status: 'rejected' })
			],
			[portfolio('Published one')]
		);

		const view = selectAdminRows(rows, { ...defaults, status: 'needs-action' });
		expect(names(view).sort()).toEqual(['Pending one', 'Review one']);
	});

	it('counts status-less submissions as pending', () => {
		const rows = rowsOf([
			submission('A', { status: undefined }),
			submission('B', { status: 'rejected' })
		]);
		expect(names(selectAdminRows(rows, { ...defaults, status: 'pending' }))).toEqual(['A']);
	});

	it('filters to published portfolios only', () => {
		const rows = rowsOf([submission('A')], [portfolio('B'), portfolio('C')]);
		expect(names(selectAdminRows(rows, { ...defaults, status: 'published' })).sort()).toEqual([
			'B',
			'C'
		]);
	});

	it('matches the search against name and link, case-insensitively', () => {
		const rows = rowsOf([
			submission('Jane Doe'),
			submission('Sam', { link: 'https://JANE-fan.dev' })
		]);
		expect(selectAdminRows(rows, { ...defaults, search: 'jane' }).total).toBe(2);
	});

	it('ignores surrounding whitespace in the search', () => {
		expect(
			selectAdminRows(rowsOf([submission('Jane')]), { ...defaults, search: '  jane  ' }).total
		).toBe(1);
	});

	it('composes filter and search with AND, not OR', () => {
		const rows = rowsOf([submission('Jane')], [portfolio('Jane Two'), portfolio('Other')]);
		const view = selectAdminRows(rows, { ...defaults, search: 'jane', status: 'published' });
		expect(names(view)).toEqual(['Jane Two']);
	});

	it('reports isFiltered only when a filter is actually applied', () => {
		const rows = rowsOf([submission('A')]);
		expect(selectAdminRows(rows, defaults).isFiltered).toBe(false);
		expect(selectAdminRows(rows, { ...defaults, search: 'a' }).isFiltered).toBe(true);
		expect(selectAdminRows(rows, { ...defaults, status: 'pending' }).isFiltered).toBe(true);
		expect(selectAdminRows(rows, { ...defaults, status: 'needs-action' }).isFiltered).toBe(true);
	});

	it('keeps totalUnfiltered at the pre-filter count', () => {
		const view = selectAdminRows(rowsOf(manySubmissions(5)), { ...defaults, search: 'User 1' });
		expect(view.total).toBe(1);
		expect(view.totalUnfiltered).toBe(5);
	});
});

describe('selectAdminRows sorting', () => {
	const input = () =>
		rowsOf([
			submission('Beta', { _creationTime: 200 }),
			submission('alpha', { _creationTime: 100 }),
			submission('Gamma', { _creationTime: 300 })
		]);

	it('orders newest and oldest by creation time', () => {
		expect(names(selectAdminRows(input(), { ...defaults, sort: 'newest' }))).toEqual([
			'Gamma',
			'Beta',
			'alpha'
		]);
		expect(names(selectAdminRows(input(), { ...defaults, sort: 'oldest' }))).toEqual([
			'alpha',
			'Beta',
			'Gamma'
		]);
	});

	it('sorts by name case-insensitively in both directions', () => {
		expect(names(selectAdminRows(input(), { ...defaults, sort: 'name-asc' }))).toEqual([
			'alpha',
			'Beta',
			'Gamma'
		]);
		expect(names(selectAdminRows(input(), { ...defaults, sort: 'name-desc' }))).toEqual([
			'Gamma',
			'Beta',
			'alpha'
		]);
	});

	it('interleaves submissions and portfolios by the sort, not by kind', () => {
		const rows = rowsOf(
			[submission('Sub', { _creationTime: 200 })],
			[
				portfolio('Older port', { _creationTime: 100 }),
				portfolio('Newer port', { _creationTime: 300 })
			]
		);
		expect(names(selectAdminRows(rows, { ...defaults, sort: 'newest' }))).toEqual([
			'Newer port',
			'Sub',
			'Older port'
		]);
	});

	it('breaks name ties on creation time so paging stays deterministic', () => {
		const rows = rowsOf([
			submission('Same', { _creationTime: 1 }),
			submission('Same', { _creationTime: 2 })
		]);
		expect(
			selectAdminRows(rows, { ...defaults, sort: 'name-asc' }).rows.map((r) => r._creationTime)
		).toEqual([2, 1]);
	});

	it('does not mutate the input array', () => {
		const rows = rowsOf([
			submission('B', { _creationTime: 1 }),
			submission('A', { _creationTime: 2 })
		]);
		const snapshot = rows.map((r) => r.name);
		selectAdminRows(rows, { ...defaults, sort: 'name-asc' });
		expect(rows.map((r) => r.name)).toEqual(snapshot);
	});
});

describe('selectAdminRows pagination', () => {
	it('slices to the requested page', () => {
		const view = selectAdminRows(rowsOf(manySubmissions(25)), {
			...defaults,
			sort: 'oldest',
			page: 2,
			pageSize: 10
		});
		expect(names(view)).toEqual([
			'User 10',
			'User 11',
			'User 12',
			'User 13',
			'User 14',
			'User 15',
			'User 16',
			'User 17',
			'User 18',
			'User 19'
		]);
		expect(view.rangeStart).toBe(11);
		expect(view.rangeEnd).toBe(20);
		expect(view.pageCount).toBe(3);
	});

	it('leaves the last page short rather than padding it', () => {
		const view = selectAdminRows(rowsOf(manySubmissions(25)), {
			...defaults,
			page: 3,
			pageSize: 10
		});
		expect(view.rows).toHaveLength(5);
		expect(view.rangeEnd).toBe(25);
	});

	// This is what replaces an $effect that would otherwise write page back to 1.
	it('clamps an out-of-range page down to the last page', () => {
		const view = selectAdminRows(rowsOf(manySubmissions(12)), {
			...defaults,
			page: 9,
			pageSize: 10
		});
		expect(view.page).toBe(2);
		expect(view.rows).toHaveLength(2);
	});

	it('clamps when a filter narrows the result below the current page', () => {
		const view = selectAdminRows(rowsOf(manySubmissions(30)), {
			...defaults,
			search: 'User 7',
			page: 3,
			pageSize: 10
		});
		expect(view.page).toBe(1);
		expect(view.total).toBe(1);
	});

	it('returns an empty view for no rows', () => {
		expect(selectAdminRows([], defaults)).toMatchObject({
			rows: [],
			total: 0,
			pageCount: 1,
			page: 1,
			rangeStart: 0,
			rangeEnd: 0
		});
	});

	it('treats undefined rows (still loading) as empty', () => {
		expect(selectAdminRows(undefined, defaults).totalUnfiltered).toBe(0);
	});

	it('coerces a zero page size instead of dividing by zero', () => {
		const view = selectAdminRows(rowsOf(manySubmissions(3)), { ...defaults, pageSize: 0 });
		expect(view.pageCount).toBe(1);
		expect(view.rows).toHaveLength(3);
	});
});
