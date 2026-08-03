import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// Svelte/Kit configuration lives in svelte.config.js so that mdsvex preprocessing
// and the $convex alias are also picked up by svelte-check and the language server.
export default defineConfig({
	plugins: [tailwindcss(), sveltekit()]
});
