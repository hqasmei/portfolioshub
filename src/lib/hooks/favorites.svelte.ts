import { api } from '$convex/_generated/api';
import type { Id } from '$convex/_generated/dataModel';
import { useQuery } from 'convex-svelte';

import { useSession } from './session.svelte.js';

/**
 * Replaces the Next app's src/hooks/use-favorites.tsx. The useState/useEffect
 * pair there collapses into a single $derived — there is no state to sync.
 */
export function useFavorites() {
	const session = useSession();

	const query = useQuery(api.favorites.getFavoritesForUser, () =>
		session.isConvexAuthed ? {} : 'skip'
	);

	const map = $derived(
		new Map<Id<'portfolios'>, Id<'favorites'>>(
			(query.data ?? []).map((fav) => [fav.portfolioId, fav._id])
		)
	);

	return {
		get map() {
			return map;
		},
		get isLoading() {
			return query.isLoading;
		}
	};
}
