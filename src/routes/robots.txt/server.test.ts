import { describe, expect, it, vi } from 'vitest';

vi.mock('$env/static/public', () => ({ PUBLIC_SITE_URL: 'https://portfolioshub.com' }));

const { GET } = await import('./+server');

const response = () => GET({} as Parameters<typeof GET>[0]) as Response;

describe('GET /robots.txt', () => {
	it('is served as plain text', () => {
		expect(response().headers.get('Content-Type')).toBe('text/plain');
	});

	it('allows crawling and points at the sitemap', async () => {
		const body = await response().text();

		expect(body).toContain('User-agent: *');
		expect(body).toContain('Allow: /');
		expect(body).toContain('Sitemap: https://portfolioshub.com/sitemap.xml');
	});

	it('keeps the private routes out of the index', async () => {
		const body = await response().text();

		expect(body).toContain('Disallow: /admin');
		expect(body).toContain('Disallow: /privacy');
	});

	// The Next app emitted `undefined/sitemap.xml` because its base-url env var
	// was never set.
	it('never emits an undefined origin', async () => {
		expect(await response().text()).not.toContain('undefined');
	});
});
