import { describe, expect, it, vi } from 'vitest';

vi.mock('$env/static/public', () => ({ PUBLIC_SITE_URL: 'https://portfolioshub.com' }));

const { GET } = await import('./+server');

const response = () => GET({} as Parameters<typeof GET>[0]) as Response;

describe('GET /sitemap.xml', () => {
	it('is served as XML', () => {
		expect(response().headers.get('Content-Type')).toBe('application/xml');
	});

	it('lists the public routes as absolute URLs', async () => {
		const body = await response().text();

		expect(body).toContain('<loc>https://portfolioshub.com/templates</loc>');
		expect(body).toContain('<loc>https://portfolioshub.com/blog</loc>');
		expect(body).toContain('<loc>https://portfolioshub.com/terms-of-service</loc>');
	});

	// `/` is special-cased to '' so the origin does not gain a trailing slash.
	it('emits the home page as a bare origin', async () => {
		expect(await response().text()).toContain('<loc>https://portfolioshub.com</loc>');
	});

	it('omits routes that require authentication', async () => {
		const body = await response().text();

		expect(body).not.toContain('/dashboard');
		expect(body).not.toContain('/favorites');
		expect(body).not.toContain('/admin');
	});

	it('timestamps every entry with a parseable date', async () => {
		const body = await response().text();
		const stamps = [...body.matchAll(/<lastmod>(.*?)<\/lastmod>/g)].map((m) => m[1]);

		expect(stamps).not.toHaveLength(0);
		expect(stamps.every((s) => !Number.isNaN(Date.parse(s)))).toBe(true);
	});

	it('emits one <url> per <loc> and no undefined origin', async () => {
		const body = await response().text();

		expect(body).not.toContain('undefined');
		expect([...body.matchAll(/<url>/g)]).toHaveLength([...body.matchAll(/<loc>/g)].length);
	});
});
