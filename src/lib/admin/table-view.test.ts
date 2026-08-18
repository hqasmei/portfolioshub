import { describe, expect, it } from 'vitest';

import { ariaSortFor, buildView, matchesSearch, toggleSort, type NamedRow } from './table-view';

function row(name: string, createdAt = 0): NamedRow {
	return { name, link: `https://${name.toLowerCase()}.com`, _creationTime: createdAt };
}

const always = { predicate: () => true, isFiltered: false, sort: 'newest' as const };

describe('matchesSearch', () => {
	it('matches on name and on link, case-insensitively', () => {
		expect(matchesSearch(row('Jane'), 'jan')).toBe(true);
		expect(matchesSearch({ ...row('Sam'), link: 'https://JANE.dev' }, 'jane')).toBe(true);
		expect(matchesSearch(row('Sam'), 'jane')).toBe(false);
	});

	it('treats an empty needle as match-all', () => {
		expect(matchesSearch(row('Anything'), '')).toBe(true);
	});
});

describe('buildView', () => {
	const many = Array.from({ length: 25 }, (_, i) => row(`User ${i}`, i));

	it('does not mutate the source array', () => {
		const source = [row('B', 1), row('A', 2)];
		const snapshot = source.map((r) => r.name);
		buildView(source, { ...always, sort: 'name-asc', page: 1, pageSize: 10 });
		expect(source.map((r) => r.name)).toEqual(snapshot);
	});

	it('slices to the requested page and reports a 1-based range', () => {
		const view = buildView(many, { ...always, sort: 'oldest', page: 2, pageSize: 10 });
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
		const view = buildView(many, { ...always, page: 3, pageSize: 10 });
		expect(view.rows).toHaveLength(5);
		expect(view.rangeEnd).toBe(25);
	});

	// This clamp is what replaces an $effect writing `page` back to 1.
	it('clamps an out-of-range page down to the last page', () => {
		const view = buildView(many, { ...always, page: 99, pageSize: 10 });
		expect(view.page).toBe(3);
	});

	it('reports totalUnfiltered from before the predicate ran', () => {
		const view = buildView(many, {
			...always,
			predicate: (r) => r.name === 'User 7',
			isFiltered: true,
			page: 1,
			pageSize: 10
		});
		expect(view.total).toBe(1);
		expect(view.totalUnfiltered).toBe(25);
	});

	it('returns an empty view for no rows and for undefined rows', () => {
		const empty = { ...always, page: 1, pageSize: 10 };
		expect(buildView([], empty)).toMatchObject({
			rows: [],
			total: 0,
			pageCount: 1,
			page: 1,
			rangeStart: 0,
			rangeEnd: 0
		});
		expect(buildView(undefined, empty).totalUnfiltered).toBe(0);
	});

	it('coerces a zero page size instead of dividing by zero', () => {
		const view = buildView([row('a'), row('b')], { ...always, page: 1, pageSize: 0 });
		expect(view.pageCount).toBe(1);
		expect(view.rows).toHaveLength(2);
	});

	it('sorts by name case-insensitively, tie-breaking on creation time', () => {
		const mixed = [row('Beta', 2), row('alpha', 1), row('alpha', 3)];
		const view = buildView(mixed, { ...always, sort: 'name-asc', page: 1, pageSize: 10 });
		expect(view.rows.map((r) => [r.name, r._creationTime])).toEqual([
			['alpha', 3],
			['alpha', 1],
			['Beta', 2]
		]);
	});
});

describe('sort header helpers', () => {
	it('flips the direction of the column that was clicked', () => {
		expect(toggleSort('newest', 'added')).toBe('oldest');
		expect(toggleSort('oldest', 'added')).toBe('newest');
		expect(toggleSort('name-asc', 'name')).toBe('name-desc');
	});

	it('adopts a sensible default when switching columns', () => {
		expect(toggleSort('name-asc', 'added')).toBe('newest');
		expect(toggleSort('newest', 'name')).toBe('name-asc');
	});

	it('reports aria-sort only for the active column', () => {
		expect(ariaSortFor('newest', 'added')).toBe('descending');
		expect(ariaSortFor('newest', 'name')).toBe('none');
		expect(ariaSortFor('name-asc', 'name')).toBe('ascending');
		expect(ariaSortFor('name-desc', 'added')).toBe('none');
	});
});
