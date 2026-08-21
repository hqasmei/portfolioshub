import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

// Svelte/Kit configuration lives in svelte.config.js so that mdsvex preprocessing
// and the $convex alias are also picked up by svelte-check and the language server.
export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	test: {
		// Server-side logic only — no component rendering, so no browser env needed.
		environment: 'node',
		// convex/ is included for the pure helpers there (the Convex bundler skips
		// files with two dots, so a *.test.ts next to them is never deployed).
		include: ['src/**/*.test.ts', 'tests/**/*.test.ts', 'convex/**/*.test.ts']
	}
});
