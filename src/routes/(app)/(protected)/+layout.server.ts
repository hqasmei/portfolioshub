import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

/**
 * Replaces the Next app's src/middleware.ts, which matched
 * ['/dashboard(.*)', '/favorites(.*)', '/admin(.*)'] and called auth().protect().
 */
export const load: LayoutServerLoad = ({ locals, url }) => {
	const { userId } = locals.auth();

	if (!userId) {
		redirect(307, `/sign-in?redirect_url=${encodeURIComponent(url.pathname + url.search)}`);
	}

	return { userId };
};
