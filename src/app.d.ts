// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

/// <reference types="svelte-clerk/env" />

declare global {
	namespace App {
		// `Locals.auth()` is declared by svelte-clerk/env (referenced above).
		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env?: {
				CLERK_SECRET_KEY: string;
			};
		}
	}
}

export {};
