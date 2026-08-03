import { buildClerkProps } from 'svelte-clerk/server';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
	const auth = locals.auth();

	return {
		// <ClerkProvider> picks `initialState` up off page.data automatically.
		...buildClerkProps(auth),
		// Surfaced separately so ConvexClerkProvider can seed setupAuth's
		// initialState without reaching into Clerk's internal prop shape.
		userId: auth.userId ?? null
	};
};
