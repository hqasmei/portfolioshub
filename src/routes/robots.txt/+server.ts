import { PUBLIC_SITE_URL } from '$env/static/public';
import type { RequestHandler } from './$types';

export const prerender = true;

// Replaces the Next app's src/app/robots.ts.
export const GET: RequestHandler = () => {
	const body = [
		'User-agent: *',
		'Allow: /',
		'Disallow: /admin',
		'Disallow: /privacy',
		'',
		`Sitemap: ${PUBLIC_SITE_URL}/sitemap.xml`,
		''
	].join('\n');

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain' }
	});
};
