/**
 * Portfolio-specific list logic. Mirrors ./submissions-filter, but the dimension
 * an admin actually triages on is whether a portfolio still needs its socials
 * filled in — that is what the old card grid flagged with an orange badge.
 */

import { buildView, matchesSearch, type PageView, type SortKey } from './table-view.js';

export type SocialsFilter = 'all' | 'needs-socials' | 'has-socials';

export type PortfolioRow = {
	_creationTime: number;
	name: string;
	link: string;
	socials?: string[];
};

/** `socials` is optional in the schema and can also be present but empty. */
export function needsSocials(row: PortfolioRow): boolean {
	return !row.socials || row.socials.length === 0;
}

export type SelectPortfolioOptions = {
	search: string;
	socials: SocialsFilter;
	sort: SortKey;
	page: number;
	pageSize: number;
};

export function selectPortfolios<T extends PortfolioRow>(
	rows: readonly T[] | undefined,
	{ search, socials, sort, page, pageSize }: SelectPortfolioOptions
): PageView<T> {
	const needle = search.trim().toLowerCase();

	return buildView(rows, {
		predicate: (row) => {
			if (socials === 'needs-socials' && !needsSocials(row)) return false;
			if (socials === 'has-socials' && needsSocials(row)) return false;
			return matchesSearch(row, needle);
		},
		isFiltered: needle !== '' || socials !== 'all',
		sort,
		page,
		pageSize
	});
}
