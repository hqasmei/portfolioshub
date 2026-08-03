import { PUBLIC_CONVEX_URL } from '$env/static/public';

/**
 * Portfolio and template images live in Convex storage and are served by the
 * `GET /getImage` http action, which is hosted on the `.site` sibling of the
 * `.cloud` client URL. Ported from the Next app's src/lib/get-image-url.ts.
 */
export function getImageUrl(imageKey: string) {
	return `${PUBLIC_CONVEX_URL?.replace('.cloud', '.site')}/getImage?storageId=${imageKey}`;
}
