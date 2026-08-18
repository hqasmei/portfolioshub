import { describe, expect, it } from 'vitest';
import { DEFAULT_TITLE, pageTitle } from './seo';
import { CONFIG } from './config';

describe('pageTitle', () => {
	// Mirrors the Next app's metadata title template: `%s | PortfoliosHub`.
	it('suffixes a page title with the site name', () => {
		expect(pageTitle('Templates')).toBe(`Templates | ${CONFIG.name}`);
	});

	it('falls back to the default title when the page has none', () => {
		expect(pageTitle()).toBe(DEFAULT_TITLE);
		expect(pageTitle('')).toBe(DEFAULT_TITLE);
	});

	it('does not double up the site name in the default title', () => {
		expect(DEFAULT_TITLE.match(new RegExp(CONFIG.name, 'g'))).toHaveLength(1);
	});
});
