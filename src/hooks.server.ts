import { building } from '$app/environment';
import { withClerkHandler } from 'svelte-clerk/server';
import type { Handle } from '@sveltejs/kit';

/**
 * Replaces the Next app's src/middleware.ts. Route protection itself lives in
 * src/routes/(app)/(protected)/+layout.server.ts; this handler only
 * authenticates the request and exposes `event.locals.auth()`.
 *
 * svelte-clerk reads CLERK_SECRET_KEY via $env/dynamic/private and
 * PUBLIC_CLERK_* via $env/dynamic/public, so on Cloudflare these come from the
 * Worker's bindings at runtime rather than being baked in at build time.
 *
 * That means the keys are absent while prerendering, where Clerk would throw
 * "Publishable key is missing". The only prerendered routes are /robots.txt and
 * /sitemap.xml, which are anonymous by definition, so skip authentication
 * entirely during the build.
 */
const authenticate = withClerkHandler();

export const handle: Handle = (input) =>
	building ? input.resolve(input.event) : authenticate(input);
