import { describe, expect, it } from 'vitest';

import { needsSocials, selectPortfolios, type PortfolioRow } from './portfolios-filter';
import type { SortKey } from './table-view';

const defaults = {
	search: '',
	socials: 'all' as const,
	sort: 'newest' as SortKey,
	page: 1,
	pageSize: 25
};

function row(name: string, over: Partial<PortfolioRow> = {}): PortfolioRow {
	return {
		name,
		link: `https://${name.toLowerCase()}.com`,
		_creationTime: 0,
		socials: ['https://x.com/a'],
		...over
	};
}

describe('needsSocials', () => {
	// The schema has socials as v.optional(v.array(v.string())), so all three occur.
	it('flags a missing socials field', () => {
		expect(needsSocials(row('A', { socials: undefined }))).toBe(true);
	});

	it('flags a present-but-empty socials array', () => {
		expect(needsSocials(row('A', { socials: [] }))).toBe(true);
	});

	it('does not flag a populated socials array', () => {
		expect(needsSocials(row('A'))).toBe(false);
	});
});

describe('selectPortfolios', () => {
	const input = [row('Alpha', { socials: undefined }), row('Beta'), row('Gamma', { socials: [] })];

	it('returns everything when unfiltered', () => {
		const view = selectPortfolios(input, defaults);
		expect(view.total).toBe(3);
		expect(view.isFiltered).toBe(false);
	});

	it('narrows to portfolios still missing socials', () => {
		const view = selectPortfolios(input, { ...defaults, socials: 'needs-socials' });
		expect(view.rows.map((r) => r.name).sort()).toEqual(['Alpha', 'Gamma']);
		expect(view.isFiltered).toBe(true);
	});

	it('narrows to portfolios that already have socials', () => {
		const view = selectPortfolios(input, { ...defaults, socials: 'has-socials' });
		expect(view.rows.map((r) => r.name)).toEqual(['Beta']);
	});

	it('composes the socials filter with search using AND', () => {
		const view = selectPortfolios(input, {
			...defaults,
			socials: 'needs-socials',
			search: 'gam'
		});
		expect(view.rows.map((r) => r.name)).toEqual(['Gamma']);
	});

	it('searches name and link case-insensitively', () => {
		expect(selectPortfolios(input, { ...defaults, search: 'ALPHA' }).total).toBe(1);
		expect(selectPortfolios(input, { ...defaults, search: 'beta.com' }).total).toBe(1);
	});

	it('keeps totalUnfiltered at the pre-filter count', () => {
		const view = selectPortfolios(input, { ...defaults, search: 'alpha' });
		expect(view.total).toBe(1);
		expect(view.totalUnfiltered).toBe(3);
	});

	it('treats undefined rows (still loading) as empty', () => {
		expect(selectPortfolios(undefined, defaults).totalUnfiltered).toBe(0);
	});
});
