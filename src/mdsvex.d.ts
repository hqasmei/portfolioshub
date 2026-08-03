// mdsvex compiles .svx files into Svelte components. This must live in its own
// file with no top-level exports — an ambient wildcard module declaration inside
// app.d.ts would be read as module augmentation instead.
declare module '*.svx' {
	import type { Component } from 'svelte';

	const component: Component;
	export default component;
	export const metadata: Record<string, unknown>;
}
