import { describe, expect, it } from 'vitest';

import { normalizeStatus, selectSubmissions, type SubmissionRow } from './submissions-filter';
import type { SortKey } from './table-view';

const defaults = {
	search: '',
	status: 'all' as const,
	sort: 'newest' as SortKey,
	page: 1,
	pageSize: 25
};

function row(name: string, over: Partial<SubmissionRow> = {}): SubmissionRow {
	return {
		name,
		link: `https://${name.toLowerCase().replace(/\s/g, '')}.com`,
		_creationTime: 1_000,
		status: 'pending',
		...over
	};
}

function rows(n: number): SubmissionRow[] {
	return Array.from({ length: n }, (_, i) => row(`User ${i}`, { _creationTime: i }));
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

	it('recognizes completed regardless of case or padding', () => {
		expect(normalizeStatus('completed')).toBe('completed');
		expect(normalizeStatus('  COMPLETED ')).toBe('completed');
	});
});

describe('selectSubmissions filtering', () => {
	it('returns everything when the status filter is all', () => {
		const input = [row('A'), row('B', { status: 'completed' })];
		expect(selectSubmissions(input, defaults).total).toBe(2);
	});

	it('counts status-less rows as pending', () => {
		const input = [row('A', { status: undefined }), row('B', { status: 'completed' })];
		const view = selectSubmissions(input, { ...defaults, status: 'pending' });
		expect(view.rows.map((r) => r.name)).toEqual(['A']);
	});

	it('matches the search against name and link, case-insensitively', () => {
		const input = [row('Jane Doe'), row('Sam', { link: 'https://JANE-fan.dev' })];
		expect(selectSubmissions(input, { ...defaults, search: 'jane' }).total).toBe(2);
	});

	it('ignores surrounding whitespace in the search', () => {
		expect(selectSubmissions([row('Jane')], { ...defaults, search: '  jane  ' }).total).toBe(1);
	});

	it('composes filter and search with AND, not OR', () => {
		const input = [row('Jane'), row('Jane Two', { status: 'completed' })];
		const view = selectSubmissions(input, { ...defaults, search: 'jane', status: 'completed' });
		expect(view.rows.map((r) => r.name)).toEqual(['Jane Two']);
	});

	it('reports isFiltered only when a filter is actually applied', () => {
		expect(selectSubmissions([row('A')], defaults).isFiltered).toBe(false);
		expect(selectSubmissions([row('A')], { ...defaults, search: 'a' }).isFiltered).toBe(true);
		expect(selectSubmissions([row('A')], { ...defaults, status: 'pending' }).isFiltered).toBe(true);
	});

	it('keeps totalUnfiltered at the pre-filter count', () => {
		const view = selectSubmissions(rows(5), { ...defaults, search: 'User 1' });
		expect(view.total).toBe(1);
		expect(view.totalUnfiltered).toBe(5);
	});
});

describe('selectSubmissions sorting', () => {
	const input = [
		row('Beta', { _creationTime: 200 }),
		row('alpha', { _creationTime: 100 }),
		row('Gamma', { _creationTime: 300 })
	];

	it('orders newest and oldest by creation time', () => {
		expect(
			selectSubmissions(input, { ...defaults, sort: 'newest' }).rows.map((r) => r.name)
		).toEqual(['Gamma', 'Beta', 'alpha']);
		expect(
			selectSubmissions(input, { ...defaults, sort: 'oldest' }).rows.map((r) => r.name)
		).toEqual(['alpha', 'Beta', 'Gamma']);
	});

	it('sorts by name case-insensitively in both directions', () => {
		expect(
			selectSubmissions(input, { ...defaults, sort: 'name-asc' }).rows.map((r) => r.name)
		).toEqual(['alpha', 'Beta', 'Gamma']);
		expect(
			selectSubmissions(input, { ...defaults, sort: 'name-desc' }).rows.map((r) => r.name)
		).toEqual(['Gamma', 'Beta', 'alpha']);
	});

	it('breaks name ties on creation time so paging stays deterministic', () => {
		const tied = [row('Same', { _creationTime: 1 }), row('Same', { _creationTime: 2 })];
		expect(
			selectSubmissions(tied, { ...defaults, sort: 'name-asc' }).rows.map((r) => r._creationTime)
		).toEqual([2, 1]);
	});

	it('does not mutate the input array', () => {
		const input2 = [row('B', { _creationTime: 1 }), row('A', { _creationTime: 2 })];
		const snapshot = input2.map((r) => r.name);
		selectSubmissions(input2, { ...defaults, sort: 'name-asc' });
		expect(input2.map((r) => r.name)).toEqual(snapshot);
	});
});

describe('selectSubmissions pagination', () => {
	it('slices to the requested page', () => {
		const view = selectSubmissions(rows(25), {
			...defaults,
			sort: 'oldest',
			page: 2,
			pageSize: 10
		});
		expect(view.rows.map((r) => r.name)).toEqual([
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
		const view = selectSubmissions(rows(25), { ...defaults, page: 3, pageSize: 10 });
		expect(view.rows).toHaveLength(5);
		expect(view.rangeEnd).toBe(25);
	});

	// This is what replaces an $effect that would otherwise write page back to 1.
	it('clamps an out-of-range page down to the last page', () => {
		const view = selectSubmissions(rows(12), { ...defaults, page: 9, pageSize: 10 });
		expect(view.page).toBe(2);
		expect(view.rows).toHaveLength(2);
	});

	it('clamps when a filter narrows the result below the current page', () => {
		const view = selectSubmissions(rows(30), {
			...defaults,
			search: 'User 7',
			page: 3,
			pageSize: 10
		});
		expect(view.page).toBe(1);
		expect(view.total).toBe(1);
	});

	it('returns an empty view for no rows', () => {
		const view = selectSubmissions([], defaults);
		expect(view).toMatchObject({
			rows: [],
			total: 0,
			pageCount: 1,
			page: 1,
			rangeStart: 0,
			rangeEnd: 0
		});
	});

	it('treats undefined rows (still loading) as empty', () => {
		expect(selectSubmissions(undefined, defaults).totalUnfiltered).toBe(0);
	});

	it('coerces a zero page size instead of dividing by zero', () => {
		const view = selectSubmissions(rows(3), { ...defaults, pageSize: 0 });
		expect(view.pageCount).toBe(1);
		expect(view.rows).toHaveLength(3);
	});
});
