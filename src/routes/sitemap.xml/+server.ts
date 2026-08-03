import { PUBLIC_SITE_URL } from '$env/static/public';
import type { RequestHandler } from './$types';

export const prerender = true;

/**
 * Replaces the Next app's src/app/sitemap.ts, which listed /about and /posts —
 * neither of which exists — and emitted `undefined/...` because
 * NEXT_PUBLIC_BASE_URL was never set. These are the routes that actually exist.
 */
const routes = [
	'/',
	'/templates',
	'/blog',
	'/changelog',
	'/roadmap',
	'/privacy-policy',
	'/terms-of-service'
];

export const GET: RequestHandler = () => {
	const lastModified = new Date().toISOString();

	const body = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
	.map(
		(route) =>
			`\t<url>\n\t\t<loc>${PUBLIC_SITE_URL}${route === '/' ? '' : route}</loc>\n\t\t<lastmod>${lastModified}</lastmod>\n\t</url>`
	)
	.join('\n')}
</urlset>
`;

	return new Response(body, {
		headers: { 'Content-Type': 'application/xml' }
	});
};
