import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Handle, RequestEvent } from '@sveltejs/kit';

// `withClerkHandler()` is called at module scope, so the spy has to exist before
// the module under test is imported.
const { clerkHandler } = vi.hoisted(() => ({ clerkHandler: vi.fn() }));

vi.mock('svelte-clerk/server', () => ({
	withClerkHandler: () => clerkHandler
}));

/**
 * `building` is a module-level const, so each case needs a fresh module graph.
 */
async function loadHandle(building: boolean): Promise<Handle> {
	vi.resetModules();
	vi.doMock('$app/environment', () => ({ building }));
	return (await import('./hooks.server')).handle;
}

const event = { url: new URL('https://portfolioshub.com/robots.txt') } as RequestEvent;

describe('handle', () => {
	beforeEach(() => {
		clerkHandler.mockReset();
		clerkHandler.mockImplementation(({ event, resolve }) => resolve(event));
	});

	it('authenticates requests at runtime', async () => {
		const handle = await loadHandle(false);
		const resolve = vi.fn(async () => new Response('ok'));

		await handle({ event, resolve });

		expect(clerkHandler).toHaveBeenCalledTimes(1);
		expect(clerkHandler).toHaveBeenCalledWith({ event, resolve });
	});

	it('skips authentication while prerendering', async () => {
		const handle = await loadHandle(true);
		const resolve = vi.fn(async () => new Response('ok'));

		const response = await handle({ event, resolve });

		expect(clerkHandler).not.toHaveBeenCalled();
		expect(resolve).toHaveBeenCalledWith(event);
		expect(await response.text()).toBe('ok');
	});

	// Regression: Clerk's keys come from Worker bindings that do not exist during
	// the build, so running the handler while prerendering threw "Publishable key
	// is missing" and failed the Cloudflare build on /robots.txt and /sitemap.xml.
	it('does not fail the build when Clerk credentials are absent', async () => {
		clerkHandler.mockImplementation(() => {
			throw new Error('Publishable key is missing.');
		});
		const handle = await loadHandle(true);

		await expect(
			handle({ event, resolve: async () => new Response('ok') })
		).resolves.toBeInstanceOf(Response);
	});
});
