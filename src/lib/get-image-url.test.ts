import { describe, expect, it, vi } from 'vitest';

vi.mock('$env/static/public', () => ({
	PUBLIC_CONVEX_URL: 'https://quick-mammal-123.convex.cloud'
}));

const { getImageUrl } = await import('./get-image-url');

describe('getImageUrl', () => {
	// Convex serves http actions from the `.site` sibling of the `.cloud` client
	// URL; hitting `.cloud/getImage` returns a 404.
	it('points at the .site host that serves http actions', () => {
		expect(getImageUrl('abc123')).toBe(
			'https://quick-mammal-123.convex.site/getImage?storageId=abc123'
		);
	});

	it('passes the storage id through as storageId', () => {
		expect(new URL(getImageUrl('kg2p9x')).searchParams.get('storageId')).toBe('kg2p9x');
	});

	it('leaves the deployment name alone', () => {
		expect(getImageUrl('abc123')).toContain('quick-mammal-123');
	});
});
