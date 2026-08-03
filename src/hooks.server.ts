import { withClerkHandler } from 'svelte-clerk/server';

/**
 * Replaces the Next app's src/middleware.ts. Route protection itself lives in
 * src/routes/(app)/(protected)/+layout.server.ts; this handler only
 * authenticates the request and exposes `event.locals.auth()`.
 *
 * svelte-clerk reads CLERK_SECRET_KEY via $env/dynamic/private and
 * PUBLIC_CLERK_* via $env/dynamic/public, so on Cloudflare these come from the
 * Worker's bindings at runtime rather than being baked in at build time.
 */
export const handle = withClerkHandler();
